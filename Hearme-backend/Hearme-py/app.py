from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import os
import csv
from datetime import datetime

# Load Fine-Tuned AraBERT Model
MODEL_PATH = os.path.join(os.getcwd(), "arabert_finetuned")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH) 
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

# Enable GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/predict": {"origins": "*"},
    r"/log_conversation": {"origins": "*"}
})

# Symptom detection configuration
SYMPTOM_KEYWORDS = {
    'عدم الاهتمام': ["لا اهتمام", "ملل", "لا أهتم"],
    'الشعور بالاكتئاب': ["حزين", "اكتئاب", "بائس"],
    'مشاكل النوم': ["أرق", "لا أنام", "نوم متقطع"],
    'طاقة منخفضة': ["إرهاق", "تعب", "لا طاقة"],
    'مشاكل في الشهية': ["فقدان شهية", "لا أريد أكل", "شهية زائدة"],
    'الشعور بعدم القيمة': ["عديم القيمة", "لا فائدة", "بلا قيمة"],
    'ضعف التركيز': ["لا أركز", "تشتت انتباه", "ضعف تركيز"],
    'التململ أو البطء': ["تململ", "بطء حركة", "لا أستقر"],
    'أفكار انتحارية': ["أريد الموت", "انتحار", "لا أريد العيش"],
    'الانفعال': ["غضب سريع", "انفعال", "عصبية"],
    'مشاكل جنسية': ["ضعف جنسي", "لا رغبة جنسية"],
    'تباطؤ الحركات': ["حركة بطيئة", "كسل حركي"],
    'الرد بجمل قصيرة': ["إجابات قصيرة", "لا أحب الكلام"],
    'نبرة صوت رتيبة': ["صوت ممل", "لا تعابير صوتية"]
}

def detect_symptoms(text):
    """Detect depression symptoms in Arabic text"""
    symptoms = {}
    for symptom, keywords in SYMPTOM_KEYWORDS.items():
        symptoms[symptom] = 1 if any(keyword in text for keyword in keywords) else 0
    return symptoms

def ensure_data_directory():
    """Create data directory if it doesn't exist"""
    os.makedirs('user_data/conversations', exist_ok=True)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        text = data.get("text", "").strip()
        user_id = data.get("user_id", "anonymous")  # fallback if no user_id

        if not text:
            return jsonify({"error": "Empty input text"}), 400

        # Tokenize input
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        inputs = {key: val.to(device) for key, val in inputs.items()}
        
          # Detect symptoms
        symptoms = detect_symptoms(text)

        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)

        # Convert to probabilities
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        prediction = torch.argmax(probabilities, dim=-1).item()
        prediction_label = "Depressed" if prediction == 1 else "Not Depressed"

        

        if prediction_label == "Depressed" and sum(symptoms.values()) == 0:
            prediction_label = "Not Depressed"
        
      

        #  Save to CSV
        ensure_data_directory()
        today = datetime.now().strftime("%Y-%m-%d")
        file_path = f'user_data/conversations/{today}.csv'

        if not os.path.exists(file_path):
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    "timestamp", "user_id", "message", "prediction", *SYMPTOM_KEYWORDS.keys()
                ])

        with open(file_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                datetime.now().isoformat(), user_id, text, prediction_label,
                *[symptoms.get(symptom, 0) for symptom in SYMPTOM_KEYWORDS.keys()]
            ])

        return jsonify({
            "prediction": prediction_label,
            "probabilities": probabilities.tolist(),
            "symptoms": symptoms
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/log_conversation", methods=["POST"])
def log_conversation():
    try:
        ensure_data_directory()
        data = request.json
        
        # Validate required fields
        required_fields = ['user_id', 'message', 'prediction', 'symptoms']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Create daily CSV file
        today = datetime.now().strftime("%Y-%m-%d")
        file_path = f'user_data/conversations/{today}.csv'
        
        # Write headers if file doesn't exist
        if not os.path.exists(file_path):
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    "timestamp",
                    "user_id",
                    "message",
                    "prediction",
                    *SYMPTOM_KEYWORDS.keys()  # All symptom columns
                ])
        
        # Append the conversation
        with open(file_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                datetime.now().isoformat(),
                data['user_id'],
                data['message'],
                data['prediction'],
                *[data['symptoms'].get(symptom, 0) for symptom in SYMPTOM_KEYWORDS.keys()]
            ])
        
        return jsonify({"status": "success"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Basic system status"""
    return jsonify({
        "status": "healthy",
        "model": "arabert",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/deep_health', methods=['GET'])
def deep_health_check():
    """Verify all critical components"""
    try:
        # Test model prediction
        test_text = "اختبار النظام"
        inputs = tokenizer(test_text, return_tensors="pt").to(device)
        model(**inputs)  # Test inference

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
    # Create data directory when starting the app
    ensure_data_directory()
    app.run(debug=True)