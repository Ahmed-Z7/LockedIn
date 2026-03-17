import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Send, MessageCircle, Loader2, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";

export default function AICoachPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState("");
  const [documentContext, setDocumentContext] = useState("");
  const [fileName, setFileName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatMutation = trpc.aiCoach.chat.useMutation();
  const { data: history } = trpc.aiCoach.getHistory.useQuery(undefined, { enabled: isAuthenticated });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">AI Study Coach</h1>
          <p className="text-foreground/60 mb-8">Please log in to chat with your AI coach</p>
          <Button onClick={() => setLocation("/")} className="bg-indigo-600 hover:bg-indigo-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await chatMutation.mutateAsync({
        message: userMessage,
        topic: topic || undefined,
        documentContext: documentContext || undefined,
      });
      setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setDocumentContext(text);
        setFileName(file.name);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearDocument = () => {
    setDocumentContext("");
    setFileName("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-indigo-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              AI Study Coach
            </h1>
          </div>
          <p className="text-foreground/60">Ask anything about your studies. I'm here to help! 🤖</p>
        </motion.div>

        {/* Topic Input and File Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <input
            type="text"
            placeholder="What subject are you studying? (Optional)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-indigo-500/60 transition-all duration-300"
          />
          
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.mdx,.csv"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Study Material (.txt, .md)
            </Button>
            
            {fileName && (
              <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-full text-sm border border-indigo-500/20">
                <FileText className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{fileName}</span>
                <button 
                  onClick={clearDocument}
                  className="hover:text-red-400 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background border border-indigo-500/20 rounded-2xl p-6 h-96 overflow-y-auto mb-6 backdrop-blur-sm"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageCircle className="w-16 h-16 text-indigo-400/30 mx-auto mb-4" />
                <p className="text-foreground/60">Start a conversation with your AI coach!</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-foreground"
                      : "bg-background border border-indigo-500/30 text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {chatMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-background border border-indigo-500/30 text-foreground px-4 py-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI Coach is thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3"
        >
          <input
            type="text"
            placeholder="Ask your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={chatMutation.isPending}
            className="flex-1 bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-indigo-500/60 transition-all duration-300 disabled:opacity-50"
          />
          <Button
            onClick={handleSendMessage}
            disabled={chatMutation.isPending || !input.trim()}
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-foreground px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Chat History */}
        {history && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold mb-6">Previous Conversations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.slice(0, 6).map((chat, idx) => (
                <div
                  key={idx}
                  className="bg-background border border-indigo-500/20 rounded-lg p-4 hover:border-indigo-500/40 transition-all duration-300 cursor-pointer"
                >
                  <p className="text-sm text-foreground/60 mb-2">{chat.topic || "General"}</p>
                  <p className="text-foreground line-clamp-2">{chat.message}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
