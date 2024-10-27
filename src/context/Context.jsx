import React, { createContext, useState, useCallback, useEffect, useRef } from "react";
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { useUser, useSession } from "@clerk/clerk-react";

export const Context = createContext();

// Service endpoints for the distributed backend
const SERVICES = {
    HR: 'http://localhost:5001/api/hr/query',
    IT: 'http://localhost:5002/api/it/query',
    GENERAL: 'http://localhost:5003/api/general/query',
    // ANALYTICS: 'http://localhost:5004/api/analytics/log'
};

// Existing API endpoints
const FASTAPI_URL = 'http://localhost:5000/api';
const NODE_API_URL = 'https://qeskya3aqk.execute-api.us-east-1.amazonaws.com/production';

const supabase = createClient("https://ystrincjuzlkryojxoxe.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdHJpbmNqdXpsa3J5b2p4b3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2MjY2NDgsImV4cCI6MjAzOTIwMjY0OH0.RXbDQZZDDGsUw76O6X93V36-K1qRIhDwWKQBWUj6_uc");

export const ContextProvider = ({ children }) => {
    // Keep all existing state
    const { user } = useUser();
    const { session } = useSession();
    const [currentSession, setCurrentSession] = useState(null);
    const [input, setInput] = useState("");
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInitialContent, setShowInitialContent] = useState(true);
    const [documentUploaded, setDocumentUploaded] = useState(false);
    const [uploadedDocumentName, setUploadedDocumentName] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [contextSummary, setContextSummary] = useState("");
    const [aiPreferences, setAIPreferences] = useState({ customPrompt: '' });
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState({
        totalQueries: 0,
        documentQueries: 0,
        imageQueries: 0,
        generalQueries: 0
    });
    const sessionStartTime = useRef(null);
    const abortController = useRef(null);

    // Keep all existing effects
    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (session) {
            setCurrentSession(session);
            sessionStartTime.current = new Date();
            logSessionStart(session);
        }

        const handleBeforeUnload = async (event) => {
            if (currentSession) {
                event.preventDefault();
                event.returnValue = '';
                await logSessionEnd(currentSession);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (currentSession) {
                logSessionEnd(currentSession);
            }
        };
    }, [session]);

    // Keep all existing utility functions
    const formatResponse = (response) => {
        if (!response) return '';
        const lines = response.split('\n');
        return lines.map((line, index) => {
            if (line.startsWith("## ")) return `<h2>${line.substring(3)}</h2>`;
            if (line.startsWith("# ")) return `<h1>${line.substring(2)}</h1>`;
            if (line.startsWith("### ")) return `<h3>${line.substring(4)}</h3>`;
            if (line.startsWith("#### ")) return `<h4>${line.substring(5)}</h4>`;
            if (line.startsWith("##### ")) return `<h5>${line.substring(6)}</h5>`;
            if (line.startsWith("###### ")) return `<h6>${line.substring(7)}</h6>`;
            if (line.match(/^[A-Za-z ]+:$/)) return `<br><b>${line}</b>`;
            line = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            line = line.replace(/\*(.*?)\*/g, '<i>$1</i>');
            line = line.replace(/`(.*?)`/g, '<code>$1</code>');
            return line + (index < lines.length - 1 ? '<br>' : '');
        }).join('');
    };

    // Modified determineQueryType to handle both distributed and existing services
    const determineQueryType = (question) => {
        const hrKeywords = ['hr', 'policy', 'leave', 'vacation', 'benefits', 'salary', 'payroll', 'employee', 'staff', 'attendance'];
        const itKeywords = ['it', 'computer', 'software', 'hardware', 'network', 'system', 'password', 'access', 'login', 'technical'];
        
        const lowerQuestion = question.toLowerCase();
        
        if (hrKeywords.some(keyword => lowerQuestion.includes(keyword))) {
            return "hr";
        }
        
        if (itKeywords.some(keyword => lowerQuestion.includes(keyword))) {
            return "it";
        }
        
        return "general";
    };
    const onSent = useCallback(async (inputText) => {
        if (!inputText.trim()) return;
    
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();
    
        setLoading(true);
        setShowInitialContent(false);
        let fullResponse = '';
        let metadata = null;
        
        // Add initial message to conversation
        setConversation(prev => [...prev, { 
            input: inputText.trim(),
            response: '',
            pending: true 
        }]);
    
        try {
            const queryStartTime = Date.now();
            const queryType = determineQueryType(inputText);
    
            if (selectedImage) {
                const response = await axios.post(`${NODE_API_URL}/process-image`, {
                    image: selectedImage,
                    prompt: inputText.trim(),
                    userId: user?.id || 'anonymous'
                });
                
                fullResponse = response.data.response;
                setConversation(prev => [
                    ...prev.slice(0, -1),
                    {
                        input: inputText.trim(),
                        response: formatResponse(response.data.response),
                        type: 'image',
                        pending: false
                    }
                ]);
    
                await logInteraction('image_query', {
                    query: inputText.trim(),
                    response: fullResponse,
                    responseTime: Date.now() - queryStartTime
                });
    
            } else if (documentUploaded) {
                const response = await axios.post(`${NODE_API_URL}/query`, {
                    question: inputText.trim(),
                    userId: user?.id || 'anonymous',
                    isDocumentQuery: true
                });
                
                fullResponse = response.data.response;
                setConversation(prev => [
                    ...prev.slice(0, -1),
                    {
                        input: inputText.trim(),
                        response: formatResponse(response.data.response),
                        type: 'document',
                        pending: false
                    }
                ]);
    
                await logInteraction('document_query', {
                    query: inputText.trim(),
                    response: fullResponse,
                    responseTime: Date.now() - queryStartTime
                });
    
            } else {
                const endpoint = queryType === 'hr' ? SERVICES.HR :
                               queryType === 'it' ? SERVICES.IT :
                               SERVICES.GENERAL;
    
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: inputText.trim(),
                        userId: user?.id || 'anonymous'
                    }),
                    signal: abortController.current.signal
                });
    
                const reader = response.body.getReader();
                let buffer = '';
                let currentResponse = '';
    
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
    
                    buffer += new TextDecoder().decode(value);
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6).trim();
                            
                            if (data === '[DONE]') {
                                setLoading(false);
                                continue;
                            }
    
                            try {
                                const jsonData = JSON.parse(data);
                                if (jsonData.interaction_id) {
                                    metadata = jsonData;
                                } else if (jsonData.content) {
                                    currentResponse += jsonData.content;
                                    setConversation(prev => [
                                        ...prev.slice(0, -1),
                                        {
                                            input: inputText.trim(),
                                            response: formatResponse(currentResponse),
                                            type: queryType,
                                            pending: false
                                        }
                                    ]);
                                }
                            } catch (e) {
                                if (data !== '{' && data !== '}') {
                                    currentResponse += data;
                                    setConversation(prev => [
                                        ...prev.slice(0, -1),
                                        {
                                            input: inputText.trim(),
                                            response: formatResponse(currentResponse),
                                            type: queryType,
                                            pending: false
                                        }
                                    ]);
                                }
                            }
                        }
                    }
                }
    
                fullResponse = currentResponse;
            }
    
            await logInteraction(queryType, {
                query: inputText.trim(),
                response: fullResponse,
                responseTime: metadata?.response_time || 0,
                tokensUsed: metadata?.tokens_used || 0,
                interactionId: metadata?.interaction_id || '',
                language: metadata?.language || 'English'
            });
    
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request aborted');
            } else {
                console.error("Error in onSent:", error);
                setError('Failed to process your message. Please try again.');
                setConversation(prev => [
                    ...prev.slice(0, -1),
                    {
                        input: inputText.trim(),
                        response: formatResponse(`Error: ${error.message}`),
                        pending: false,
                        error: true
                    }
                ]);
            }
        } finally {
            setLoading(false);
            setInput("");
            setSelectedImage(null);
            setDocumentUploaded(false);
            setUploadedDocumentName("");
        }
    }, [user, selectedImage, documentUploaded, formatResponse]);

    // Helper function to update conversation
   
    // Keep all existing session and interaction logging functions
    const logSessionStart = async (session) => {
        if (!user) return;
        try {
            const browserInfo = getBrowserInfo();
            const osInfo = getOSInfo();
            const ipAddress = await getIPAddress();

            const { data: existingSession, error: queryError } = await supabase
                .from('user_sessions')
                .select('*')
                .eq('session_id', session.id)
                .single();

            if (queryError && queryError.code !== 'PGRST116') {
                console.error('Error checking for existing session:', queryError);
                return;
            }

            const currentTime = new Date().toISOString();

            if (existingSession) {
                const { data, error } = await supabase
                    .from('user_sessions')
                    .update({ 
                        last_active: currentTime,
                        login_count: (existingSession.login_count || 0) + 1,
                        device_info: navigator.userAgent,
                        browser_info: browserInfo,
                        os_info: osInfo,
                        ip_address: ipAddress
                    })
                    .eq('session_id', session.id);

                if (error) {
                    console.error('Error updating existing session:', error);
                    return;
                }
                console.log('Session updated successfully:', data);
            } else {
                const { data, error } = await supabase
                    .from('user_sessions')
                    .insert([
                        {
                            user_id: user.id,
                            session_id: session.id,
                            start_time: currentTime,
                            last_active: currentTime,
                            device_info: navigator.userAgent,
                            browser_info: browserInfo,
                            os_info: osInfo,
                            ip_address: ipAddress,
                            login_count: 1,
                            interactions_count: 0
                        }
                    ]);

                if (error) {
                    console.error('Error inserting new session:', error);
                    return;
                }
                console.log('New session logged successfully:', data);
            }
        } catch (error) {
            console.error('Error in logSessionStart:', error);
        }
    };

    const logSessionEnd = async (session) => {
        if (!session || !sessionStartTime.current) return;

        try {
            const endTime = new Date();
            const sessionDuration = endTime - sessionStartTime.current;
            const totalDuration = new Date(sessionDuration).toISOString().substr(11, 8);

            const { data, error } = await supabase
                .from('user_sessions')
                .update({ 
                    end_time: endTime.toISOString(),
                    total_duration: totalDuration,
                    last_active: endTime.toISOString()
                })
                .eq('session_id', session.id);

            if (error) {
                console.error('Error updating session end:', error);
                return;
            }
            console.log('Session end logged successfully:', data);
        } catch (error) {
            console.error('Error in logSessionEnd:', error);
        }
    };

    const logInteraction = async (interactionType, details) => {
        if (!user || !currentSession) {
            console.log("No user logged in or no active session, skipping interaction logging");
            return;
        }

        try {
            // Log to Supabase
            const { data: interactionData, error: interactionError } = await supabase
                .from('ai_interactions')
                .insert([{ 
                    type: interactionType, 
                    details: details,
                    user_id: user.id,
                    session_id: currentSession.id,
                    response_time: details.responseTime,
                    tokens_used: details.tokensUsed,
                    interaction_id: details.interactionId,
                    language: details.language
                }]);

            if (interactionError) {
                console.error('Error inserting interaction:', interactionError);
                return;
            }

            // Update session
            const { error: sessionError } = await supabase
                .from('user_sessions')
                .update({ 
                    interactions_count: supabase.rpc('increment', { inc: 1 }),
                    last_active: new Date().toISOString()
                })
                .eq('session_id', currentSession.id);

                if (sessionError) {
                    console.error('Error updating session:', sessionError);
                }
    
                // Update analytics state
                setAnalytics(prev => ({
                    ...prev,
                    totalQueries: prev.totalQueries + 1,
                    [interactionType + 'Queries']: (prev[interactionType + 'Queries'] || 0) + 1
                }));
    
                // Log to analytics service
                await axios.post(SERVICES.ANALYTICS, {
                    event_type: 'interaction',
                    data: {
                        type: interactionType,
                        user_id: user.id,
                        session_id: currentSession.id,
                        ...details
                    }
                });
    
                console.log('Interaction logged successfully:', interactionData);
            } catch (error) {
                console.error('Error in logInteraction:', error);
            }
        };
    
        // Keep all utility functions for session tracking
        const getBrowserInfo = () => {
            const ua = navigator.userAgent;
            let browserName = "Unknown";
            let browserVersion = "Unknown";
    
            if (ua.indexOf("Firefox") > -1) {
                browserName = "Firefox";
                browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || "Unknown";
            } else if (ua.indexOf("Chrome") > -1) {
                browserName = "Chrome";
                browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || "Unknown";
            } else if (ua.indexOf("Safari") > -1) {
                browserName = "Safari";
                browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || "Unknown";
            } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1) {
                browserName = "Internet Explorer";
                browserVersion = ua.match(/(?:MSIE |rv:)(\d+\.\d+)/)?.[1] || "Unknown";
            }
    
            return `${browserName} ${browserVersion}`;
        };
    
        const getOSInfo = () => {
            const ua = navigator.userAgent;
            let osName = "Unknown";
            let osVersion = "Unknown";
    
            if (ua.indexOf("Win") > -1) osName = "Windows";
            else if (ua.indexOf("Mac") > -1) osName = "MacOS";
            else if (ua.indexOf("Linux") > -1) osName = "Linux";
            else if (ua.indexOf("Android") > -1) osName = "Android";
            else if (ua.indexOf("iOS") > -1) osName = "iOS";
    
            return `${osName} ${osVersion}`;
        };
    
        const getIPAddress = async () => {
            try {
                const response = await axios.get('https://api.ipify.org?format=json');
                return response.data.ip;
            } catch (error) {
                console.error('Error fetching IP address:', error);
                return 'Unknown';
            }
        };
    
        // Analytics functions
        const getAnalytics = async () => {
            try {
                const { data: interactions, error: interactionsError } = await supabase
                    .from('ai_interactions')
                    .select('*')
                    .order('created_at', { ascending: false });
    
                const { data: sessions, error: sessionsError } = await supabase
                    .from('user_sessions')
                    .select('*')
                    .order('start_time', { ascending: false });
    
                if (interactionsError) throw interactionsError;
                if (sessionsError) throw sessionsError;
    
                const now = new Date();
                const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
                const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
                const analytics = {
                    total: interactions.length,
                    last24Hours: interactions.filter(item => new Date(item.created_at) > last24Hours).length,
                    last7Days: interactions.filter(item => new Date(item.created_at) > last7Days).length,
                    uniqueUsers: new Set(interactions.map(item => item.user_id)).size,
                    avgResponseTime: interactions.reduce((sum, item) => sum + (item.response_time || 0), 0) / interactions.length,
                    byType: interactions.reduce((acc, item) => {
                        acc[item.type] = (acc[item.type] || 0) + 1;
                        return acc;
                    }, {}),
                    dailyUsage: getDailyUsage(interactions),
                    detailed: {
                        totalTokensUsed: interactions.reduce((sum, item) => sum + (item.tokens_used || 0), 0),
                        avgTokensPerQuery: interactions.reduce((sum, item) => sum + (item.tokens_used || 0), 0) / interactions.length,
                        languageDistribution: getLanguageDistribution(interactions)
                    },
                    sessions: {
                        total: sessions.length,
                        activeSessions: sessions.filter(s => !s.end_time).length,
                        avgSessionDuration: calculateAvgSessionDuration(sessions),
                        deviceDistribution: getDeviceDistribution(sessions),
                        browserDistribution: getBrowserDistribution(sessions),
                        osDistribution: getOSDistribution(sessions),
                        avgInteractionsPerSession: sessions.reduce((sum, s) => sum + (s.interactions_count || 0), 0) / sessions.length
                    }
                };
    
                return analytics;
            } catch (error) {
                console.error('Error fetching analytics:', error);
                throw new Error('Failed to fetch analytics. Please try again.');
            }
        };
    
        const getDailyUsage = (data) => {
            const dailyUsage = {};
            data.forEach(item => {
                const date = new Date(item.created_at).toISOString().split('T')[0];
                dailyUsage[date] = (dailyUsage[date] || 0) + 1;
            });
            return Object.entries(dailyUsage).map(([date, queries]) => ({ date, queries }));
        };
    
        const getLanguageDistribution = (data) => {
            return data.reduce((acc, item) => {
                acc[item.language] = (acc[item.language] || 0) + 1;
                return acc;
            }, {});
        };
    
        const calculateAvgSessionDuration = (sessions) => {
            const completedSessions = sessions.filter(s => s.end_time && s.start_time);
            const totalDuration = completedSessions.reduce((sum, session) => {
                return sum + (new Date(session.end_time) - new Date(session.start_time));
            }, 0);
            return completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;
        };
    
        const getDeviceDistribution = (sessions) => {
            return sessions.reduce((acc, session) => {
                const device = getDeviceType(session.device_info);
                acc[device] = (acc[device] || 0) + 1;
                return acc;
            }, {});
        };

        const getBrowserDistribution = (sessions) => {
            return sessions.reduce((acc, session) => {
                const browser = session.browser_info.split(' ')[0];
                acc[browser] = (acc[browser] || 0) + 1;
                return acc;
            }, {});
        };
        
    const getOSDistribution = (sessions) => {
        return sessions.reduce((acc, session) => {
            const os = session.os_info.split(' ')[0];
            acc[os] = (acc[os] || 0) + 1;
            return acc;
        }, {});
    };
    
        const getDeviceType = (userAgent) => {
            if (/mobile/i.test(userAgent)) return 'Mobile';
            if (/tablet/i.test(userAgent)) return 'Tablet';
            return 'Desktop';
        };
    
        // User management functions
        const startNewChat = useCallback(async () => {
            setConversation([]);
            setInput("");
            setShowInitialContent(true);
            setDocumentUploaded(false);
            setUploadedDocumentName("");
            setSelectedImage(null);
            setContextSummary("");
            setError(null);
    
            try {
                await logInteraction('new_chat', { action: 'Started new chat' });
            } catch (error) {
                console.error('Error logging new chat interaction:', error);
            }
        }, []);
    
        const registerUser = async (user) => {
            try {
                const response = await axios.post(`${NODE_API_URL}/register`, {
                    email: user.primaryEmailAddress?.emailAddress,
                    name: user.firstName || 'User',
                });
                console.log(response.data.message);
                // await logUserActivity('USER_REGISTERED', 'User registered');
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    console.log('User already exists');
                } else {
                    console.error('Error registering user:', error);
                    setError('Failed to register user. Please try again.');
                }
            }
        };
    
        // File handling functions
        const uploadDocument = async (file) => {
            try {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const base64 = e.target.result.split(',')[1];
                    try {
                        // Use existing document processing endpoint
                        const response = await axios.post(`${NODE_API_URL}/process-document`, { 
                            document: base64,
                            userId: user?.id || 'anonymous'
                        });
    
                        setUploadedDocumentName(file.name);
                        setDocumentUploaded(true);
    
                        // Log to analytics service
                        await axios.post(SERVICES.ANALYTICS, {
                            event_type: 'document_upload',
                            data: {
                                file_name: file.name,
                                file_size: file.size,
                                user_id: user?.id || 'anonymous'
                            }
                        });
    
                        console.log('Document processed successfully');
                        await logInteraction('document_upload', { fileName: file.name, fileSize: file.size });
                    } catch (error) {
                        console.error('Error uploading document:', error);
                        setError('An error occurred while processing the document. Please try again.');
                    }
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Error reading file:', error);
                setError('Error reading file. Please try again.');
            }
        };
    
        const uploadImage = async (file) => {
            try {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const base64 = e.target.result;
                    setSelectedImage(base64);
    
                    // Log to analytics service
                    await axios.post(SERVICES.ANALYTICS, {
                        event_type: 'image_upload',
                        data: {
                            file_name: file.name,
                            file_size: file.size,
                            user_id: user?.id || 'anonymous'
                        }
                    });
    
                    console.log('Image uploaded successfully');
                    await logInteraction('image_upload', { fileName: file.name, fileSize: file.size });
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Error uploading image:', error);
                setSelectedImage(null);
                setError('Failed to upload image. Please try again.');
            }
        };
    
        // Context value
        const contextValue = {
            user,
            currentSession,
            input,
            setInput,
            conversation,
            setConversation,
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
            contextSummary,
            aiPreferences,
            setAIPreferences,
            error,
            setError,
            analytics,
            getAnalytics,
            logSessionEnd,
            registerUser,
        };
    
        return (
            <Context.Provider value={contextValue}>
                {children}
            </Context.Provider>
        );
    };
    
    export default ContextProvider;