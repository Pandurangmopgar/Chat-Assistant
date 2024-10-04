import React, { useState, useContext } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';
import Settings from '../Settings/Settings';
import Help from '../Help/Help';
import { motion, AnimatePresence } from 'framer-motion';

function Sidebar() {
  const { conversation, startNewChat, darkMode } = useContext(Context);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getPromptPreview = (exchange) => {
    if (typeof exchange === 'object' && exchange.input) {
      return exchange.input.slice(0, 30) + (exchange.input.length > 30 ? '...' : '');
    }
    return 'No preview available';
  };

  const handleNewChat = () => {
    startNewChat();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarVariants = {
    expanded: { width: '260px' },
    collapsed: { width: '60px' }
  };

  return (
    <motion.div 
      className={`sidebar ${darkMode ? 'dark-mode' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
    >
      <div className="top">
        <motion.img 
          className='menu' 
          src={assets.menu_icon} 
          alt='Menu'
          onClick={toggleSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />
      </div>
      <div className="content">
        <motion.div 
          className="new-chat" 
          onClick={handleNewChat}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={assets.plus_icon} alt='New Chat' />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                New Chat
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
        <div className="recent">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p 
                className="recent-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Recent
              </motion.p>
            )}
          </AnimatePresence>
          {Array.isArray(conversation) && conversation.map((exchange, index) => (
            <motion.div 
              key={index} 
              className="recent-item"
              whileHover={{ backgroundColor: darkMode ? '#3a3a3a' : '#f0f0f0' }}
            >
              <img src={assets.message_icon} alt="Message" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {getPromptPreview(exchange)}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
      <div className='bottom'>
        <motion.div 
          className="bottom-item recent-entry" 
          onClick={() => setShowHelp(true)}
          whileHover={{ backgroundColor: darkMode ? '#3a3a3a' : '#f0f0f0' }}
        >
          <img src={assets.question_icon} alt='Help' />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Help
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div 
          className="bottom-item recent-entry" 
          onClick={() => setShowSettings(true)}
          whileHover={{ backgroundColor: darkMode ? '#3a3a3a' : '#f0f0f0' }}
        >
          <img src={assets.setting_icon} alt='Settings' />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Settings
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showHelp && <Help onClose={() => setShowHelp(false)} />}
    </motion.div>
  );
}

export default Sidebar;