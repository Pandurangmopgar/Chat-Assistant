

import React, { createContext, useState, useCallback, useEffect } from "react";
import axios from 'axios';
import { useUser } from "@clerk/clerk-react";

export const Context = createContext();
const FASTAPI_URL = 'http://localhost:5000/api';
const NODE_API_URL = 'http://localhost:5005'; // Node.js backend for user registration

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
    };

    const uploadDocument = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${FASTAPI_URL}/upload`, formData, {
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

    const uploadImage = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => setSelectedImage(e.target.result);
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
    
                // Only add image if it exists
                if (selectedImage) {
                    queryData.image = selectedImage;
                }
    
                // Only add document if it exists
                if (uploadedDocumentContent) {
                    queryData.document = uploadedDocumentContent;
                    queryData.documentName = uploadedDocumentName;
                }
    
                const response = await axios.post(`${FASTAPI_URL}/query`, queryData);
                
                const formattedResponse = formatResponse(response.data.response);
                
                setConversation(prev => [
                    ...prev.slice(0, -1),
                    { 
                        input: input.trim(), 
                        response: formattedResponse,
                        queryType: response.data.query_type
                    }
                ]);
    
                setContextSummary(response.data.context_summary);
            } catch (error) {
                console.error("Error in onSent:", error);
                setConversation(prev => [
                    ...prev.slice(0, -1),
                    { input: input.trim(), response: "An error occurred while processing your request." }
                ]);
            } finally {
                setLoading(false);
                setInput("");
                setSelectedImage(null);
            }
        }
    }, [input, selectedImage, uploadedDocumentContent, uploadedDocumentName, user]);

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