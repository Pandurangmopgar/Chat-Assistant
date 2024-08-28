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

load_dotenv()

app = Flask(__name__)
CORS(app)

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
def query():
    global vectorstore, qa_chain
    if not vectorstore or not qa_chain:
        return jsonify({"error": "No document uploaded yet"}), 400
    
    user_question = request.json['question']
    docs = vectorstore.similarity_search(user_question)
    response = qa_chain.run(input_documents=docs, question=user_question)
    return jsonify({"response": response}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)