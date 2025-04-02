import pandas as pd
import torch
import numpy as np
from torch.utils.data import Dataset
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from sklearn.utils import resample  

# Enable GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

#  Load Dataset
file_path = file_path = r"C:\Users\RALVA\.spyder-py3\allatt.csv"
df = pd.read_csv(file_path)

#  Define symptom columns
symptom_columns = ['عدم الاهتمام', 'الشعور بالاكتئاب', 'مشاكل النوم', 'طاقة منخفضة',
                   'مشاكل في الشهية', 'الشعور بعدم القيمة', 'ضعف التركيز',
                   'التململ أو البطء', 'أفكار انتحارية', 'الانفعال',
                   'مشاكل جنسية', 'تباطؤ الحركات', 'الرد بجمل قصيرة', 'نبرة صوت رتيبة']


#  Convert "نعم" → 1, "لا" → 0 for symptoms
for col in symptom_columns:
    df[col] = df[col].map({'نعم': 1, 'لا': 0})

#  Combine symptoms into one text input
df['combined_text'] = df[symptom_columns].astype(str).agg(' '.join, axis=1)

#  Define label column (PHQ-9 score as depression severity)
df['label'] = (df['درجة_PHQ-9'] >= 10).astype(int)  # 1 = Depressed, 0 = Not Depressed

#  Remove missing values
df = df[['combined_text', 'label']].dropna()

#  Check class distribution
print("Class distribution before balancing:")
print(df['label'].value_counts())

#  Balance Dataset (Undersampling or Oversampling)
class_0 = df[df['label'] == 0]  # Not Depressed
class_1 = df[df['label'] == 1]  # Depressed

if len(class_0) > len(class_1):
    class_0 = resample(class_0, replace=False, n_samples=len(class_1), random_state=42)  # Undersample
else:
    class_1 = resample(class_1, replace=True, n_samples=len(class_0), random_state=42)  # Oversample

df_balanced = pd.concat([class_0, class_1])

#  Check new distribution
print("Class distribution after balancing:")
print(df_balanced['label'].value_counts())

#  Train-Test Split
train_texts, val_texts, train_labels, val_labels = train_test_split(
    df_balanced['combined_text'].tolist(), df_balanced['label'].tolist(), test_size=0.2, random_state=42
)

#  Load AraBERT Model & Tokenizer
MODEL_NAME = "aubmindlab/bert-base-arabertv02"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2).to(device)

#  Tokenization Function
def tokenize_function(texts):
    return tokenizer(texts, padding=True, truncation=True, max_length=512)

#  Tokenize Dataset
train_encodings = tokenize_function(train_texts)
val_encodings = tokenize_function(val_texts)

#  Create PyTorch Dataset (CPU tensors)
class DepressionDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = {key: torch.tensor(val) for key, val in encodings.items()}  # CPU tensors
        self.labels = torch.tensor(labels, dtype=torch.long)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {key: val[idx] for key, val in self.encodings.items()}  # Keep on CPU
        item["labels"] = self.labels[idx]
        return item

#  Convert to PyTorch Dataset
train_dataset = DepressionDataset(train_encodings, train_labels)
val_dataset = DepressionDataset(val_encodings, val_labels)

#  Training Arguments
training_args = TrainingArguments(
    output_dir="./arabert_finetuned",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=10,
    logging_dir="./logs",
    load_best_model_at_end=True,
    fp16=True if torch.cuda.is_available() else False,
    report_to="none",
)

#  Trainer Object
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
)

#  Train the Model 
trainer.train()

#  Save the fine-tuned model
model.save_pretrained("../arabert_finetuned")
tokenizer.save_pretrained("../arabert_finetuned")

print(" Fine-tuned model saved successfully!")
