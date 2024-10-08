import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { X, Search, Mail, Phone, MessageCircle } from "lucide-react";

const faqSections = [
  {
    title: "Getting Started",
    questions: [
      { q: "How do I start a new chat?", a: "Click the 'New Chat' button in the sidebar to begin a fresh conversation." },
      { q: "Can I upload documents?", a: "Yes, you can upload documents by clicking the document icon in the chat input area." },
      { q: "How do I customize my AI assistant?", a: "Go to Settings > AI Preferences to adjust the assistant's behavior and responses." }
    ]
  },
  {
    title: "Using the AI Assistant",
    questions: [
      { q: "How do I ask a question?", a: "Simply type your question in the chat input box and press Enter or click the send button." },
      { q: "Can the AI understand context?", a: "Yes, the AI maintains context throughout the conversation for more natural interactions." },
      { q: "How do I clear my chat history?", a: "Click on the 'Clear History' option in the sidebar to remove all previous conversations." },
      { q: "Can I save important conversations?", a: "Yes, use the 'Bookmark' feature to save and easily access important chats later." }
    ]
  },
  {
    title: "Account and Settings",
    questions: [
      { q: "How do I change the theme?", a: "Go to Settings > Appearance to switch between light and dark modes." },
      { q: "How can I update my account info?", a: "Navigate to Settings > Account to modify your profile information." },
      { q: "Is my data secure?", a: "We use industry-standard encryption to protect your data. You can review our privacy policy for more details." },
      { q: "How do I delete my account?", a: "Go to Settings > Account > Delete Account. Please note this action is irreversible." }
    ]
  },
  {
    title: "Troubleshooting",
    questions: [
      { q: "What if the AI gives an incorrect answer?", a: "You can report inaccurate responses using the flag icon next to each message." },
      { q: "The assistant is not responding. What should I do?", a: "Try refreshing the page. If the issue persists, please contact our support team." },
      { q: "How can I recover a lost conversation?", a: "Unfortunately, we can't recover deleted conversations. We recommend bookmarking important chats." }
    ]
  }
];

const Help = ({ onClose, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const filteredFAQs = faqSections.map(section => ({
    ...section,
    questions: section.questions.filter(
      q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.questions.length > 0);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    setContactForm({ name: '', email: '', message: '' });
    alert('Thank you for your message. We will get back to you soon!');
  };

  
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-[2000]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl bg-background rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
            style={{ maxHeight: 'calc(100vh - 140px)' }}
          >
            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Help Center</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="faq" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="contact">Contact Support</TabsTrigger>
                  </TabsList>
                  <div className="p-4">
                    <TabsContent value="faq">
                      <div className="relative mb-4">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search for help..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <ScrollArea className="h-[calc(100vh-350px)]">
                        <Accordion type="single" collapsible className="w-full">
                          <AnimatePresence>
                            {filteredFAQs.map((section, index) => (
                              <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, delay: index * 0.1 }}
                              >
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>{section.title}</AccordionTrigger>
                                  <AccordionContent>
                                    {section.questions.map((faq, faqIndex) => (
                                      <div key={faqIndex} className="mb-4">
                                        <h5 className="font-semibold text-primary">{faq.q}</h5>
                                        <p className="text-muted-foreground mt-1">{faq.a}</p>
                                      </div>
                                    ))}
                                  </AccordionContent>
                                </AccordionItem>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </Accordion>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="contact">
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <Input
                          placeholder="Name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          required
                        />
                        <Input
                          type="email"
                          placeholder="Email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          required
                        />
                        <Textarea
                          placeholder="Message"
                          value={contactForm.message}
                          onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          required
                        />
                        <Button type="submit" className="w-full">Send Message</Button>
                      </form>
                      <div className="mt-4 flex justify-around">
                        <Button variant="outline" className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          Email Us
                        </Button>
                        <Button variant="outline" className="flex items-center">
                          <Phone className="mr-2 h-4 w-4" />
                          Call Support
                        </Button>
                        <Button variant="outline" className="flex items-center">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Live Chat
                        </Button>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Help;