import React, { useContext, useRef, useEffect } from 'react';
import './Main.css';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { assets } from '../../assets/assets';
import { FiMoon, FiSun, FiFile, FiCalendar, FiShield, FiWifi, FiDollarSign } from 'react-icons/fi';
import { Context } from '../../context/Context';

const Mainn = () => {
  const { 
    input, 
    setInput, 
    conversation, 
    loading, 
    showInitialContent, 
    onSent, 
    uploadDocument, 
    uploadedDocumentName,
    darkMode,
    setDarkMode,
    selectedImage,
    uploadImage,
    registerUser  // Add this line to get registerUser from context
  } = useContext(Context);
  const { user, isSignedIn } = useUser();
  const fileInputRef = useRef(null);
  const conversationEndRef = useRef(null);
  const imageInputRef = useRef(null);

  const cardData = [
    { text: "What are the steps to apply for casual leave?", icon: <FiCalendar /> },
    { text: "Summarize the key points of the new IT security policy", icon: <FiShield /> },
    { text: "List common troubleshooting steps for network connectivity issues", icon: <FiWifi /> },
    { text: "How do I submit a travel reimbursement claim?", icon: <FiDollarSign /> },
  ];

  useEffect(() => {
    if (isSignedIn && user) {
      registerUser(user);
    }
  }, [isSignedIn, user, registerUser]);

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      await onSent();
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.firstName) {
      const names = user.firstName.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : user.firstName[0].toUpperCase();
    }
    return 'U';
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadDocument(file);
        console.log('File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error);
        // TODO: Add user-facing error message
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  return (
    <div className={`main ${darkMode ? 'dark-mode' : ''}`}>
      <div className='top-bar'>
        <div className='left-section'>
          <p className='assistant-label'>Assistant</p>
        </div>
        <div className='right-section'>
          <button 
            className="dark-mode-toggle" 
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          <div className='user-auth' >
            <SignedIn>
              <UserButton showName />
            </SignedIn>
            <SignedOut>
            <SignInButton mode="modal" redirectUrl="/">
                <button className="sign-in-button">Sign In</button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
      <div className="main-content">
        {showInitialContent ? (
          <>
            <div className="greet">
              <h2>Hello, <span className="name">{user?.firstName || "User"}</span></h2>
              <p className="assistant-label">How can I help you today?</p>
            </div>
            <div className="cards">
              {cardData.map((card, index) => (
                <div key={index} className="card" onClick={() => setInput(card.text)}>
                  <div className="card-content">{card.text}</div>
                  <div className="card-icon">
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="conversation-wrapper">
            <div className="conversation">
              {conversation.map((exchange, index) => (
                <div key={index} className="exchange">
                  <div className="user-message-container">
                    <div className="user-message">
                      <div className="user-avatar">
                        {getUserInitials()}
                      </div>
                      <div className="message-text">{exchange.input}</div>
                    </div>
                  </div>
                  {exchange.response && (
                    <div className="assistant-message-container">
                      <div 
                        className="assistant-message"
                        dangerouslySetInnerHTML={{ __html: exchange.response }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {loading && <div className="loading">Loading...</div>}
              <div ref={conversationEndRef} />
            </div>
          </div>
        )}
      </div>
      <div className="search-card">
        <form onSubmit={handleSubmit} className="search-box">
          <div className="search-box-input">
            <textarea 
              placeholder="Enter a prompt here" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            ></textarea>
          </div>
          <div className="search-box-buttons">
            <button type="button" className="image-upload-btn" onClick={() => imageInputRef.current.click()}>
             <img src={assets.gallery_icon} alt="Image" />
            </button>
            <input 
              type="file" 
              ref={imageInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageUpload}
              accept="image/*"
            />
            <button type="button" className="document-upload-btn" onClick={() => fileInputRef.current.click()}>
              <FiFile />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
              accept=".pdf"
            />
            <button type="submit" className="send-btn" disabled={!input.trim() || loading}>
              <img src={assets.send_icon} alt="Send" />
            </button>
          </div>
        </form>
        {uploadedDocumentName && (
          <div className="uploaded-document">
            <FiFile /> {uploadedDocumentName}
          </div>
        )}
        {selectedImage && (
          <div className="selected-image">
            <img src={selectedImage} alt="Selected" style={{ maxWidth: '100px', maxHeight: '100px' }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Mainn;