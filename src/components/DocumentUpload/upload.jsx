import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import './AdminDocumentUpload.css';

const API_BASE_URL = 'http://localhost:3000';

const AdminDocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [department, setDepartment] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

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
    setFiles(Array.from(event.target.files));
  };

  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
  };

  const handleUpload = async () => {
    if (files.length === 0 || !department) {
      setUploadStatus('Please select files and a department.');
      return;
    }

    setUploadStatus('Initiating upload...');
    setUploadProgress({});

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Step 1: Get pre-signed URL
        const presignedUrlResponse = await axios.post(`${API_BASE_URL}/api/getPresignedUrl`, {
          fileName: file.name,
          fileType: file.type,
          department: department
        });

        const { uploadUrl, fileKey, documentId } = presignedUrlResponse.data;

        // Step 2: Upload to S3
        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [file.name]: percentCompleted }));
          }
        });

        // Step 3: Confirm upload
        await axios.post(`${API_BASE_URL}/api/confirmUpload`, { fileKey, documentId, department });

        setUploadStatus(prev => `${prev}\n${file.name} uploaded successfully!`);
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
        setUploadStatus(prev => `${prev}\nError uploading ${file.name}. Please try again.`);
      }
    }

    setFiles([]);
    setUploadProgress({});
    fetchDocuments(); // Refresh the document list
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
          multiple
        />
        <label htmlFor="file-input" className="file-label">
          <FiUpload />
          <span>{files.length > 0 ? `${files.length} files selected` : 'Choose files'}</span>
        </label>
        <select 
          value={department} 
          onChange={handleDepartmentChange}
          className="department-select"
        >
          <option value="">Select Department</option>
          <option value="hr">HR</option>
          <option value="it">IT</option>
          <option value="other">Other</option>
        </select>
        <motion.button 
          onClick={handleUpload} 
          disabled={files.length === 0 || !department}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Upload Documents
        </motion.button>
      </motion.div>
      {uploadStatus && (
        <motion.pre 
          className="status"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {uploadStatus}
        </motion.pre>
      )}
      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="progress-bar-container">
          <span>{fileName}</span>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      ))}
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
            <span className="document-department">{doc.department}</span>
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