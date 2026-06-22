import os
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import chromadb
from config import CHROMA_PERSIST_DIR, GEMINI_API_KEY

class DocumentLoader:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2", google_api_key=GEMINI_API_KEY)
        self.chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        self.collection_name = "ironmind_knowledge"

    def load_documents(self, docs_dir: str = "data/knowledge_docs"):
        """Load all .txt knowledge documents into ChromaDB."""
        loader = DirectoryLoader(docs_dir, glob="*.txt", loader_cls=TextLoader)
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", " "],
        )
        chunks = splitter.split_documents(documents)

        # Add to ChromaDB
        collection = self.chroma_client.get_or_create_collection(self.collection_name)

        texts = [c.page_content for c in chunks]
        metadatas = [c.metadata for c in chunks]
        ids = [f"chunk_{i}" for i in range(len(chunks))]

        # Get embeddings in batches
        embeddings = self.embeddings.embed_documents(texts)

        collection.upsert(
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )

        print(f"Loaded {len(chunks)} document chunks into ChromaDB")
        return len(chunks)
