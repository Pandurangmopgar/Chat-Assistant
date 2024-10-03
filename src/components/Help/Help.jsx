import React, { useState } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import './Help.css';

const faqSections = [
  {
    title: "Getting Started",
    questions: [
      { q: "How do I start a new chat?", a: "Click the 'New Chat' button in the sidebar to begin a fresh conversation." },
      { q: "Can I upload documents?", a: "Yes, you can upload documents by clicking the document icon in the chat input area." }
    ]
  },
  {
    title: "Using the AI Assistant",
    questions: [
      { q: "How do I ask a question?", a: "Simply type your question in the chat input box and press Enter or click the send button." },
      { q: "Can the AI understand context?", a: "Yes, the AI maintains context throughout the conversation for more natural interactions." }
    ]
  },
  {
    title: "Account and Settings",
    questions: [
      { q: "How do I change the theme?", a: "Go to Settings, then Appearance to switch between light and dark modes." },
      { q: "How can I update my account info?", a: "Navigate to Settings, then Account to modify your profile information." }
    ]
  }
];

function Help({ onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState([]);

  const toggleSection = (index) => {
    setExpandedSections(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const filteredFAQs = faqSections.map(section => ({
    ...section,
    questions: section.questions.filter(
      q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
           q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.questions.length > 0);

  const handleContactSupport = () => {
    window.open('/contact-support', '_blank');
  };

  return (
    <div className="help-overlay">
      <div className="help-modal">
        <button className="close-button" onClick={onClose}>
          <FiX />
        </button>
        <div className="help-content">
          <h2>Help Center</h2>
          <div className="help-search">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="faq-section">
            <h3>Frequently Asked Questions</h3>
            {filteredFAQs.map((section, index) => (
              <div key={index} className="faq-category">
                <h4 onClick={() => toggleSection(index)}>
                  {section.title}
                  {expandedSections.includes(index) ? <FiChevronUp /> : <FiChevronDown />}
                </h4>
                {expandedSections.includes(index) && (
                  <ul>
                    {section.questions.map((faq, faqIndex) => (
                      <li key={faqIndex}>
                        <h5>{faq.q}</h5>
                        <p>{faq.a}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="contact-support">
            <h3>Still need help?</h3>
            <p>Our support team is here to assist you.</p>
            <button className="contact-button" onClick={handleContactSupport}>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;