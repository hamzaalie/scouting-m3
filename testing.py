from rfdetr import RFDETRSmall
import supervision as sv
from PIL import Image
import torch

print(f"✅ PyTorch: {torch.__version__}")
print(f"✅ CUDA available: {torch.cuda.is_available()}")
print("✅ All libraries loaded successfully!")