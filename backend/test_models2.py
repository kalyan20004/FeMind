import os
from dotenv import load_dotenv
load_dotenv()
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def test_model(model_name):
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model=model_name)
        res = embeddings.embed_documents(["hello"])
        print(f"SUCCESS: {model_name}")
    except Exception as e:
        print(f"FAILED {model_name}: {e}")

test_model("models/text-embedding-004")
test_model("text-embedding-004")
test_model("models/embedding-001")
test_model("embedding-001")
test_model("models/gemini-embedding-001")
test_model("models/gemini-embedding-2")
test_model("gemini-embedding-2")
