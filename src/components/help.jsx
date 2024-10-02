import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiHelpCircle, FiBook, FiMessageCircle, FiChevronDown } from 'react-icons/fi';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordion, setOpenAccordion] = useState(null);

  const faqData = [
    { 
      question: "How do I start a new chat?", 
      answer: "To start a new chat, click on the 'New Chat' button at the top of the sidebar." 
    },
    { 
      question: "Can I upload documents or images?", 
      answer: "Yes, you can upload documents (PDF) and images using the buttons at the bottom of the chat interface." 
    },
    { 
      question: "How do I switch between light and dark mode?", 
      answer: "You can toggle between light and dark mode using the sun/moon icon in the top right corner of the main interface." 
    },
    // Add more FAQ items as needed
  ];

  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div className="help-page bg-gray-100 dark:bg-gray-900 min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enterprise Assistant Help Center</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 relative">
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <QuickAccessCard
              icon={<FiHelpCircle />}
              title="Quick Start Guide"
              description="Learn the basics of using our AI assistant."
            />
            <QuickAccessCard
              icon={<FiBook />}
              title="Tutorials"
              description="Step-by-step tutorials for advanced features."
            />
            <QuickAccessCard
              icon={<FiMessageCircle />}
              title="Contact Support"
              description="Need more help? Reach out to our support team."
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Frequently Asked Questions</h2>
            {filteredFAQs.map((faq, index) => (
              <Accordion
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openAccordion === index}
                toggleAccordion={() => toggleAccordion(index)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const QuickAccessCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md cursor-pointer"
  >
    <div className="text-3xl mb-4 text-blue-500">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

const Accordion = ({ question, answer, isOpen, toggleAccordion }) => (
  <motion.div
    initial={false}
    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
  >
    <motion.header
      onClick={toggleAccordion}
      className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 dark:bg-gray-800"
    >
      <h3 className="text-lg font-medium text-gray-800 dark:text-white">{question}</h3>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <FiChevronDown className="text-gray-500" />
      </motion.div>
    </motion.header>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { opacity: 1, height: "auto" },
            collapsed: { opacity: 0, height: 0 }
          }}
          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
          <div className="p-4 text-gray-700 dark:text-gray-300">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default Help;