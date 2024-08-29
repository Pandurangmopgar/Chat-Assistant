import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from flask import Flask, request, jsonify
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from flask_cors import CORS
import tempfile
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis
from werkzeug.middleware.proxy_fix import ProxyFix

load_dotenv()

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
CORS(app)

# Add rate limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"]
)

# Use Redis for caching
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Global variables
vectorstore = None
qa_chain = None

def process_pdf(pdf_file):
    text = ""
    pdf_reader = PdfReader(pdf_file)
    for page in pdf_reader.pages:
        text += page.extract_text()
    
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    return chunks

def create_vectorstore(chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model='models/embedding-001')
    vectorstore = FAISS.from_texts(texts=chunks, embedding=embeddings)
    return vectorstore

@app.route('/upload', methods=['POST'])
@limiter.limit("10 per hour")
def upload_file():
    global vectorstore, qa_chain
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and file.filename.endswith('.pdf'):
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            file.save(temp_file.name)
            chunks = process_pdf(temp_file.name)
        os.unlink(temp_file.name)
        vectorstore = create_vectorstore(chunks)
        model = ChatGoogleGenerativeAI(model='gemini-1.5-flash', temperature=0.3)
        qa_chain = load_qa_chain(model, chain_type="stuff")
        return jsonify({"message": "File processed successfully"}), 200
    else:
        return jsonify({"error": "Invalid file format"}), 400

@app.route('/query', methods=['POST'])
@limiter.limit("100 per minute")
def query():
    global vectorstore, qa_chain
    if not vectorstore or not qa_chain:
        return jsonify({"error": "No document uploaded yet"}), 400
    
    user_question = request.json['question']
    
    # Check cache first
    cached_response = redis_client.get(user_question)
    if cached_response:
        return jsonify({"response": cached_response.decode('utf-8')}), 200
    
    docs = vectorstore.similarity_search(user_question)
    response = qa_chain.run(input_documents=docs, question=user_question)
    
    # Cache the response
    redis_client.setex(user_question, 3600, response)  # Cache for 1 hour
    
    return jsonify({"response": response}), 


