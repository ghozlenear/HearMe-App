from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from inference import DepressionClassifier
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import csv
import requests
from datetime import datetime
import re
from collections import defaultdict
from dotenv import load_dotenv
from api_utils import gpt_client

load_dotenv()

# Interview protocol in Arabic
INTERVIEW_PROTOCOL_ARABIC = {
    "المراحل": {
        "البداية": {
            "التوجيه": "ابدأ بتحية تعاطفية واشرح الغرض من المحادثة",
            "أقصى_أسئلة": 1
        },
        "التقييم_الاولي": {
            "التوجيه": "اسأل عن المزاج العام، نمط النوم، الشهية، ومستويات الطاقة",
            "أقصى_أسئلة": 3
        },
        "الاستكشاف_العاطفي": {
            "التوجيه": "استكشاف أعمق للحالة العاطفية والمحفزات النفسية",
            "أقصى_أسئلة": 4
        },
        "الآليات_التكيفية": {
            "التوجيه": "مناقشة آليات التعامل الحالية والدعم الاجتماعي",
            "أقصى_أسئلة": 2
        },
        "الختام": {
            "التوجيه": "تقديم تطمينات واقتراح خطوات تالية",
            "أقصى_أسئلة": 1
        }
    },
    "القواعد": [
        "استخدم أسئلة مفتوحة النهاية",
        "حافظ على نبرة محايدة ولكن تعاطفية",
        "تجنب المصطلحات الطبية المعقدة",
        "اعترف بالمشاعر واصرح بها",
        "أعد الصياغة للتأكد من الفهم",
        "تقدم خلال المراحل بشكل تدريجي",
        "استخدم لغة عربية بسيطة وواضحة",
        "ركز على الجوانب الثقافية العربية"
    ],
    "أمثلة_أسئلة": [
        "هل يمكنك أن تصف لني شعورك بالتفصيل؟",
        "كيف أثر هذا الشعور على حياتك اليومية؟",
        "هل هناك مواقف محددة تزيد هذا الشعور؟",
        "ماذا تفعل عادةً لتتعامل مع هذه المشاعر؟",
        "هل لديك أشخاص تدعمك في هذه الأوقات؟"
    ]
}

conversation_states = defaultdict(dict)

def clean_arabic_response(text):
   
    text = re.sub(r'[^\u0600-\u06FF\u0750-\u077F\s,;?()،؛؟]', '', text)
    replacements = {
        ',': '،',
        ';': '؛',
        '?': '؟',
        '(': '',
        ')': ''
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    return text.strip()

def generate_arabic_interview_prompt(user_id, message, prediction):
    
    state = conversation_states[user_id]
    
    if not state:
        state.update({
            "المرحلة": "البداية",
            "خطوة_المرحلة": 0,
            "الإجابات_السابقة": [],
            "التنبؤ": prediction
        })
    
    context = f"""
    [بروتوكول مقابلة نفسية عربية]
    المرحلة الحالية: {state['المرحلة']} ({INTERVIEW_PROTOCOL_ARABIC['المراحل'][state['المرحلة']]['التوجيه']})
    تقدم المرحلة: {state['خطوة_المرحلة']}/{INTERVIEW_PROTOCOL_ARABIC['المراحل'][state['المرحلة']]['أقصى_أسئلة']}
    الإجابات السابقة: {state['الإجابات_السابقة'][-2:]}
    مستوى الاكتئاب: {prediction}
    """
    
    prompt = f"""
    أنت أخصائي نفسي عربي تقوم بمقابلة تشخيصية. اتبع هذه القواعد:
    {INTERVIEW_PROTOCOL_ARABIC['القواعد']}
    
    السياق الحالي:
    {context}
    
    الرسالة الأخيرة من المستخدم:
    {message}
    
    قم بالرد باللغة العربية العامية المناسبة مع:
    1. الحفاظ على هيكل المقابلة التشخيصية
    2. إظهار التعاطف والتفهم الثقافي العربي
    3. استخدام أسئلة من القائمة عند المناسبة: {INTERVIEW_PROTOCOL_ARABIC['أمثلة_أسئلة']}
    4. التقدم الطبيعي بين مراحل المقابلة
    5. مراعاة التنبؤ بالاكتئاب: {prediction}
    """
    return prompt, state
def generate_arabic_response(user_id, message, prediction):
    
    try:
        prompt, state = generate_arabic_interview_prompt(user_id, message, prediction)

        url = "https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions"
        headers = {
            "x-rapidapi-key": os.getenv("RAPIDAPI_KEY"),
            "x-rapidapi-host": "cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com",
            "Content-Type": "application/json"
        }
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "أنت أخصائي نفسي عربي تجري مقابلة تشخيصية. استخدم لغة عربية بسيطة وتجنب المصطلحات المعقدة."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "model": "gpt-4o",
            "max_tokens": 200,
            "temperature": 0.7
        }

        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 429:
            print("Fad l'ápi kids")

        response.raise_for_status()

        reply = response.json()["choices"][0]["message"]["content"]

        # Update conversation state
        state['الإجابات_السابقة'].append(message)
        state['خطوة_المرحلة'] += 1

        if state['خطوة_المرحلة'] >= INTERVIEW_PROTOCOL_ARABIC['المراحل'][state['المرحلة']]['أقصى_أسئلة']:
            stages = list(INTERVIEW_PROTOCOL_ARABIC['المراحل'].keys())
            current_index = stages.index(state['المرحلة'])
            if current_index < len(stages) - 1:
                state['المرحلة'] = stages[current_index + 1]
                state['خطوة_المرحلة'] = 0

        return clean_arabic_response(reply)

    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return "عذرًا، حدث خطأ تقني. هل يمكنك إعادة صياغة سؤالك؟"

        
        # Update conversation state
        state['الإجابات_السابقة'].append(message)
        state['خطوة_المرحلة'] += 1
        
        if state['خطوة_المرحلة'] >= INTERVIEW_PROTOCOL_ARABIC['المراحل'][state['المرحلة']]['أقصى_أسئلة']:
            stages = list(INTERVIEW_PROTOCOL_ARABIC['المراحل'].keys())
            current_index = stages.index(state['المرحلة'])
            if current_index < len(stages) - 1:
                state['المرحلة'] = stages[current_index + 1]
                state['خطوة_المرحلة'] = 0
                
        return clean_arabic_response(response)
    
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return "عذرًا، حدث خطأ تقني. هل يمكنك إعادة صياغة سؤالك؟"

# Load AraBERT Model
MODEL_PATH = os.path.join(os.getcwd(), "arabert_finetuned")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH) 
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Initialize Depression Classifier
classifier = DepressionClassifier(MODEL_PATH)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Limiter IMMEDIATELY after app creation
limiter = Limiter(
    app=app,
    key_func=get_remote_address,  # Limits by client IP
    default_limits=["200 per day", "50 per hour"]  # Global fallback limits
)

# Enhanced symptom detection configuration
SYMPTOM_KEYWORDS = {
    'عدم الاهتمام': ["لا اهتمام", "ملل", "لا أهتم", "فقدان الاهتمام", "عدم اهتمام"],
    'الشعور بالاكتئاب': ["حزين", "اكتئاب", "بائس", "كئيب", "تعيس", "حزن"],
    'مشاكل النوم': ["أرق", "لا أنام", "نوم متقطع", "صعوبة النوم", "أستيقظ ليلا", "نوم سيء"],
    'طاقة منخفضة': ["إرهاق", "تعب", "لا طاقة", "إعياء", "مرهق", "خمول"],
    'مشاكل في الشهية': ["فقدان شهية", "لا أريد أكل", "شهية زائدة", "أكل كثير", "أكل قليل", "اضطراب الشهية"],
    'الشعور بعدم القيمة': ["عديم القيمة", "لا فائدة", "بلا قيمة", "لا يستحق", "تافه", "شعور بعدم الجدوى"],
    'ضعف التركيز': ["لا أركز", "تشتت انتباه", "ضعف تركيز", "نسيان", "شرود", "صعوبة التركيز"],
    'التململ أو البطء': ["تململ", "بطء حركة", "لا أستقر", "حركة زائدة", "بطء", "قلق حركي"],
    'أفكار انتحارية': ["أريد الموت", "انتحار", "لا أريد العيش", "إنهاء حياتي", "الموت أفضل", "تفكير في الموت"],
    'الانفعال': ["غضب سريع", "انفعال", "عصبية", "صراخ", "غضب", "تهيج"],
    'مشاكل جنسية': ["ضعف جنسي", "لا رغبة جنسية", "برود جنسي", "اضطراب جنسي"],
    'تباطؤ الحركات': ["حركة بطيئة", "كسل حركي", "بطء في الحركة", "خمول حركي"],
    'الرد بجمل قصيرة': ["إجابات قصيرة", "لا أحب الكلام", "ردود مختصرة", "تكلم قليل"],
    'نبرة صوت رتيبة': ["صوت ممل", "لا تعابير صوتية", "صوت رتيب", "نبرة واحدة"]
}


def detect_symptoms(text):
    
    symptoms = {symptom: 0 for symptom in SYMPTOM_KEYWORDS.keys()}
    text = text.lower()

    symptom_patterns = {
        'الشعور بالاكتئاب': [
            r'أشعر بالاكتئاب', r'أشعر بالحزن', r'أنا حزين',
            r'أشعر بالوحدة', r'أشعر بأنني وحيد', r'أشعر أنني وحيد',
            r'أشعر بالحزن الشديد', r'كل شيء مظلم', r'لا شيء يفرحني',
            r'أشعر بأنني محطم', r'أشعر بالكآبة'
    ],

        'عدم الاهتمام': [
            r'لا أجد أي معنى', r'لا أهتم', r'فقدت الاهتمام', r'لا يهمني شيء',
            r'الأشياء لم تعد تهمني'
        ],
        'الشعور بعدم القيمة': [
            r'عديم القيمة', r'بلا قيمة', r'لا فائدة', r'لا أشعر بقيمتي',
            r'أشعر بعدم القيمة'
        ],
        'ضعف التركيز': [
            r'لا أستطيع التركيز', r'ضعف تركيز', r'لا أركز',
            r'تشتت انتباه', r'صعوبة التركيز'
        ],
        'طاقة منخفضة': [
            r'طاقتي منخفضة', r'لا طاقة', r'أشعر بالتعب', r'إرهاق', r'خمول', r'أنا متعب'
        ],
        'مشاكل النوم': [
            r'مشاكل في النوم', r'أعاني من النوم', r'أرق',
            r'نوم متقطع', r'صعوبة النوم'
        ],
        'مشاكل في الشهية': [
            r'مشاكل في الشهية', r'اضطراب الشهية', 
            r'لا أشتهي الأكل', r'شهيتي تغيرت'
        ],
        'أفكار انتحارية': [
            r'أفكر في الانتحار', r'أتمنى الموت', r'أريد أن أنتهي', r'أفكر أن أنهي حياتي'
        ],
        'الانفعال': [
            r'أنا غاضب', r'أشعر بالعصبية', r'أفقد أعصابي بسهولة'
        ],
        'تباطؤ الحركات': [
            r'أتحرك ببطء', r'لا أستطيع النهوض', r'أشعر بأن جسدي ثقيل'
        ],
        'التململ أو البطء': [
            r'لا أستطيع الجلوس ساكنًا', r'أتحرك كثيرًا بدون سبب'
        ]
        # Add more patterns for the remaining if needed
    }

    for symptom, patterns in symptom_patterns.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                symptoms[symptom] = 1
                break

    return symptoms
def generate_chatbot_reply(prediction, symptoms):

    if prediction == "Depressed":
        detected_symptoms = [symptom for symptom, present in symptoms.items() if present]
        
        if 'أفكار انتحارية' in detected_symptoms:
            return {
                "immediate_response": "أنا قلق بشأن ما ذكرته من أفكار انتحارية. هذه علامة مهمة تحتاج إلى دعم فوري.",
                "follow_up_question": "هل يمكنك مشاركة المزيد عن هذه الأفكار؟",
                "suggested_action": "يوصى بالاتصال بخط المساعدة النفسية المحلي أو التوجه إلى أقرب مركز صحة نفسية"
            }
        
        symptom_responses = {
            'الشعور بعدم القيمة': "أنا أسمع أنك تشعر بعدم القيمة.",
            'ضعف التركيز': "يبدو أنك تواجه صعوبة في التركيز.",
            'طاقة منخفضة': "أرى أن طاقتك منخفضة مؤخرًا.",
            'مشاكل النوم': "لاحظت أنك تعاني من مشاكل في النوم.",
            'مشاكل في الشهية': "يبدو أن شهيتك قد تغيرت."
        }
        
        response_parts = ["أنا ألاحظ بعض العلامات التي قد تحتاج إلى انتباه:"]
        for symptom in detected_symptoms:
            if symptom in symptom_responses:
                response_parts.append(symptom_responses[symptom])
        
        return {
            "immediate_response": "\n".join(response_parts),
            "follow_up_question": "كيف تؤثر هذه المشاعر على حياتك اليومية؟",
            "suggested_action": "قد يكون من المفيد التحدث مع أخصائي صحة نفسية"
        }
    else:
        return {
            "immediate_response": "شكرًا لمشاركة مشاعرك.",
            "follow_up_question": "هل هناك أي شيء آخر تريد التحدث عنه؟",
            "suggested_action": "استمر في مراقبة مشاعرك ولا تتردد في طلب المساعدة إذا احتجت"
        }
    

def ensure_data_directory():
    os.makedirs('user_data/conversations', exist_ok=True)

    

@app.route("/predict", methods=["POST"])
@limiter.limit("10 per minute") 
def predict():
    try:
        data = request.json
        text = data.get("text", "").strip()
        user_id = data.get("user_id", "anonymous")

        if not text:
            return jsonify({"error": "Empty input text"}), 400

        # Get prediction from classifier
        predicted_class, probabilities = classifier.predict(text)
        prediction_label = "Depressed" if predicted_class == 1 else "Not Depressed"

        positive_phrases = ["بخير", "أنا بخير", "تمام", "لا أشعر بالحزن", "سعيد", "مرتاح"]
        if any(p in text for p in positive_phrases):
            prediction_label = "Not Depressed"
            probabilities = [[0.9, 0.1]]

        # Detect symptoms (using your existing function)
        symptoms = detect_symptoms(text)
        symptom_count = sum(symptoms.values())

        # Enhanced decision logic
        if symptom_count >= 3:  # Override if multiple symptoms present
            prediction_label = "Depressed"
            probabilities = {"Not Depressed": 0.2, "Depressed": 0.8}

        # Generate responses 
        chatbot_reply = generate_chatbot_reply(prediction_label, symptoms)
        gpt_response = generate_arabic_response(user_id, text, prediction_label)

        # Save results 
        ensure_data_directory()
        today = datetime.now().strftime("%Y-%m-%d")
        file_path = f'user_data/conversations/{today}.csv'

        if not os.path.exists(file_path):
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(["timestamp", "user_id", "message", "prediction", *SYMPTOM_KEYWORDS.keys()])

        with open(file_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                datetime.now().isoformat(), 
                user_id, 
                text, 
                prediction_label,
                *[symptoms.get(symptom, 0) for symptom in SYMPTOM_KEYWORDS.keys()]
            ])

        return jsonify({
            "prediction": prediction_label,
            "probabilities": probabilities,
            "symptoms": symptoms,
            "reply": {
                "structured": chatbot_reply,
                "generated": gpt_response
            }
        })

    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.route("/generate-arabic-response", methods=["POST"])
def generate_arabic_response_endpoint():
    try:
        data = request.json
        user_id = data.get("user_id")
        message = data.get("message", "")
        prediction = data.get("prediction", "غير محدد")
        
        response = generate_arabic_response(user_id, message, prediction)
        return jsonify({"response": response})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": "arabert",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/deep_health', methods=['GET'])
def deep_health_check():
    """Comprehensive system health check"""
    try:
        # Test model prediction
        test_text = "اختبار النظام"
        inputs = tokenizer(test_text, return_tensors="pt").to(device)
        model(**inputs)

        # Test storage
        test_file = os.path.join('user_data', 'healthcheck.tmp')
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("نظام يعمل\n")
        os.remove(test_file)

        return jsonify({
            "status": "healthy",
            "components": ["model", "storage"],
            "arabic_support": True
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.errorhandler(429)
def ratelimit_error(e):
    return jsonify({
        "error": "Rate limit exceeded",
        "message": "Too many requests. Please try again later."
    }), 429
    
if __name__ == "__main__":
    ensure_data_directory()
    app.run(debug=True, port=5000)