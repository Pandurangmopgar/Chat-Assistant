import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";

function AccountSection() {
  const { user } = useUser();
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setDisplayName(user.firstName || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await user.update({
        firstName: displayName,
        lastName: fullName.split(' ').slice(1).join(' ')
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="account-section">
      <h3>Account Information</h3>
      <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
      
      <div className="input-group">
        <label htmlFor="fullName">Full Name</label>
        <input 
          type="text" 
          id="fullName" 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="displayName">What should we call you?</label>
        <input 
          type="text" 
          id="displayName" 
          value={displayName} 
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      
      <button className="update-profile-button" onClick={handleUpdateProfile}>
        Update Profile
      </button>
    </div>
  );
}

export default AccountSection;