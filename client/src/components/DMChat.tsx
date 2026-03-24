import { useState, useEffect, useRef, createContext, useContext } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2, Maximize2, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

// ─── Global DM Chat Context ──────────────────────────────────────────────────
interface DMChatState {
  openChatWithUser: (userId: number, userName: string, userAvatar?: string | null) => void;
  closeChat: () => void;
}

const DMChatContext = createContext<DMChatState>({
  openChatWithUser: () => {},
  closeChat: () => {},
});

export const useDMChat = () => useContext(DMChatContext);

// ─── DM Chat Window ───────────────────────────────────────────────────────────
function ChatWindow({
  userId,
  userName,
  userAvatar,
  onClose,
}: {
  userId: number;
  userName: string;
  userAvatar?: string | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const messagesQuery = trpc.messaging.getMessages.useQuery(userId, {
    refetchInterval: 3000,
  });

  const sendMessage = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      utils.messaging.getMessages.invalidate(userId);
      utils.messaging.getConversations.invalidate();
    },
  });

  useEffect(() => {
    if (!minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesQuery.data, minimized]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({ receiverId: userId, content: message });
  };

  const handleFullscreen = () => {
    setLocation(`/messages?user=${userId}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-[340px] bg-[#0D0D18] border border-white/10 rounded-[1.5rem] shadow-2xl shadow-purple-500/20 overflow-hidden flex flex-col"
      style={{ maxHeight: minimized ? "60px" : "480px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-b border-white/5 shrink-0">
        <Avatar className="w-8 h-8 border border-purple-500/30">
          <AvatarImage src={userAvatar || undefined} />
          <AvatarFallback className="text-xs bg-purple-800">{userName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{userName}</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Online</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            title="Open Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            {minimized ? <MessageCircle className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!minimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messagesQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
              </div>
            ) : messagesQuery.data?.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-sm font-medium">
                Start the conversation ✨
              </div>
            ) : (
              messagesQuery.data?.map((msg) => {
                const isOwn = msg.senderId !== userId;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isOwn
                          ? "bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-500/20"
                          : "bg-white/5 border border-white/5 text-white/80 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-[9px] mt-1 ${isOwn ? "text-white/50" : "text-white/20"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="bg-transparent border-none focus-visible:ring-0 text-sm text-white placeholder:text-white/20 py-2"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sendMessage.isPending}
                className="bg-purple-600 hover:bg-purple-500 rounded-lg h-8 w-8 p-0 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ─── Provider + Floating Container ───────────────────────────────────────────
export function DMChatProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [openChats, setOpenChats] = useState<
    { userId: number; userName: string; userAvatar?: string | null }[]
  >([]);

  const openChatWithUser = (userId: number, userName: string, userAvatar?: string | null) => {
    setOpenChats((prev) => {
      if (prev.find((c) => c.userId === userId)) return prev; // already open
      return [...prev, { userId, userName, userAvatar }];
    });
  };

  const closeChat = (userId?: number) => {
    if (userId === undefined) {
      setOpenChats([]);
    } else {
      setOpenChats((prev) => prev.filter((c) => c.userId !== userId));
    }
  };

  return (
    <DMChatContext.Provider value={{ openChatWithUser, closeChat }}>
      {children}

      {/* Floating Chat Windows — bottom-right */}
      {isAuthenticated && openChats.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-row-reverse items-end gap-3">
          <AnimatePresence>
            {openChats.map((chat) => (
              <ChatWindow
                key={chat.userId}
                userId={chat.userId}
                userName={chat.userName}
                userAvatar={chat.userAvatar}
                onClose={() => closeChat(chat.userId)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </DMChatContext.Provider>
  );
}
