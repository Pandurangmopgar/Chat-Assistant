import React, { useContext } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';

function Sidebar() {
  const { conversation, startNewChat } = useContext(Context);

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
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt='Help' />
          <p>Help</p>
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} alt='Activity' />
          <p>Activity</p>
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.setting_icon} alt='Settings' />
          <p>Settings</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;