from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import os
#ramy was here

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
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        text = data.get("text", "").strip()

        if not text:
            return jsonify({"error": "Empty input text"}), 400

        # Tokenize input
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        inputs = {key: val.to(device) for key, val in inputs.items()}

        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)

        # Convert to probabilities
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        prediction = torch.argmax(probabilities, dim=-1).item()

        # Convert prediction to human-readable labels
        labels = ["Not Depressed", "Depressed"]

        return jsonify({
            "prediction": labels[prediction],
            "probabilities": probabilities.tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
