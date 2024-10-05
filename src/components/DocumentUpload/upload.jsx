import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import './AdminDocumentUpload.css';

// Set the base URL for all API calls
const API_BASE_URL = 'http://localhost:3000';

const AdminDocumentUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setUploadStatus('Error fetching documents. Please try again.');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file.');
      return;
    }

    try {
      setUploadStatus('Initiating upload...');
      setUploadProgress(0);

      // Step 1: Get pre-signed URL
      const presignedUrlResponse = await axios.post(`${API_BASE_URL}/api/getPresignedUrl`, {
        fileName: file.name,
        fileType: file.type
      });

      const { uploadUrl, fileKey, documentId } = presignedUrlResponse.data;

      // Step 2: Upload to S3
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      // Step 3: Confirm upload
      await axios.post(`${API_BASE_URL}/api/confirmUpload`, { fileKey, documentId });

      setUploadStatus('File uploaded successfully!');
      setFile(null);
      setUploadProgress(0);
      fetchDocuments(); // Refresh the document list
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Error uploading file. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
      setUploadStatus('Document deleted successfully.');
    } catch (error) {
      console.error('Error deleting document:', error);
      setUploadStatus('Error deleting document. Please try again.');
    }
  };

  return (
    <motion.div 
      className="admin-document-upload"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Admin Document Management</h1>
      <motion.div 
        className="upload-section"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input 
          type="file" 
          onChange={handleFileChange} 
          id="file-input"
          className="file-input"
          accept=".pdf,.txt"
        />
        <label htmlFor="file-input" className="file-label">
          <FiUpload />
          <span>{file ? file.name : 'Choose a file'}</span>
        </label>
        <motion.button 
          onClick={handleUpload} 
          disabled={!file}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Upload Document
        </motion.button>
      </motion.div>
      {uploadStatus && (
        <motion.p 
          className="status"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {uploadStatus}
        </motion.p>
      )}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      <div className="document-list">
        <h2>Uploaded Documents</h2>
        {documents.map((doc) => (
          <motion.div 
            key={doc.id} 
            className="document-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <FiFile className="doc-icon" />
            <span>{doc.original_name}</span>
            <motion.button 
              onClick={() => handleDelete(doc.id)} 
              className="delete-btn"
              whileHover={{ scale: 1.1, color: '#ff4d4d' }}
              whileTap={{ scale: 0.9 }}
            >
              <FiTrash2 />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminDocumentUpload;