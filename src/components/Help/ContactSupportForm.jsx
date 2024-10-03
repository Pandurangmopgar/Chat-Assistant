import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import './ContactSupportPage.css';

function ContactSupportPage() {
  const { user } = useUser();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [includeSystemInfo, setIncludeSystemInfo] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.primaryEmailAddress?.emailAddress || '');
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send this data to your backend
    console.log({ subject, description, email, includeSystemInfo });
    alert('Your support request has been submitted. We will respond within 24 hours.');
  };

  return (
    <div className="contact-support-page">
      <h1>Contact Support</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Topic</label>
          <select 
            id="subject"
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="">Select a topic</option>
            <option value="account">Account Issues</option>
            <option value="billing">Billing Questions</option>
            <option value="technical">Technical Support</option>
            <option value="feature">Feature Request</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue or question"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={includeSystemInfo}
              onChange={(e) => setIncludeSystemInfo(e.target.checked)}
            />
            Include system information and recent chat logs
          </label>
        </div>
        <button type="submit" className="submit-button">Submit Request</button>
      </form>
    </div>
  );
}

export default ContactSupportPage;