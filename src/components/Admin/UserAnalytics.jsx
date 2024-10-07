import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Context } from '../../context/Context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, Users, MessageSquare, Image, FileText, Zap, Globe } from "lucide-react";

const UserAnalytics = () => {
    const { getAnalytics, error, setError } = useContext(Context);
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
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!analytics) {
        return <div>No analytics data available.</div>;
    }

    const overviewCards = [
        { title: "Total Queries", value: analytics.total || 0, icon: MessageSquare },
        { title: "Unique Users", value: analytics.uniqueUsers || 0, icon: Users },
        { title: "Avg. Response Time", value: `${(analytics.avgResponseTime || 0).toFixed(2)}s`, icon: Zap },
        { title: "Image Queries", value: analytics.byType?.image_query || 0, icon: Image },
        { title: "Document Queries", value: analytics.byType?.document_query || 0, icon: FileText },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const renderLanguageDistribution = () => {
        if (!analytics.detailed || !analytics.detailed.languageDistribution) {
            return <div>No language distribution data available.</div>;
        }

        const data = Object.entries(analytics.detailed.languageDistribution).map(([name, value]) => ({
            name,
            value
        }));

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Globe className="w-6 h-6 mr-2" />
                        Language Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
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
    };

    return (
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Usage Trends</TabsTrigger>
                <TabsTrigger value="details">Detailed Analytics</TabsTrigger>
                <TabsTrigger value="language">Language Distribution</TabsTrigger>
            </TabsList>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    transition={{ duration: 0.5 }}
                >
                    <TabsContent value="overview" className="mt-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {overviewCards.map((card, index) => (
                                <motion.div key={card.title} variants={cardVariants} transition={{ delay: index * 0.1 }}>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                            <card.icon className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{card.value}</div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="trends" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Usage Trends</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                {analytics.dailyUsage && analytics.dailyUsage.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics.dailyUsage}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="queries" stroke="#8884d8" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div>No trend data available.</div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="details" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detailed Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left">Metric</th>
                                            <th className="text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.detailed && Object.entries(analytics.detailed).map(([key, value]) => (
                                            <tr key={key}>
                                                <td className="text-left">{key}</td>
                                                <td className="text-right">
                                                    {typeof value === 'object' ? JSON.stringify(value) : value?.toString() || 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="language" className="mt-4">
                        {renderLanguageDistribution()}
                    </TabsContent>
                </motion.div>
            </AnimatePresence>
        </Tabs>
    );
};

export default UserAnalytics;