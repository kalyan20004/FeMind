import chromadb
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import CHROMA_PERSIST_DIR, GEMINI_API_KEY
from rag.loader import DocumentLoader

class KnowledgeRetriever:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2", google_api_key=GEMINI_API_KEY)
        self.chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        self.collection = None

    def initialize(self):
        """Load docs if ChromaDB is empty, else reuse existing."""
        try:
            self.collection = self.chroma_client.get_collection("ironmind_knowledge")
            count = self.collection.count()
            if count == 0:
                raise ValueError("Empty collection")
            print(f"Knowledge base loaded: {count} chunks")
        except Exception:
            loader = DocumentLoader()
            loader.load_documents()
            self.collection = self.chroma_client.get_collection("ironmind_knowledge")

    def retrieve(self, query: str, asset_id: str = None, n_results: int = 4) -> list:
        """
        Retrieve relevant document chunks for a query.
        Returns list of relevant text chunks.
        """
        query_embedding = self.embeddings.embed_query(query)

        # If asset_id given, try to filter for that asset's docs
        where = None
        if asset_id:
            # ChromaDB where filter (only if metadata has asset info)
            pass

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
        )

        chunks = results["documents"][0] if results["documents"] else []
        return chunks
