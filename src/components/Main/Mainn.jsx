import React, { useRef, useContext } from 'react';
import './Main.css';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { assets } from '../../assets/assets';
import { FiFile } from 'react-icons/fi';
import { Context } from '../../context/Context';
import { useUser } from '@clerk/clerk-react';

const Mainn = () => {
  const { 
    input, 
    setInput, 
    conversation, 
    loading, 
    showInitialContent, 
    onSent, 
    uploadDocument, 
    uploadedDocumentName 
  } = useContext(Context);
  const { user } = useUser();
  const fileInputRef = useRef(null);
  const conversationEndRef = useRef(null);

  const cardData = [
    { text: "Suggest beautiful places to see on an upcoming road trip", icon: "compass" },
    { text: "Briefly summarize this concept: urban planning", icon: "bulb" },
    { text: "Brainstorm team bonding activities for our work retreat", icon: "bulb" },
    { text: "Improve the readability of the following code", icon: "code" },
  ];

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
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      } else {
        return user.firstName[0].toUpperCase();
      }
    }
    return 'U';
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadDocument(file);
        // You might want to add some UI feedback here
        console.log('File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error);
        // Handle error (e.g., show an error message to the user)
      }
    }
  };

  return (
    <div className='main'>
      <div className='top-bar'>
        <p className='assistant-label'>Assistant</p>
        <div className='user-auth'>
          <SignedIn>
            <UserButton showName />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="sign-in-button">Sign In</button>
            </SignInButton>
          </SignedOut>
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
                    <img src={assets[`${card.icon}_icon`]} alt={card.icon} />
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
            <button type="button" className="image-upload-btn">
              <img src={assets.gallery_icon} alt="Upload image" />
            </button>
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
      </div>
    </div>
  );
}

export default Mainn;