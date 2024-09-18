

import React, { createContext, useState, useCallback, useEffect } from "react";
import axios from 'axios';
import { useUser } from "@clerk/clerk-react";

export const Context = createContext();
// const FASTAPI_URL = // const FASTAPI_URL = 'http://localhost:5000/api';
const FASTAPI_URL = 'https://9jsmecxsdd.execute-api.us-east-1.amazonaws.com/production';
const NODE_API_URL = 'http://localhost:5005'; 
// Node.js backend for user registration
const UPLOAD_URL='http://localhost:5000/api'


export const ContextProvider = ({ children }) => {
    const [input, setInput] = useState("");
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInitialContent, setShowInitialContent] = useState(true);
    const [documentUploaded, setDocumentUploaded] = useState(false);
    const [uploadedDocumentName, setUploadedDocumentName] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadedDocumentContent, setUploadedDocumentContent] = useState(null);
    const [contextSummary, setContextSummary] = useState("");
    const { user } = useUser();

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (user && user.id) {
            registerUser(user);
        }
    }, [user]);

    const formatResponse = (response) => {
        if (!response) {
            console.error('Received null or undefined response');
            return 'Error: Received an empty response from the server.';
        }
        
        try {
            const parts = response.split('\n');
            return parts.map((part, index) => {
                if (part.startsWith("## ")) return `<h2>${part.substring(3)}</h2>`;
                if (part.startsWith("# ")) return `<h1>${part.substring(2)}</h1>`;
                if (part.startsWith("### ")) return `<h3>${part.substring(4)}</h3>`;
                if (part.startsWith("#### ")) return `<h4>${part.substring(5)}</h4>`;
                if (part.startsWith("##### ")) return `<h5>${part.substring(6)}</h5>`;
                if (part.startsWith("###### ")) return `<h6>${part.substring(7)}</h6>`;
                if (part.match(/^[A-Za-z ]+:$/)) return `<br><b>${part}</b>`;
                part = part.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                part = part.replace(/\*(.*?)\*/g, '<i>$1</i>');
                part = part.replace(/\*/g, '');
                return part + (index < parts.length - 1 ? '<br>' : '');
            }).join('');
        } catch (error) {
            console.error('Error in formatResponse:', error);
            return 'Error: Failed to format the response.';
        }
    };
    const uploadDocument = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await axios.post(`${FASTAPI_URL}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            if (response.status !== 200) throw new Error('File upload failed');
    
            setDocumentUploaded(true);
            setUploadedDocumentName(file.name);
            setUploadedDocumentContent(response.data.content);
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    };
    
    const uploadImage = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target.result;
            setSelectedImage(imageData);
    
            try {
                const response = await axios.post(`${FASTAPI_URL}/api/process_image`, {
                    image: imageData,
                    prompt: "Analyze this image" // You can customize this prompt
                });
    
                if (response.status !== 200) throw new Error('Image processing failed');
    
                // Handle the response from image processing
                console.log('Image processing result:', response.data);
            } catch (error) {
                console.error('Error processing image:', error);
                throw error;
            }
        };
        reader.readAsDataURL(file);
    };

    const onSent = useCallback(async () => {
        if (input.trim()) {
            setLoading(true);
            setShowInitialContent(false);
            setConversation(prev => [...prev, { input: input.trim() }]);
            
            try {
                const queryData = {
                    question: input.trim(),
                    userId: user?.id || 'anonymous',
                };
    
                console.log('Sending request to:', FASTAPI_URL);
                console.log('Query data:', queryData);
    
                const response = await axios.post(`${FASTAPI_URL}/query`, queryData);
                
                console.log('Received response:', response);
    
                if (response.data && response.data.body) {
                    const bodyData = JSON.parse(response.data.body);
                    const formattedResponse = formatResponse(bodyData.response);
                    
                    setConversation(prev => [
                        ...prev.slice(0, -1),
                        { 
                            input: input.trim(), 
                            response: formattedResponse,
                            queryType: bodyData.query_type
                        }
                    ]);
    
                    if (bodyData.context_summary) {
                        setContextSummary(bodyData.context_summary);
                    }
                } else {
                    throw new Error('Invalid response format from server');
                }
            } catch (error) {
                console.error("Error in onSent:", error);
                let errorMessage = "An error occurred while processing your request.";
                if (error.response) {
                    console.error("Response error data:", error.response.data);
                    errorMessage = error.response.data.detail || errorMessage;
                } else if (error.request) {
                    console.error("No response received:", error.request);
                    errorMessage = "No response received from the server. Please check your internet connection.";
                } else {
                    console.error("Error details:", error.message);
                }
                setConversation(prev => [
                    ...prev.slice(0, -1),
                    { input: input.trim(), response: errorMessage }
                ]);
            } finally {
                setLoading(false);
                setInput("");
                setSelectedImage(null);
            }
        }
    }, [input, selectedImage, uploadedDocumentContent, uploadedDocumentName, user, FASTAPI_URL]);
    const startNewChat = useCallback(() => {
        setConversation([]);
        setInput("");
        setShowInitialContent(true);
        setDocumentUploaded(false);
        setUploadedDocumentName("");
        setSelectedImage(null);
        setUploadedDocumentContent(null);
        setContextSummary("");
    }, []);

    const registerUser = async (user) => {
        try {
            const response = await axios.post(`${NODE_API_URL}/register`, {
                email: user.primaryEmailAddress.emailAddress,
                name: user.firstName || 'User',
            });
            console.log(response.data.message);
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };

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
        setDarkMode,
        uploadImage,
        selectedImage,
        registerUser,
        contextSummary
    };

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
};

export default ContextProvider;