import React, { createContext, useState, useCallback, useEffect } from "react";
import axios from 'axios';
import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useUser } from "@clerk/clerk-react";
// import { Pinecone } from '@pinecone-database/pinecone';

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const Context = createContext();
const FASTAPI_URL = 'https://9jsmecxsdd.execute-api.us-east-1.amazonaws.com/production';
const NODE_API_URL ='https://qeskya3aqk.execute-api.us-east-1.amazonaws.com/production';

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

    // Initialize Pinecone client
    
// const pc = new Pinecone({
//     apiKey: '123da8fb-620c-4823-8805-6680826d3d1b'
//   });
//     const index = pc.index('quickstart');

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
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target.result.split(',')[1];
                try {
                    const response = await axios.post(`${NODE_API_URL}/process-document`, { 
                        document: base64,
                        userId: user?.id || 'anonymous'
                    });
                    setUploadedDocumentName(file.name);
                    setDocumentUploaded(true);
                    setUploadedDocumentContent(response.data.message);
                    console.log('Document processed and stored in Pinecone successfully');
                } catch (error) {
                    console.error('Error uploading document:', error);
                    let errorMessage = 'An error occurred while processing the document.';
                    if (error.response && error.response.data && error.response.data.details) {
                        errorMessage += ' ' + error.response.data.details;
                    }
                    alert(errorMessage);
                    setDocumentUploaded(false);
                    setUploadedDocumentName("");
                    setUploadedDocumentContent(null);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file. Please try again.');
        }
    };

    const uploadImage = async (file) => {
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target.result.split(',')[1];
                setSelectedImage(e.target.result);
                console.log('Image uploaded successfully');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            setSelectedImage(null);
            throw error;
        }
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
    
                let response;
    
                if (selectedImage) {
                    response = await axios.post(`${NODE_API_URL}/process-image`, {
                        image: selectedImage,
                        prompt: input.trim()
                    });
                } else if (documentUploaded) {
                    response = await axios.post(`${NODE_API_URL}/query`, {
                        ...queryData,
                        isDocumentQuery: true
                    });
                } else {
                    response = await axios.post(`${FASTAPI_URL}/query`, queryData);
                }
    
                console.log("API Response:", response);
    
                // Check for nested error response
                if (response.data.statusCode === 404 || (response.data.body && JSON.parse(response.data.body).error)) {
                    throw new Error(JSON.parse(response.data.body).error || 'Not Found');
                }
    
                // If no error, process the response
                if (response.data && response.data.response) {
                    const formattedResponse = formatResponse(response.data.response);
    
                    setConversation(prev => [
                        ...prev.slice(0, -1),
                        { 
                            input: input.trim(), 
                            response: formattedResponse,
                            queryType: response.data.query_type || 'unknown'
                        }
                    ]);
    
                    setContextSummary(response.data.context_summary || '');
                } else {
                    throw new Error('Invalid response structure from server');
                }
            } catch (error) {
                console.error("Error in onSent:", error);
                setConversation(prev => [
                    ...prev.slice(0, -1),
                    { input: input.trim(), response: `An error occurred: ${error.message}` }
                ]);
            } finally {
                setLoading(false);
                setInput("");
                setSelectedImage(null);
            }
        }
    }, [input, selectedImage, documentUploaded, user]);
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
        };const contextValue = {
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