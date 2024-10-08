import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Globe, Palette, Lock, Bell, User, Bot } from "lucide-react";
import { Context } from '../../context/Context';

const settingsSections = [
  { id: 'general', title: 'General', icon: Globe },
  { id: 'appearance', title: 'Appearance', icon: Palette },
  { id: 'privacy', title: 'Privacy & Security', icon: Lock },
  { id: 'notifications', title: 'Notifications', icon: Bell },
  { id: 'account', title: 'Account', icon: User },
  { id: 'aiPreferences', title: 'AI Preferences', icon: Bot },
];

function Settings({ onClose }) {
  const { darkMode, setDarkMode } = useContext(Context);
  const [activeSection, setActiveSection] = useState('general');
  const [accountInfo, setAccountInfo] = useState({ name: '', email: '' });
  const [aiPreferences, setAIPreferences] = useState({ customPrompt: '' });

  const handleAccountInfoChange = (e) => {
    setAccountInfo({ ...accountInfo, [e.target.name]: e.target.value });
  };

  const handleAIPreferencesChange = (e) => {
    setAIPreferences({ ...aiPreferences, [e.target.name]: e.target.value });
  };

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Language</h3>
            <Select defaultValue="english">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Theme</h3>
            <Select value={darkMode ? "dark" : "light"} onValueChange={(value) => setDarkMode(value === "dark")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Collection</h3>
            <div className="flex items-center space-x-2">
              <Switch id="data-collection" />
              <label htmlFor="data-collection">Allow data collection for improving AI</label>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Email Notifications</h3>
            <div className="flex items-center space-x-2">
              <Switch id="email-notifications" />
              <label htmlFor="email-notifications">Receive email updates</label>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Information</h3>
            <Input
              name="name"
              placeholder="Full Name"
              value={accountInfo.name}
              onChange={handleAccountInfoChange}
            />
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              value={accountInfo.email}
              onChange={handleAccountInfoChange}
            />
            <Button>Update Profile</Button>
          </div>
        );
      case 'aiPreferences':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Preferences</h3>
            <p className="text-sm text-muted-foreground">Customize how the AI assistant behaves by providing a system prompt:</p>
            <Textarea
              name="customPrompt"
              placeholder="E.g., You are a helpful assistant that specializes in programming and technology."
              value={aiPreferences.customPrompt}
              onChange={handleAIPreferencesChange}
            />
            <Button>Save Preferences</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-[2000]"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl bg-background rounded-lg shadow-xl overflow-hidden border border-border"
          style={{ maxHeight: 'calc(100vh - 140px)' }}
        >
          <Card className="border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Settings</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex h-[calc(100vh-200px)]">
                <ScrollArea className="w-1/4 border-r border-border">
                  {settingsSections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "secondary" : "ghost"}
                      className={`w-full justify-start text-left transition-all duration-200`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <section.icon className="mr-2 h-4 w-4" />
                      {section.title}
                    </Button>
                  ))}
                </ScrollArea>
                <div className="flex-1 p-6 overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">{settingsSections.find(s => s.id === activeSection).title}</h2>
                  {renderSettingsContent()}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Settings;