import React, { useState, useContext } from 'react';
import { FiX, FiChevronDown } from 'react-icons/fi';
import { Context } from '../../context/Context';
import AccountSection from './AccountSection';
import AIPreferencesSection from './AIPreferencesSection';
import './Settings.css';

const settingsSections = [
  { id: 'general', title: 'General', icon: '🌐' },
  { id: 'appearance', title: 'Appearance', icon: '🎨' },
  { id: 'privacy', title: 'Privacy & Security', icon: '🔒' },
  { id: 'notifications', title: 'Notifications', icon: '🔔' },
  { id: 'account', title: 'Account', icon: '👤' },
  { id: 'aiPreferences', title: 'AI Preferences', icon: '🤖' },
];

function Settings({ onClose }) {
  const { darkMode, setDarkMode } = useContext(Context);
  const [activeSection, setActiveSection] = useState('general');

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div>
            <h3>Language</h3>
            <div className="select-wrapper">
              <select className="settings-select">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
              <FiChevronDown className="select-icon" />
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div>
            <h3>Theme</h3>
            <div className="select-wrapper">
              <select 
                className="settings-select"
                value={darkMode ? "dark" : "light"}
                onChange={(e) => setDarkMode(e.target.value === "dark")}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <FiChevronDown className="select-icon" />
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div>
            <h3>Data Collection</h3>
            <div className="toggle-container">
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
              <span>Allow data collection for improving AI</span>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div>
            <h3>Email Notifications</h3>
            <div className="toggle-container">
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
              <span>Receive email updates</span>
            </div>
          </div>
        );
      case 'account':
        return <AccountSection />;
      case 'aiPreferences':
        return <AIPreferencesSection />;
      default:
        return null;
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <button className="close-button" onClick={onClose}>
          <FiX />
        </button>
        <div className="settings-content">
          <div className="settings-sidebar">
            {settingsSections.map((section) => (
              <div
                key={section.id}
                className={`settings-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="section-icon">{section.icon}</span>
                <span>{section.title}</span>
              </div>
            ))}
          </div>
          <div className="settings-main">
            <h2>{settingsSections.find(s => s.id === activeSection).title}</h2>
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;