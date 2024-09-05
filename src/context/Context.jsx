import React, { createContext, useState, useCallback, useEffect } from "react";
import run from "../config/gemini.js";
import axios from 'axios';

export const Context = createContext();

export const ContextProvider = ({ children }) => {
    const [input, setInput] = useState("");
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInitialContent, setShowInitialContent] = useState(true);
    const [documentUploaded, setDocumentUploaded] = useState(false);
    const [uploadedDocumentName, setUploadedDocumentName] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    const formatResponse = (response) => {
        const parts = response.split('\n');
        return parts.map((part, index) => {
            // Handle headers
            if (part.startsWith("## ")) return `<h2>${part.substring(3)}</h2>`;
            if (part.startsWith("# ")) return `<h1>${part.substring(2)}</h1>`;
            if (part.startsWith("### ")) return `<h3>${part.substring(4)}</h3>`;
            if (part.startsWith("#### ")) return `<h4>${part.substring(5)}</h4>`;
            if (part.startsWith("##### ")) return `<h5>${part.substring(6)}</h5>`;
            if (part.startsWith("###### ")) return `<h6>${part.substring(7)}</h6>`;

            // Move content after start to the next line and make it bold
            if (part.match(/^[A-Za-z ]+:$/)) return `<br><b>${part}</b>`;

            // Handle bold and italic formatting
            part = part.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Bold
            part = part.replace(/\*(.*?)\*/g, '<i>$1</i>'); // Italic

            // Remove asterisks
            part = part.replace(/\*/g, '');

            return part + (index < parts.length - 1 ? '<br>' : '');
        }).join('');
    };

    const uploadDocument = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status !== 200) throw new Error('File upload failed');

            setDocumentUploaded(true);
            setUploadedDocumentName(file.name);
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

    const processImageWithPrompt = async (prompt) => {
        if (!selectedImage) throw new Error('No image selected');

        try {
            const response = await axios.post('http://localhost:5002/process_image', {
                image: selectedImage,
                prompt: prompt
            });
            return response.data.response;
        } catch (error) {
            console.error('Error processing image:', error);
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
                if (selectedImage) {
                    response = await processImageWithPrompt(input.trim());
                } else if (documentUploaded) {
                    const res = await axios.post('http://localhost:5001/query', {
                        question: input.trim()
                    });
                    response = res.data.response;
                } else {
                    response = await run(input);
                }

                const formattedResponse = formatResponse(response);
                
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
                setInput("");
                setSelectedImage(null);
            }
        }
    }, [input, documentUploaded, selectedImage]);

    const startNewChat = useCallback(() => {
        setConversation([]);
        setInput("");
        setShowInitialContent(true);
        setDocumentUploaded(false);
        setUploadedDocumentName("");
        setSelectedImage(null);
    }, []);

    const registerUser = async (user) => {
        try {
            const response = await axios.post('http://localhost:5005/register', {
                email: user.primaryEmailAddress.emailAddress,
                name: user.firstName || 'User',
            });
            console.log(response.data.message);
            // You might want to add some state update here to reflect successful registration
        } catch (error) {
            console.error('Error registering user:', error);
            // You might want to add some state update here to handle registration error
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
        registerUser
    };

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
};

export default ContextProvider;