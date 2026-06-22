import os
from dotenv import load_dotenv
load_dotenv()
from langchain_google_genai import ChatGoogleGenerativeAI

def test_model(model_name):
    try:
        llm = ChatGoogleGenerativeAI(model=model_name)
        res = llm.invoke("Say hello")
        print(f"SUCCESS: {model_name}")
    except Exception as e:
        print(f"FAILED {model_name}: {e}")

test_model("models/gemini-1.5-pro")
test_model("gemini-1.5-pro")
test_model("gemini-2.5-flash")
test_model("gemini-1.5-flash")
