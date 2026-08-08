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
        confidence, predicted_idx = torch.max(probabilities, dim=1)
        
    conf_score = confidence.item()
    class_id = predicted_idx.item()
    HAPPY_CLASS_INDEX = 3 

    if class_id == HAPPY_CLASS_INDEX and conf_score > 0.70:
        action = "JUMP"
    else:
        action = "NONE"

    return action, conf_score