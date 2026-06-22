import os
from dotenv import load_dotenv
load_dotenv()
from google import genai

client = genai.Client()
for model in client.models.list():
    if "embed" in model.name or "embed" in getattr(model, "supported_generation_methods", []):
        print(model.name)
