import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiUpload, FiUsers, FiSettings, FiSearch, FiBarChart2, FiAlertCircle } from 'react-icons/fi';
import { useUser } from "@clerk/clerk-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (user && user.primaryEmailAddress) {
      setIsAuthorized(user.primaryEmailAddress.emailAddress === 'pandurangmopgar7410@gmail.com');
    }
  }, [user]);

  const adminFunctions = [
    { name: 'Document Upload', icon: <FiUpload className="w-6 h-6" />, path: '/admin/upload-document', description: 'Upload and manage documents' },
    { name: 'User Analytics', icon: <FiBarChart2 className="w-6 h-6" />, path: '/admin/user-analytics', description: 'View user engagement statistics' },
    { name: 'Manage Users', icon: <FiUsers className="w-6 h-6" />, path: '/admin/manage-users', description: 'Manage user accounts and permissions' },
  ];

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-700 to-blue-500">
        <Card className="w-[350px] text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>You do not have permission to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-blue-500 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 bg-white bg-opacity-20 text-white placeholder-gray-300 border-none w-64"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
            </div>
            <Button variant="secondary" onClick={() => navigate('/')}>Exit Admin</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminFunctions.map((func, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="bg-white bg-opacity-10 border-none text-white hover:bg-opacity-20 transition-all cursor-pointer h-full"
                    onClick={() => navigate(func.path)}>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    {func.icon}
                    <span className="ml-2">{func.name}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-200">
                    {func.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full mt-4">
                    Access
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white bg-opacity-10 border-none text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FiAlertCircle className="w-6 h-6 mr-2" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>New user registration spike detected</li>
                <li>System update scheduled for next week</li>
                <li>Unusual login activity reported</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-10 border-none text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FiBarChart2 className="w-6 h-6 mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <div>
                  <p className="text-gray-300">Active Sessions</p>
                  <p className="text-2xl font-bold">56</p>
                </div>
                <div>
                  <p className="text-gray-300">Documents Uploaded</p>
                  <p className="text-2xl font-bold">789</p>
                </div>
                <div>
                  <p className="text-gray-300">System Health</p>
                  <p className="text-2xl font-bold text-green-400">98%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;