from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import os
import csv
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
    """Clean Arabic text response"""
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
    """Generate Arabic interview prompt with cultural context"""
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
    """Generate Arabic psychological response using gpt_client"""
    try:
        prompt, state = generate_arabic_interview_prompt(user_id, message, prediction)
        
        response = gpt_client.generate_response(
            messages=[
                {
                    "role": "system",
                    "content": "أنت أخصائي نفسي عربي تجري مقابلة تشخيصية. استخدم لغة عربية بسيطة وتجنب المصطلحات المعقدة."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=200
        )
        
        if not response:
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

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/predict": {"origins": "*"},
    r"/log_conversation": {"origins": "*"},
    r"/generate-arabic-response": {"origins": "*"}
})

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
    """Advanced Arabic symptom detection with phrase matching"""
    symptoms = {symptom: 0 for symptom in SYMPTOM_KEYWORDS.keys()}
    text = text.lower()
    
    # Special cases that need exact phrase matching
    symptom_patterns = {
        'الشعور بعدم القيمة': [
            r'عديم القيمة', r'بلا قيمة', r'لا فائدة', 
            r'لا اشعر بقيمتي', r'اشعر بعدم القيمة'
        ],
        'ضعف التركيز': [
            r'لا استطيع التركيز', r'ضعف تركيز', r'لا أركز',
            r'تشتت انتباه', r'صعوبة التركيز'
        ],
        'طاقة منخفضة': [
            r'طاقتي منخفضة', r'لا طاقة', r'اشعر بالتعب',
            r'إرهاق', r'خمول'
        ],
        'مشاكل النوم': [
            r'مشاكل في النوم', r'أعاني من النوم', r'أرق',
            r'نوم متقطع', r'صعوبة النوم'
        ],
        'مشاكل في الشهية': [
            r'مشاكل في الشهية', r'اضطراب الشهية', 
            r'لا اشتهي الاكل', r'شهيتي تغيرت'
        ]
    }

    # Check each symptom with its specific patterns
    for symptom, patterns in symptom_patterns.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                symptoms[symptom] = 1
                break
    
    return symptoms

def ensure_data_directory():
    """Create data directory if it doesn't exist"""
    os.makedirs('user_data/conversations', exist_ok=True)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        text = data.get("text", "").strip()
        user_id = data.get("user_id", "anonymous")

        if not text:
            return jsonify({"error": "Empty input text"}), 400

        # Enhanced symptom detection
        symptoms = detect_symptoms(text)
        symptom_count = sum(symptoms.values())

        # Tokenize input
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        inputs = {key: val.to(device) for key, val in inputs.items()}
                                 
        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)

        # Convert to probabilities
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        prediction = torch.argmax(probabilities, dim=-1).item()
        
        # Final decision logic
        if symptom_count >= 3:  # If 3+ symptoms detected, consider depressed
            prediction_label = "Depressed"
            probabilities = torch.tensor([[0.2, 0.8]])  # High confidence
        elif prediction == 1 and symptom_count > 0:  # Model says depressed and some symptoms
            prediction_label = "Depressed"
        else:
            prediction_label = "Not Depressed"

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
            "probabilities": probabilities.tolist(),
            "symptoms": symptoms
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
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

if __name__ == "__main__":
    ensure_data_directory()
    app.run(debug=True)