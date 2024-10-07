import React, { useState, useContext } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';
import Settings from '../Settings/Settings';
import Help from '../Help/Help';

function Sidebar() {
  const { conversation, startNewChat } = useContext(Context);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const getPromptPreview = (exchange) => {
    if (typeof exchange === 'object' && exchange.input) {
      return exchange.input.slice(0, 30);
    }
    return 'No preview available';
  };

  const handleNewChat = () => {
    startNewChat();
  };

  return (
    <div className="sidebar">
      <div className="top">
        <img className='menu' src={assets.menu_icon} alt='Menu' />
      </div>
      <div className="content">
        <div className="new-chat" onClick={handleNewChat}>
          <img src={assets.plus_icon} alt='New Chat' />
          <p>New Chat</p>
        </div>
        <div className="recent">
          <p className="recent-title">Recent</p>
          {Array.isArray(conversation) && conversation.map((exchange, index) => (
            <div key={index} className="recent-item">
              <img src={assets.message_icon} alt="Message" />
              <p>{getPromptPreview(exchange)}...</p>
            </div>
          ))}
        </div>
      </div>
      <div className='bottom'>
        <div className="bottom-item recent-entry" onClick={() => setShowHelp(true)}>
          <img src={assets.question_icon} alt='Help' />
          <p>Help</p>
        </div>
        
        <div className="bottom-item recent-entry" onClick={() => setShowSettings(true)}>
          <img src={assets.setting_icon} alt='Settings' />
          <p>Settings</p>
        </div>
      </div>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showHelp && <Help onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default Sidebar;











const handleUpload = async () => {
  if (files.length === 0 || !department) {
    console.error("Please select files and a department.");
    return;
  }

  setUploadProgress({});

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const presignedUrlResponse = await axios.post(`${API_BASE_URL}/api/getPresignedUrl`, {
        fileName: file.name,
        fileType: file.type,
        department: department
      });

      const { uploadUrl, fileKey, documentId } = presignedUrlResponse.data;

      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [file.name]: percentCompleted }));
        }
      });

      await axios.post(`${API_BASE_URL}/api/confirmUpload`, { fileKey, documentId, department });

      console.log(`${file.name} uploaded successfully!`);
    } catch (error) {
      console.error(`Upload error for ${file.name}:`, error);
    }
  }

  setFiles([]);
  setUploadProgress({});
  fetchDocuments();
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/documents/${id}`);
    setDocuments(documents.filter(doc => doc.id !== id));
    console.log("Document deleted successfully.");
  } catch (error) {
    console.error('Error deleting document:', error);
  }
};
