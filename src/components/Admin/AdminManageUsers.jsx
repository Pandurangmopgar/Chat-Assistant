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
// import { useToast } from "@/components/ui/use-toast";

// import { useToast } from "@/components/hooks/use-toast"
import {useToast} from  "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

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
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('USER')
                .select('*');
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
            const { error } = await supabase
                .from('USER')
                .update({ role: newRole })
                .eq('id', userId);
            if (error) throw error;
            toast({
                title: "Success",
                description: "User role updated successfully",
            });
            await fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
            toast({
                title: "Error",
                description: "Failed to update user role",
                variant: "destructive",
            });
        }
    };

    const handleInviteUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from('USER')
                .insert([
                    { email: newUserEmail, name: newUserName, role: newUserRole }
                ]);
            if (error) throw error;
            setNewUserEmail('');
            setNewUserName('');
            setNewUserRole('user');
            setIsInviteDialogOpen(false);
            toast({
                title: "Success",
                description: "User added successfully",
            });
            await fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
            toast({
                title: "Error",
                description: "Failed to add user",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (userId) => {
        if (window.confirm('Are you sure you want to remove this user?')) {
            setLoading(true);
            try {
                const { error } = await supabase
                    .from('USER')
                    .delete()
                    .eq('id', userId);
                if (error) throw error;
                toast({
                    title: "Success",
                    description: "User removed successfully",
                });
                await fetchUsers();
            } catch (error) {
                console.error('Error removing user:', error);
                toast({
                    title: "Error",
                    description: "Failed to remove user",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }
    };

    if (!user || !user.primaryEmailAddress || user.primaryEmailAddress.emailAddress !== 'pandurangmopgar7410@gmail.com') {
        return <div className="flex items-center justify-center h-screen">Access Denied</div>;
    }




    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto p-8"
        >
            <h2 className="text-3xl font-bold mb-8">Manage Users</h2>
            
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="mb-6">Add New User</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new user.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInviteUser} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email" 
                                value={newUserEmail} 
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                placeholder="New user email"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text" 
                                value={newUserName} 
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="New user name"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={newUserRole} onValueChange={setNewUserRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Add User
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {users.map((user) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    layout
                                >
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.role}
                                            onValueChange={(newRole) => handleUpdateRole(user.id, newRole)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="destructive" onClick={() => handleRemoveUser(user.id)}>
                                            Remove
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            )}

<Toaster />

        </motion.div>
    );
};

export default AdminManageUsers;