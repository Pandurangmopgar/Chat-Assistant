import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Moon, Sun, Search, FileText, LogIn } from 'lucide-react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

const API_BASE_URL = 'http://localhost:3000';

const AdminDocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [department, setDepartment] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const { user, isSignedIn } = useUser();

  useEffect(() => {
    fetchDocuments();
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setFiles(Array.from(event.dataTransfer.files));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !department) {
      console.error("Please select files and a department.");
      return;
    }

    setUploadProgress({});

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const presignedUrlResponse = await axios.post(`${API_BASE_URL}/api/getPresignedUrl`, {
          fileName: file.name,
          fileType: file.type,
          department: department
        });

        const { uploadUrl, fileKey, documentId } = presignedUrlResponse.data;

        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [file.name]: percentCompleted }));
          }
        });

        await axios.post(`${API_BASE_URL}/api/confirmUpload`, { fileKey, documentId, department });

        console.log(`${file.name} uploaded successfully!`);
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
      }
    }

    setFiles([]);
    setUploadProgress({});
    fetchDocuments();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
      console.log("Document deleted successfully.");
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const filteredDocuments = useCallback(() => {
    return documents.filter(doc => 
      (filterDepartment === 'all' || doc.department.toLowerCase() === filterDepartment.toLowerCase()) &&
      doc.original_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, filterDepartment, searchTerm]);

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-purple-500">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-4">Please sign in to access this page.</p>
          <SignInButton mode="modal">
            <Button>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </SignInButton>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white">
      <div className="container mx-auto px-4 py-8 flex flex-col h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Document Management</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="bg-white/10 hover:bg-white/20"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        <Card className="mb-8 bg-white/10 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Drag and drop files here, or click to select files</p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                  accept=".pdf,.txt"
                  multiple
                />
                <Button asChild className="mt-4">
                  <label htmlFor="file-input">Select Files</label>
                </Button>
              </div>
              <div className="flex space-x-4">
                <Select onValueChange={setDepartment} value={department}>
                  <SelectTrigger className="w-[180px] bg-white/10">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleUpload} disabled={files.length === 0 || !department}>
                  Upload Documents
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <motion.div
              key={fileName}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <p className="text-sm font-medium">{fileName}</p>
              <Progress value={progress} className="w-full" />
            </motion.div>
          ))}
        </AnimatePresence>

        <Card className="bg-white/10 backdrop-blur-lg flex-grow overflow-hidden">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-grow mr-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 text-white placeholder-gray-300"
                />
              </div>
              <Select onValueChange={setFilterDepartment} value={filterDepartment}>
                <SelectTrigger className="w-[180px] bg-white/10">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Uploaded Documents</h2>
            <div className="overflow-y-auto flex-grow">
              <AnimatePresence>
                {filteredDocuments().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments().map((doc) => (
                      <motion.div
                        key={doc.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <FileText className="h-8 w-8 text-blue-500" />
                              <div>
                                <p className="font-medium">{doc.original_name}</p>
                                <p className="text-sm text-gray-300">{doc.department}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-100/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-full"
                  >
                    <p className="text-lg text-gray-400">No documents found. Upload some documents to get started!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDocumentUpload;