import React, { useState, useContext, useEffect } from 'react';
import { Context } from '../../context/Context';

function AIPreferencesSection() {
  const { aiPreferences, setAIPreferences } = useContext(Context);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    setCustomPrompt(aiPreferences.customPrompt || '');
  }, [aiPreferences.customPrompt]);

  const handleSavePreferences = () => {
    setAIPreferences({ ...aiPreferences, customPrompt });
    alert('AI Preferences saved successfully!');
  };

  return (
    <div className="ai-preferences-section">
      <h3>Custom System Prompt</h3>
      <p>Customize how the AI assistant behaves by providing a system prompt:</p>
      <textarea
        className="custom-prompt-input"
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        placeholder="E.g., You are a helpful assistant that specializes in programming and technology."
        rows={5}
      />
      <button className="save-preferences-button" onClick={handleSavePreferences}>
        Save Preferences
      </button>
    </div>
  );
}

export default AIPreferencesSection;