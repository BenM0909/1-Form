'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

export function AIAssistant() {
  const { user, userPlan } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: 'user' as const, content: input }
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: input,
          userId: user?.uid 
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer
      }]);
    } catch (error) {
      console.error('Error in AI assistant:', error);
      handleError("Oops! 😅 I ran into a little hiccup while processing your request. Mind giving it another shot or asking me something else about 1-Form?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: errorMessage
    }]);
    setIsLoading(false);
  };

  const hasFormAIAccess = () => {
    return userPlan === 'premium' || userPlan === 'enterprise';
  };

  const renderUpgradeMessage = () => (
    <Alert variant="warning" className="mb-4">
      <AlertTitle>Upgrade to Chat with FormAI! 🚀</AlertTitle>
      <AlertDescription>
        Hey there! 👋 FormAI is exclusively available for our Premium and Enterprise friends. Ready to unlock the full potential of 1-Form? Upgrade your plan and let's chat!
      </AlertDescription>
      <Link href="/pricing">
        <Button 
          variant="default" 
          className="mt-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Explore Upgrade Options 🎉
        </Button>
      </Link>
    </Alert>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 w-96 z-50"
          >
            <Card className="h-[32rem] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>FormAI Assistant</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto">
                {hasFormAIAccess() ? (
                  <>
                    {messages.length === 0 && (
                      <div className="text-center text-gray-500 mt-4">
                        👋 Hi there! I'm FormAI, your friendly 1-Form assistant. How can I help you today?
                      </div>
                    )}
                    {messages.map((message, index) => (
                      <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-3 rounded-lg ${
                          message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}>
                          {message.role === 'assistant' && (
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-2">
                                AI
                              </div>
                              <span className="font-semibold">FormAI</span>
                            </div>
                          )}
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : renderUpgradeMessage()}
              </CardContent>
              {hasFormAIAccess() && (
                <form onSubmit={handleSubmit} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about 1-Form! 😊"
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        className="fixed bottom-4 right-4 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors duration-300"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </>
  );
}

