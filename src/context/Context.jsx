import React, { createContext, useState, useCallback, useEffect } from "react";
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { useUser, useSession } from "@clerk/clerk-react";

export const Context = createContext();

const FASTAPI_URL = 'http://localhost:5000/api';
const NODE_API_URL ='https://qeskya3aqk.execute-api.us-east-1.amazonaws.com/production';

const supabase = createClient("https://ystrincjuzlkryojxoxe.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdHJpbmNqdXpsa3J5b2p4b3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2MjY2NDgsImV4cCI6MjAzOTIwMjY0OH0.RXbDQZZDDGsUw76O6X93V36-K1qRIhDwWKQBWUj6_uc");

export const ContextProvider = ({ children }) => {
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

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (session) {
            setCurrentSession(session);
            logSessionStart(session);
        }
    }, [session]);

    useEffect(() => {
        return () => {
            if (currentSession) {
                logSessionEnd(currentSession);
            }
        };
    }, [currentSession]);

    const getBrowserInfo = () => {
        const ua = navigator.userAgent;
        let browserName = "Unknown";
        let browserVersion = "Unknown";

        if (ua.indexOf("Firefox") > -1) {
            browserName = "Firefox";
            browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)[1];
        } else if (ua.indexOf("Chrome") > -1) {
            browserName = "Chrome";
            browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)[1];
        } else if (ua.indexOf("Safari") > -1) {
            browserName = "Safari";
            browserVersion = ua.match(/Version\/(\d+\.\d+)/)[1];
        } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1) {
            browserName = "Internet Explorer";
            browserVersion = ua.match(/(?:MSIE |rv:)(\d+\.\d+)/)[1];
        }

        return `${browserName} ${browserVersion}`;
    };

    const getOSInfo = () => {
        const ua = navigator.userAgent;
        let osName = "Unknown";
        let osVersion = "Unknown";

        if (ua.indexOf("Win") > -1) {
            osName = "Windows";
        } else if (ua.indexOf("Mac") > -1) {
            osName = "MacOS";
        } else if (ua.indexOf("Linux") > -1) {
            osName = "Linux";
        } else if (ua.indexOf("Android") > -1) {
            osName = "Android";
        } else if (ua.indexOf("iOS") > -1) {
            osName = "iOS";
        }

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
                throw queryError;
            }

            const currentTime = new Date().toISOString();

            if (existingSession) {
                const { data, error } = await supabase
                    .from('user_sessions')
                    .update({ 
                        last_active: currentTime,
                        login_count: existingSession.login_count + 1,
                        device_info: navigator.userAgent,
                        browser_info: browserInfo,
                        os_info: osInfo,
                        ip_address: ipAddress
                    })
                    .eq('session_id', session.id);

                if (error) throw error;
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
                            ip_address: ipAddress
                        }
                    ]);

                if (error) throw error;
                console.log('New session logged successfully:', data);
            }
        } catch (error) {
            console.error('Error logging session start:', error);
        }
    };

    const logSessionEnd = async (session) => {
        try {
            const endTime = new Date().toISOString();
            const { data: existingSession, error: queryError } = await supabase
                .from('user_sessions')
                .select('start_time, total_duration')
                .eq('session_id', session.id)
                .single();

            if (queryError) throw queryError;

            const sessionDuration = new Date(endTime) - new Date(existingSession.start_time);
            const totalDuration = existingSession.total_duration 
                ? new Date(existingSession.total_duration).getTime() + sessionDuration
                : sessionDuration;

            const { data, error } = await supabase
                .from('user_sessions')
                .update({ 
                    end_time: endTime,
                    total_duration: new Date(totalDuration).toISOString()
                })
                .eq('session_id', session.id);

            if (error) throw error;
            console.log('Session end logged successfully:', data);
        } catch (error) {
            console.error('Error logging session end:', error);
        }
    };

    const logInteraction = async (interactionType, details) => {
        if (!user || !currentSession) {
            console.log("No user logged in or no active session, skipping interaction logging");
            return;
        }

        try {
            const { data: sessionData, error: sessionError } = await supabase
                .from('user_sessions')
                .select('interactions_count')
                .eq('session_id', currentSession.id)
                .single();

            if (sessionError) throw sessionError;

            const { data: interactionData, error: interactionError } = await supabase
                .from('ai_interactions')
                .insert([
                    { 
                        type: interactionType, 
                        details: details,
                        user_id: user.id,
                        session_id: currentSession.id,
                        response_time: details.responseTime,
                        tokens_used: details.tokensUsed,
                        interaction_id: details.interactionId,
                        language: details.language
                    }
                ]);

            if (interactionError) throw interactionError;

            const { data: updatedSessionData, error: updateError } = await supabase
                .from('user_sessions')
                .update({ 
                    interactions_count: (sessionData.interactions_count || 0) + 1,
                    last_active: new Date().toISOString()
                })
                .eq('session_id', currentSession.id);

            if (updateError) throw updateError;

            setAnalytics(prev => ({
                ...prev,
                totalQueries: prev.totalQueries + 1,
                [interactionType + 'Queries']: (prev[interactionType + 'Queries'] || 0) + 1
            }));

            console.log('Interaction logged successfully:', interactionData);
        } catch (error) {
            console.error('Error logging interaction:', error);
        }
    };
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

    const onSent = useCallback(async () => {
        if (input.trim()) {
            setLoading(true);
            setShowInitialContent(false);
            setConversation(prev => [...prev, { input: input.trim() }]);
    
            try {
                const queryData = {
                    question: input.trim(),
                    userId: user?.id || 'anonymous'
                };
    
                let response;
                let interactionType;
    
                if (selectedImage) {
                    response = await axios.post(`${NODE_API_URL}/process-image`, {
                        image: selectedImage,
                        prompt: input.trim()
                    });
                    interactionType = 'image_query';
                } else if (documentUploaded) {
                    response = await axios.post(`${NODE_API_URL}/query`, {
                        ...queryData,
                        isDocumentQuery: true
                    });
                    interactionType = 'document_query';
                } else {
                    response = await axios.post(`${FASTAPI_URL}/query`, queryData);
                    interactionType = 'general_query';
                }
    
                console.log("API Response:", response);
    
                if (response.data.statusCode === 404 || (response.data.body && JSON.parse(response.data.body).error)) {
                    throw new Error(JSON.parse(response.data.body).error || 'Not Found');
                }
    
                if (response.data && response.data.response) {
                    const formattedResponse = formatResponse(response.data.response);
                    console.log(formattedResponse);
    
                    setConversation(prev => [
                        ...prev.slice(0, -1),
                        { 
                            input: input.trim(), 
                            response: formattedResponse,
                            queryType: response.data.query_type || 'unknown'
                        }
                    ]);
    
                    setContextSummary(response.data.context_summary || '');
                    await logInteraction(interactionType, {
                        query: input.trim(),
                        response: formattedResponse,
                        responseTime: response.data.response_time,
                        tokensUsed: response.data.tokens_used,
                        interactionId: response.data.interaction_id,
                        language: response.data.language
                    });
                } else {
                    throw new Error('Invalid response structure from server');
                }
            } catch (error) {
                console.error("Error in onSent:", error);
                setConversation(prev => [
                    ...prev.slice(0, -1),
                    { input: input.trim(), response: `An error occurred: ${error.message}` }
                ]);
                setError('Failed to process your message. Please try again.');
            } finally {
                setLoading(false);
                setInput("");
                setSelectedImage(null);
            }
        }
    }, [input, selectedImage, documentUploaded, user, currentSession]);

    const startNewChat = useCallback(() => {
        setConversation([]);
        setInput("");
        setShowInitialContent(true);
        setDocumentUploaded(false);
        setUploadedDocumentName("");
        setSelectedImage(null);
        setContextSummary("");
        logInteraction('new_chat', { action: 'Started new chat' });
    }, []);

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

    const getLanguageDistribution = (data) => {
        return data.reduce((acc, item) => {
            acc[item.language] = (acc[item.language] || 0) + 1;
            return acc;
        }, {});
    };

    const getDailyUsage = (data) => {
        const dailyUsage = {};
        data.forEach(item => {
            const date = new Date(item.created_at).toISOString().split('T')[0];
            dailyUsage[date] = (dailyUsage[date] || 0) + 1;
        });
        return Object.entries(dailyUsage).map(([date, queries]) => ({ date, queries }));
    };
    const calculateAvgSessionDuration = (sessions) => {
        const completedSessions = sessions.filter(s => s.end_time);
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

    const getDeviceType = (userAgent) => {
        if (/mobile/i.test(userAgent)) return 'Mobile';
        if (/tablet/i.test(userAgent)) return 'Tablet';
        return 'Desktop';
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
        contextSummary,
        aiPreferences,
        setAIPreferences,
        error,
        setError,
        analytics,
        getAnalytics,
        user,
        currentSession,
        logSessionEnd,
        registerUser
    };

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
};

export default ContextProvider;