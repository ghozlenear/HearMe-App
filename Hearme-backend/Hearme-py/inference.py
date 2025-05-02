import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import Dict, Tuple

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class DepressionClassifier:
    def __init__(self, model_path: str):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        self.model.eval()
        
    def predict(self, text: str) -> Tuple[int, Dict[str, float]]:
        """Predict depression and return class with probabilities"""
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=512
        ).to(device)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        predicted_class = torch.argmax(probs, dim=1).item()
        probabilities = {
            "Not Depressed": probs[0][0].item(),
            "Depressed": probs[0][1].item()
        }
        
        return predicted_class, probabilities

# Example usage:
if __name__ == "__main__":
    classifier = DepressionClassifier(r"C:\Users\RALVA\Documents\startup\Hearme-backend\Hearme-py\arabert_finetuned")
    test_text = "أشعر بالحزن الشديد ولا أريد فعل أي شيء"
    class_idx, probs = classifier.predict(test_text)
    print(f"Prediction: {'Depressed' if class_idx == 1 else 'Not Depressed'}")
    print(f"Probabilities: {probs}")