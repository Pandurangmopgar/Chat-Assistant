import React, { createContext, useState, useCallback, useEffect } from "react";
import run from "../config/gemini.js"; // Make sure this path is correct
// import { useState, useEffect } from 'react';

export const Context = createContext();

export const ContextProvider = ({ children }) => {
    const [input, setInput] = useState("");
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInitialContent, setShowInitialContent] = useState(true);
    const [documentUploaded, setDocumentUploaded] = useState(false);
    const [uploadedDocumentName, setUploadedDocumentName] = useState(""); // Add this line
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    const formatResponse = (response) => {
        let parts = response.split(/(\*\*)/);
        let formattedResponse = "";
        let isBold = false;
        let isNewLine = true;

        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === '**') {
                isBold = !isBold;
                if (isBold) {
                    formattedResponse += isNewLine ? '<b>' : '<br><b>';
                    isNewLine = false;
                } else {
                    formattedResponse += '</b>: ';
                }
            } else {
                if (isBold) {
                    formattedResponse += parts[i];
                } else {
                    formattedResponse += parts[i];
                    isNewLine = true;
                }
            }
        }
        return formattedResponse;
    };

    const uploadDocument = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5001/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            setDocumentUploaded(true);
            setUploadedDocumentName(file.name); // Set the uploaded document name
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    };

    const onSent = useCallback(async () => {
        if (input.trim()) {
            setLoading(true);
            setShowInitialContent(false);
            setConversation(prev => [...prev, { input: input.trim() }]);
            
            try {
                let response;
                if (documentUploaded) {
                    response = await fetch('http://localhost:5001/query', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ question: input.trim() }),
                    });
                    response = await response.json();
                    response = response.response;
                } else {
                    response = await run(input);
                }

                let formattedResponse = formatResponse(response);
                
                setConversation(prev => [
                    ...prev.slice(0, -1),
                    { input: input.trim(), response: formattedResponse }
                ]);
            } catch (error) {
                console.error("Error in onSent:", error);
                setConversation(prev => [
                    ...prev.slice(0, -1),
                    { input: input.trim(), response: "An error occurred while processing your request." }
                ]);
            } finally {
                setLoading(false);
                setInput(""); // Clear input after sending
            }
        }
    }, [input, documentUploaded]);

    const startNewChat = useCallback(() => {
        setConversation([]);
        setInput("");
        setShowInitialContent(true);
        setDocumentUploaded(false);
    }, []);

    const contextValue = {
        input,
        setInput,
        conversation,
        loading,
        showInitialContent,
        setShowInitialContent,
        onSent,
        startNewChat,
        uploadDocument,
        documentUploaded,
        uploadedDocumentName,
        setUploadedDocumentName,
        darkMode,
        setDarkMode
    };

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
};

export default ContextProvider;
