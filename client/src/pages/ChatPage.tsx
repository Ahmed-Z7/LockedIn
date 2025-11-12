import { motion } from 'framer-motion';
import { Send, Paperclip, Smile, Phone, Video } from 'lucide-react';
import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, author: 'AI Coach', text: 'Hello! How can I help you with your studies today?', timestamp: '10:30 AM', isAI: true },
    { id: 2, author: 'You', text: 'I need help understanding quadratic equations', timestamp: '10:31 AM', isAI: false },
    { id: 3, author: 'AI Coach', text: 'Great! Quadratic equations are equations of the form ax² + bx + c = 0. Let me break this down for you...', timestamp: '10:32 AM', isAI: true },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        author: 'You',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: false,
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container border-b border-gray-700/50 pb-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Coach</h2>
              <p className="text-sm text-green-400">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-400" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-400" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="container flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${msg.isAI ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-600 to-blue-600'} rounded-2xl px-4 py-3`}>
              <p className="text-sm text-gray-300 mb-1">{msg.author}</p>
              <p className="text-white">{msg.text}</p>
              <p className="text-xs text-gray-400 mt-1">{msg.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container border-t border-gray-700/50 pt-4 pb-4"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-400" />
          </motion.button>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all duration-300"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all duration-300 glow-purple"
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
