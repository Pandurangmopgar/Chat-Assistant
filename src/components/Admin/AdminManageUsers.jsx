import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, UserPlus, Trash2, RefreshCw, Search, Moon, Sun } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const supabase = createClient("https://ystrincjuzlkryojxoxe.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdHJpbmNqdXpsa3J5b2p4b3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2MjY2NDgsImV4cCI6MjAzOTIwMjY0OH0.RXbDQZZDDGsUw76O6X93V36-K1qRIhDwWKQBWUj6_uc");

const AdminManageUsers = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState('user');
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('USER').select('*');
            if (error) throw error;
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateRole = async (userId, newRole) => {
        try {
            const { error } = await supabase.from('USER').update({ role: newRole }).eq('id', userId);
            if (error) throw error;
            toast({ title: "Success", description: "User role updated successfully" });
            await fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
            toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
        }
    };

    const handleInviteUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('USER').insert([{ email: newUserEmail, name: newUserName, role: newUserRole }]);
            if (error) throw error;
            setNewUserEmail('');
            setNewUserName('');
            setNewUserRole('user');
            setIsInviteDialogOpen(false);
            toast({ title: "Success", description: "User added successfully" });
            await fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
            toast({ title: "Error", description: "Failed to add user", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };


    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRemoveUser = async (userId) => {
        setLoading(true);
        try {
            const { error } = await supabase.from('USER').delete().eq('id', userId);
            if (error) throw error;
            toast({ title: "Success", description: "User removed successfully" });
            await fetchUsers();
        } catch (error) {
            console.error('Error removing user:', error);
            toast({ title: "Error", description: "Failed to remove user", variant: "destructive" });
        } finally {
            setLoading(false);
            setIsRemoveDialogOpen(false);
        }
    };

 
    if (!user || !user.primaryEmailAddress || user.primaryEmailAddress.emailAddress !== 'pandurangmopgar7410@gmail.com') {
        return (
            <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <Card className="w-[350px] text-center">
                    <CardContent className="pt-6">
                        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Access Denied</h2>
                        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>You do not have permission to view this page.</p>
                        <Button onClick={() => window.location.href = '/'}>Return to Home</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`container mx-auto p-8 min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
        >
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold">Manage Users</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDarkMode(!darkMode)}
                    className={`rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
            </div>
            
            <Card className={`mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="relative flex-1 w-full sm:w-auto">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <Input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`pl-10 w-full ${darkMode ? 'bg-gray-700 text-gray-100 placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'}`}
                            />
                        </div>
                        <div className="flex space-x-4">
                            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <UserPlus className="mr-2 h-4 w-4" /> Add New User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className={`sm:max-w-[425px] ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
                                    <DialogHeader>
                                        <DialogTitle>Add New User</DialogTitle>
                                        <DialogDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                            Enter the details for the new user.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleInviteUser} className="space-y-4">
                                        <div>
                                            <Label htmlFor="email" className={darkMode ? 'text-gray-200' : ''}>Email</Label>
                                            <Input
                                                id="email"
                                                type="email" 
                                                value={newUserEmail} 
                                                onChange={(e) => setNewUserEmail(e.target.value)}
                                                placeholder="New user email"
                                                required
                                                className={darkMode ? 'bg-gray-700 text-gray-100' : ''}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="name" className={darkMode ? 'text-gray-200' : ''}>Name</Label>
                                            <Input
                                                id="name"
                                                type="text" 
                                                value={newUserName} 
                                                onChange={(e) => setNewUserName(e.target.value)}
                                                placeholder="New user name"
                                                required
                                                className={darkMode ? 'bg-gray-700 text-gray-100' : ''}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="role" className={darkMode ? 'text-gray-200' : ''}>Role</Label>
                                            <Select value={newUserRole} onValueChange={setNewUserRole}>
                                                <SelectTrigger className={darkMode ? 'bg-gray-700 text-gray-100' : ''}>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button type="submit" disabled={loading} className="w-full">
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Add User
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <Button 
                                onClick={fetchUsers} 
                                variant="outline" 
                                className={darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border-gray-600' : ''}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
    
            {error && <p className="text-red-500 mb-4">{error}</p>}
    
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <Table>
                    <TableHeader>
                            <TableRow className={darkMode ? 'border-gray-700' : 'border-gray-200'}>
                                <TableHead className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>User</TableHead>
                                <TableHead className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Email</TableHead>
                                <TableHead className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Role</TableHead>
                                <TableHead className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {filteredUsers.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        layout
                                        className={`
                                            ${darkMode 
                                                ? 'hover:bg-gray-700 text-gray-100' 
                                                : 'hover:bg-gray-200'
                                            } 
                                            transition-colors
                                        `}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Select
                                                    value={user.role}
                                                    onValueChange={(newRole) => handleUpdateRole(user.id, newRole)}
                                                >
                                                    <SelectTrigger className={`w-[100px] ${darkMode ? 'bg-gray-700 text-gray-100' : ''}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="user">User</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button 
                                                    variant="destructive" 
                                                    size="icon" 
                                                    onClick={() => {
                                                        setUserToRemove(user);
                                                        setIsRemoveDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </Card>
            )}
    
            <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <DialogContent className={`sm:max-w-[425px] ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
                    <DialogHeader>
                        <DialogTitle>Confirm User Removal</DialogTitle>
                        <DialogDescription className={darkMode ? 'text-gray-400' : ''}>
                            Are you sure you want to remove this user? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsRemoveDialogOpen(false)}
                            className={darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : ''}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => userToRemove && handleRemoveUser(userToRemove.id)}
                        >
                            Remove User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    
            <Toaster />
        </motion.div>
    );}
export default AdminManageUsers;