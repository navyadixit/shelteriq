import torch
from torchvision import transforms, models
import torch.nn as nn
from PIL import Image
import sys

# Load model
model = models.mobilenet_v2(pretrained=False)
model.classifier[1] = nn.Linear(model.last_channel, 3)
model.load_state_dict(torch.load("backend/model.pth", map_location="cpu"))
model.eval()

classes = ["high", "low", "medium"]

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Test on one image
image_path = sys.argv[1]
image = Image.open(image_path).convert("RGB")
tensor = transform(image).unsqueeze(0)

with torch.no_grad():
    output = model(tensor)
    probabilities = torch.softmax(output, dim=1)
    predicted = torch.argmax(output, dim=1).item()
    confidence = probabilities[0][predicted].item() * 100

print(f"Prediction: {classes[predicted].upper()}")
print(f"Confidence: {confidence:.1f}%")
