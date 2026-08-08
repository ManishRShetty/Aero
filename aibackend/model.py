import torch
import torch.nn as nn
from torchvision.models import resnet18

def load_trained_model(model_path: str, device: torch.device):
    model = resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 7)
    
    try:
        model.load_state_dict(torch.load(model_path, map_location=device, weights_only=False))
        print(f"Successfully loaded model weights from {model_path}")
    except Exception as e:
        print(f"Warning: Could not load weights ({e}). Running with random weights (Mock Mode) so frontend can test.")
    
    model.to(device)
    model.eval()
    return model

def process_and_predict(model, tensor, device):
    with torch.no_grad():
        outputs = model(tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        # FER-2013 classes: 0=Angry, 1=Disgust, 2=Fear, 3=Happy, 4=Sad, 5=Surprise, 6=Neutral
        happy_prob = probabilities[0, 3].item()
        surprise_prob = probabilities[0, 5].item()
        neutral_prob = probabilities[0, 6].item()
        
    # Require a very strong smile ( > 85% ) and ensure it's much higher than neutral
    if happy_prob > 0.85 and happy_prob > (neutral_prob * 2):
        action = "JUMP"
    else:
        action = "NONE"

    return action, happy_prob, neutral_prob, surprise_prob