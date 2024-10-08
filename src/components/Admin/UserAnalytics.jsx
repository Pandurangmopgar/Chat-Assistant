import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Context } from '../../context/Context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Loader2, Users, MessageSquare, Image, FileText, Zap, Globe, TrendingUp, Clock, Smartphone, Monitor, Settings, FileText as FileTextIcon } from "lucide-react";

const UserAnalytics = () => {
    const { getAnalytics, error, setError, user, currentSession } = useContext(Context);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const data = await getAnalytics();
            setAnalytics(data);
            console.log(data);
        } catch (err) {
            setError('Failed to fetch analytics. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                <Loader2 className="h-16 w-16 animate-spin text-white" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center text-2xl font-bold mt-10">{error}</div>;
    }

    if (!analytics) {
        return <div className="text-gray-500 text-center text-2xl font-bold mt-10">No analytics data available.</div>;
    }

    const overviewCards = [
        { title: "Total Queries", value: analytics.total || 0, icon: MessageSquare, color: "from-blue-400 to-blue-600" },
        { title: "Unique Users", value: analytics.uniqueUsers || 0, icon: Users, color: "from-green-400 to-green-600" },
        { title: "Avg. Response Time", value: `${(analytics.avgResponseTime || 0).toFixed(2)}s`, icon: Zap, color: "from-yellow-400 to-yellow-600" },
        { title: "Image Queries", value: analytics.byType?.image_query || 0, icon: Image, color: "from-purple-400 to-purple-600" },
        { title: "Document Queries", value: analytics.byType?.document_query || 0, icon: FileText, color: "from-pink-400 to-pink-600" },
        { title: "Active Sessions", value: analytics.sessions?.activeSessions || 0, icon: Clock, color: "from-indigo-400 to-indigo-600" },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const renderPieChart = (data, title, icon) => (
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-500">
                <CardTitle className="flex items-center text-white">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );

    const renderBarChart = (data, title, icon) => (
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-400 to-teal-600">
                <CardTitle className="flex items-center text-white">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );

    const renderSessionInfo = () => (
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-400 to-indigo-600">
                <CardTitle className="flex items-center text-white">
                    <Clock className="w-6 h-6 mr-2" />
                    Current Session Info
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <p><strong>Session ID:</strong> {currentSession?.id || 'N/A'}</p>
                <p><strong>Start Time:</strong> {currentSession?.lastActiveAt ? new Date(currentSession.lastActiveAt).toLocaleString() : 'N/A'}</p>
                <p><strong>User:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>Total Duration:</strong> {analytics.sessions?.avgSessionDuration ? `${(analytics.sessions.avgSessionDuration / 1000 / 60).toFixed(2)} minutes` : 'N/A'}</p>
                <p><strong>Avg. Interactions per Session:</strong> {analytics.sessions?.avgInteractionsPerSession?.toFixed(2) || 'N/A'}</p>
            </CardContent>
        </Card>
    );

    const renderDetailedAnalytics = () => (
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-400 to-green-600">
                <CardTitle className="flex items-center text-white">
                    <FileTextIcon className="w-6 h-6 mr-2" />
                    Detailed Analytics
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left">Metric</th>
                            <th className="text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Tokens Used</td>
                            <td className="text-right">{analytics.detailed?.totalTokensUsed || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Avg. Tokens Per Query</td>
                            <td className="text-right">{analytics.detailed?.avgTokensPerQuery?.toFixed(2) || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Language Distribution</td>
                            <td className="text-right">
                                {Object.entries(analytics.detailed?.languageDistribution || {}).map(([lang, count]) => (
                                    <div key={lang}>{lang}: {count}</div>
                                ))}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">User Analytics Dashboard</h1>
            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="flex justify-center mb-8 flex-wrap">
                    <TabsTrigger value="overview" className="px-4 py-2 text-lg">Overview</TabsTrigger>
                    <TabsTrigger value="trends" className="px-4 py-2 text-lg">Usage Trends</TabsTrigger>
                    <TabsTrigger value="language" className="px-4 py-2 text-lg">Language Distribution</TabsTrigger>
                    <TabsTrigger value="devices" className="px-4 py-2 text-lg">Devices & Browsers</TabsTrigger>
                    <TabsTrigger value="sessions" className="px-4 py-2 text-lg">Session Info</TabsTrigger>
                    <TabsTrigger value="detailed" className="px-4 py-2 text-lg">Detailed Analytics</TabsTrigger>
                </TabsList>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.5 }}
                    >
                        <TabsContent value="overview" className="mt-4">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {overviewCards.map((card, index) => (
                                    <motion.div key={card.title} variants={cardVariants} transition={{ delay: index * 0.1 }}>
                                        <Card className={`bg-gradient-to-r ${card.color} text-white shadow-lg rounded-lg overflow-hidden`}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                                                <card.icon className="h-6 w-6" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold">{card.value}</div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="trends" className="mt-4">
                            <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-600">
                                    <CardTitle className="flex items-center text-white">
                                        <TrendingUp className="w-6 h-6 mr-2" />
                                        Usage Trends
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[400px] p-4">
                                    {analytics.dailyUsage && analytics.dailyUsage.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={analytics.dailyUsage}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="queries" stroke="#8884d8" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center text-gray-500">No trend data available.</div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="language" className="mt-4">
                            {renderPieChart(
                                Object.entries(analytics.detailed?.languageDistribution || {}).map(([name, value]) => ({ name, value })),
                                "Language Distribution",
                                <Globe className="w-6 h-6 mr-2" />
                            )}
                        </TabsContent>
                        <TabsContent value="devices" className="mt-4">
                            <div className="grid gap-6 md:grid-cols-2">
                                {renderBarChart(
                                    Object.entries(analytics.sessions?.deviceDistribution || {}).map(([name, value]) => ({ name, value })),
                                    "Device Distribution",
                                    <Smartphone className="w-6 h-6 mr-2" />
                                )}
                                {renderBarChart(
                                    Object.entries(analytics.sessions?.browserDistribution || {}).map(([name, value]) => ({ name, value })),
                                    "Browser Distribution",
                                    <Monitor className="w-6 h-6 mr-2" />
                                )}
                            </div>
                            <div className="mt-6">
                                {renderPieChart(
                                    Object.entries(analytics.sessions?.osDistribution || {}).map(([name, value]) => ({ name, value })),
                                    "Operating System Distribution",
                                    <Settings className="w-6 h-6 mr-2" />
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="sessions" className="mt-4">
                            <div className="grid gap-6 md:grid-cols-2">
                                {renderSessionInfo()}
                                <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                                    <CardHeader className="bg-gradient-to-r from-green-400 to-green-600">
                                        <CardTitle className="flex items-center text-white">
                                            <Users className="w-6 h-6 mr-2" />
                                            Session Statistics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <p><strong>Total Sessions:</strong> {analytics.sessions?.total || 'N/A'}</p>
                                        <p><strong>Active Sessions:</strong> {analytics.sessions?.activeSessions || 'N/A'}</p>
                                        <p><strong>Avg. Session Duration:</strong> {analytics.sessions?.avgSessionDuration ? `${(analytics.sessions.avgSessionDuration / 1000 / 60).toFixed(2)} minutes` : 'N/A'}</p>
                                        <p><strong>Avg. Interactions per Session:</strong> {analytics.sessions?.avgInteractionsPerSession?.toFixed(2) || 'N/A'}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="detailed" className="mt-4">
                            {renderDetailedAnalytics()}
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    );
};

export default UserAnalytics;