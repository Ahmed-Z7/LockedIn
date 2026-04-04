import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation, useParams } from 'wouter';
import { useDMChat } from '@/components/DMChat';
import { 
  Hash, Users, MessageSquare, Search, Plus, 
  Settings, ChevronRight, Send, Heart, MessageCircle,
  Shield, BookOpen, Clock, Layout, UserPlus, CheckCircle2,
  Award, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// --- SUB-COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: { icon: any, label: string, active?: boolean, onClick: () => void, badge?: number | string }) => (
  <motion.button
    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all duration-200 ${
      active ? 'bg-white/10 text-white shadow-lg shadow-purple-500/10' : 'text-white/40 hover:text-white/70'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    {badge && <span className="px-2 py-0.5 rounded-full bg-purple-500 text-[10px] text-white font-bold">{badge}</span>}
  </motion.button>
);

const GroupCard = ({ name, description, role, memberCount, onClick }: { name: string, description: string | null, role?: string, memberCount?: number, onClick: () => void }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    onClick={onClick}
    className="p-5 rounded-3xl bg-card/30 border border-white/5 backdrop-blur-xl hover:border-purple-500/30 transition-all cursor-pointer relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex justify-between items-start relative z-10 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xl font-bold">
        {name[0]}
      </div>
      <div className="flex flex-col items-end gap-2">
        {role === 'admin' && (
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full border border-purple-400/20">
            Admin
          </span>
        )}
        <span className="text-[10px] font-bold text-white/40 flex items-center gap-1">
          <Users size={10} /> {memberCount || 0}
        </span>
      </div>
    </div>
    <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">{name}</h3>
    <p className="text-sm text-white/40 line-clamp-2">{description || 'No description provided.'}</p>
  </motion.div>
);

// --- MAIN PAGE ---

export default function CommunityPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { openChatWithUser } = useDMChat();
  const params = useParams();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'general' | 'groups' | 'messages' | 'search'>('general');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  
  // Data Queries
  const myGroups = trpc.groups.listMyGroups.useQuery();
  const conversations = trpc.messaging.getConversations.useQuery();
  const posts = trpc.groupContent.getFeed.useQuery(selectedGroupId || 0, { enabled: !!selectedGroupId });
  const generalPosts = trpc.community.getPosts.useQuery();
  
  // Search Logic
  const [searchQuery, setSearchQuery] = useState('');
  const userSearch = trpc.social.searchUsers.useQuery(searchQuery, { enabled: searchQuery.length > 2 });
  const groupSearch = trpc.groups.search.useQuery(searchQuery, { enabled: searchQuery.length > 2 });

  // Modals
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    if (params.id) {
        setSelectedGroupId(Number(params.id));
        setActiveTab('groups');
    }
    if (location === '/groups/create') {
        setShowCreateGroup(true);
    }
  }, [params.id, location]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex pt-16">
      <AnimatePresence>
        {showCreateGroup && (
          <CreateGroupModal 
            onClose={() => { setShowCreateGroup(false); setLocation('/groups'); }} 
            onCreated={() => { myGroups.refetch(); setShowCreateGroup(false); setLocation('/groups'); }} 
          />
        )}
      </AnimatePresence>
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-[300px] border-r border-white/5 bg-[#0D0D14]/50 backdrop-blur-3xl flex flex-col p-6 fixed h-full z-20">
        <div className="mb-10">
          <h2 className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
            LOCKEDIN SOCIAL
          </h2>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={16} />
            <Input 
              placeholder="Search people..." 
              className="pl-10 bg-white/5 border-white/5 rounded-xl focus:ring-purple-500/50"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveTab('search');
              }}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-8">
            {/* Main Navigation */}
            <div className="space-y-1">
              <SidebarItem 
                icon={Hash} 
                label="Global Feed" 
                active={activeTab === 'general'} 
                onClick={() => { setActiveTab('general'); setSelectedGroupId(null); setLocation('/community'); }}
              />
              <SidebarItem 
                icon={Users} 
                label="Study Groups" 
                active={activeTab === 'groups' && !selectedGroupId} 
                onClick={() => { setActiveTab('groups'); setSelectedGroupId(null); }}
              />
              <SidebarItem 
                icon={MessageSquare} 
                label="Direct Messages" 
                active={activeTab === 'messages'} 
                onClick={() => { setActiveTab('messages'); setSelectedGroupId(null); }}
              />
            </div>

            {/* My Groups List */}
            <div>
              <div className="flex items-center justify-between px-4 mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">My Groups</span>
                <button onClick={() => setLocation('/groups/create')} className="text-purple-400 hover:text-purple-300 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {myGroups.data?.map(g => (
                  <SidebarItem 
                    key={g.id}
                    icon={Layout} 
                    label={g.name} 
                    active={selectedGroupId === g.id} 
                    onClick={() => { setSelectedGroupId(g.id); setActiveTab('groups'); setLocation(`/groups/${g.id}`); }}
                  />
                ))}
              </div>
            </div>

            {/* Recent DMs */}
            <div>
              <div className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Recent Chats</div>
              <div className="space-y-1">
                {conversations.data?.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => { setActiveTab('messages'); setLocation(`/messages?user=${c.id}`); }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-xl transition-all ${
                        new URLSearchParams(window.location.search).get('user') === String(c.id) ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[10px]">{c.username?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span>{c.name || c.username || 'Unknown'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-white/40 hover:text-white transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium">Workspace Settings</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 ml-[300px] bg-[#0A0A0F] relative min-h-screen">
        <ScrollArea className="h-screen pt-12 pb-24 px-12">
          <AnimatePresence mode="wait">
            
            {/* 1. SEARCH RESULTS */}
            {activeTab === 'search' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-12">
                 <div className="space-y-6">
                    <h2 className="text-3xl font-black tracking-tighter italic">PEOPLE SEARCH <span className="text-purple-500">_</span> "{searchQuery}"</h2>
                    {userSearch.data?.map(u => (
                        <div key={u.id} className="p-6 rounded-3xl bg-card/30 border border-white/5 flex items-center justify-between hover:border-purple-500/30 transition-all group">
                           <div className="flex items-center gap-4">
                              <Avatar className="w-14 h-14 border-2 border-white/5 group-hover:border-purple-500/50 transition-colors">
                                 <AvatarImage src={u.avatar || undefined} />
                                 <AvatarFallback>{u.username?.[0] || '?'}</AvatarFallback>
                              </Avatar>
                              <div>
                                 <h4 className="font-bold flex items-center gap-2 text-xl">
                                   {u.name || 'Anonymous'}
                                   <span className="px-3 py-1 rounded-full bg-purple-500/10 text-[10px] text-purple-400 border border-purple-500/20 font-black uppercase">Lv. {u.level || 1}</span>
                                 </h4>
                                 <p className="text-sm text-white/40">@{u.username || 'unknown'} • {u.xp?.toLocaleString() || 0} XP earned</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                             <Button 
                               onClick={() => openChatWithUser(u.id, u.name || u.username || 'User', u.avatar)}
                               className="bg-purple-600 hover:bg-purple-500 rounded-2xl h-12 px-6 font-bold"
                             >
                               <MessageSquare className="mr-2" size={18} /> Message
                             </Button>
                             <Button onClick={() => setLocation(`/profile/${u.id}`)} variant="outline" className="rounded-2xl h-12 px-6 border-white/10 hover:bg-white/5">View Profile</Button>
                           </div>
                        </div>
                    ))}
                    {userSearch.data?.length === 0 && searchQuery.length > 2 && !userSearch.isLoading && (
                        <div className="text-white/20 font-bold uppercase tracking-widest text-center py-6 border border-dashed border-white/5 rounded-3xl">No users match your criteria.</div>
                    )}
                 </div>

                 <div className="space-y-6">
                    <h2 className="text-3xl font-black tracking-tighter italic">GROUP SEARCH <span className="text-blue-500">_</span> "{searchQuery}"</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groupSearch.data?.map(g => (
                            <GroupCard 
                                key={g.id}
                                name={g.name}
                                description={g.description}
                                memberCount={g.memberCount}
                                onClick={() => { setSelectedGroupId(g.id); setLocation(`/groups/${g.id}`); }}
                            />
                        ))}
                    </div>
                    {groupSearch.data?.length === 0 && searchQuery.length > 2 && !groupSearch.isLoading && (
                        <div className="text-white/20 font-bold uppercase tracking-widest text-center py-12 border border-dashed border-white/5 rounded-3xl">No collectives found in this sector.</div>
                    )}
                 </div>
              </motion.div>
            )}

            {/* 2. GLOBAL FEED */}
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto py-12">
                <div className="flex justify-between items-center mb-12">
                   <div>
                      <h1 className="text-5xl font-black tracking-tighter mb-2">LOCKEDIN<span className="text-purple-500">·</span>COMMUNITY</h1>
                      <p className="text-white/40 font-medium tracking-wide">Connecting students world-wide.</p>
                   </div>
                   <div className="flex gap-4">
                      <Button 
                        onClick={() => { setActiveTab('groups'); setLocation('/groups'); }} 
                        variant="outline" 
                        className="rounded-2xl h-14 px-8 font-bold border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                      >
                        <Users className="mr-2" size={20} /> Groups Community
                      </Button>
                      <Button onClick={() => setLocation('/add-post')} className="bg-purple-600 hover:bg-purple-700 rounded-2xl h-14 px-8 font-bold shadow-lg shadow-purple-500/20">
                        <Plus className="mr-2" size={20} /> New Post
                      </Button>
                   </div>
                </div>
                
                <div className="space-y-8">
                  {generalPosts.data?.map((post: any) => (
                    <PostItem key={post.id} post={post} type="community" />
                  ))}
                </div>
              </motion.div>
            )}

            {/* 3. DIRECT MESSAGES */}
            {activeTab === 'messages' && (
              <DirectMessagesView 
                selectedUserId={params.userId ? Number(params.userId) : (new URLSearchParams(window.location.search).get('user') ? Number(new URLSearchParams(window.location.search).get('user')) : null)} 
              />
            )}

            {/* 4. GROUP DASHBOARD */}
            {activeTab === 'groups' && selectedGroupId && (
              <GroupEnvironment groupId={selectedGroupId} />
            )}

            {/* 5. GROUPS HUB */}
            {activeTab === 'groups' && !selectedGroupId && (
              <GroupsHub 
                myGroups={myGroups.data || []} 
                onSelectGroup={(id: number) => { setSelectedGroupId(id); setLocation(`/groups/${id}`); }}
                onCreateGroup={() => setShowCreateGroup(true)}
              />
            )}
          </AnimatePresence>
        </ScrollArea>
      </main>
    </div>
  );
}

// --- GROUPS HUB ---

const GroupsHub = ({ myGroups, onSelectGroup, onCreateGroup }: any) => {
    const [viewMode, setViewMode] = useState<'my-groups' | 'discover'>('my-groups');
    const { data: discoverGroups, refetch: refetchDiscover } = trpc.groups.discover.useQuery();
    const utils = trpc.useUtils();
    
    const requestJoin = trpc.groups.requestJoin.useMutation({
        onSuccess: () => {
            toast.success("Sync request transmitted to overseers.");
            utils.groups.getGroup.invalidate();
            refetchDiscover();
        }
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-12">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter mb-4 italic">
                        {viewMode === 'my-groups' ? 'STUDY·COLLECTIVES' : 'DISCOVER·NEURAL·HUBS'}
                    </h1>
                    <p className="text-white/40 font-medium tracking-wide">
                        {viewMode === 'my-groups' 
                            ? 'Your private network of high-performance study cells.' 
                            : 'Global collectives searching for peak performance peers.'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button 
                        onClick={() => setViewMode(viewMode === 'my-groups' ? 'discover' : 'my-groups')}
                        variant="outline" 
                        className={`h-14 px-8 rounded-2xl border-white/10 ${viewMode === 'discover' ? 'bg-white text-black border-white' : ''}`}
                    >
                        {viewMode === 'my-groups' ? 'Discovery Mode' : 'My Hubs'}
                    </Button>
                    <Button onClick={onCreateGroup} className="bg-purple-600 hover:bg-purple-700 rounded-2xl h-14 px-8 font-bold shadow-lg shadow-purple-500/20">
                        Initialize Collective
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(viewMode === 'my-groups' ? myGroups : discoverGroups)?.map((g: any) => (
                    <motion.div
                        key={g.id}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => (viewMode === 'my-groups' || g.isPrivate === 0) && onSelectGroup(g.id)}
                        className="p-8 rounded-[2.5rem] bg-card/30 border border-white/5 backdrop-blur-xl hover:border-purple-500/30 transition-all cursor-pointer relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-black italic shadow-lg shadow-purple-500/20">
                                {g.name[0]}
                            </div>
                            {viewMode === 'my-groups' ? (
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                    g.role === 'admin' ? 'text-purple-400 border-purple-400/20 bg-purple-400/10' : 'text-white/20 border-white/5'
                                }`}>
                                    {g.role === 'admin' ? 'Overseer' : 'Peer'}
                                </span>
                            ) : (
                                <Button 
                                    size="sm" 
                                    onClick={(e) => { e.stopPropagation(); requestJoin.mutate(g.id); }}
                                    className="bg-white text-black hover:bg-white/90 rounded-xl px-4 h-9 font-bold"
                                >
                                    Join Hub
                                </Button>
                            )}
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">{g.name}</h3>
                        <p className="text-sm text-white/40 line-clamp-2 leading-relaxed mb-6">{g.description || 'Secure encrypted transmission hub.'}</p>
                        
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                            <Users size={12} />
                            <span>{g.memberCount || 1} SYNCED PEERS</span>
                            <span>•</span>
                            <span className={g.isPrivate ? 'text-orange-400/40' : 'text-emerald-400/40'}>
                                {g.isPrivate ? 'ENCRYPTED' : 'OPEN LINK'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            {(viewMode === 'my-groups' ? myGroups : discoverGroups)?.length === 0 && (
                <div className="py-40 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-dashed border-white/10">
                        <Search size={32} className="text-white/20" />
                    </div>
                    <h3 className="text-2xl font-bold text-white/20 uppercase tracking-[0.2em]">No Neural Hubs Found</h3>
                </div>
            )}
        </motion.div>
    );
};

// --- DIRECT MESSAGES VIEW ---

const DirectMessagesView = ({ selectedUserId }: { selectedUserId: number | null }) => {
    const [message, setMessage] = useState('');
    const utils = trpc.useUtils();
    
    // Check if we already have a conversation with this user
    const conversations = trpc.messaging.getConversations.useQuery();
    const activeConv = conversations.data?.find(c => c.id === selectedUserId);
    
    const messagesQuery = trpc.messaging.getMessages.useQuery(
        selectedUserId!,
        { enabled: !!selectedUserId, refetchInterval: 3000 } // Basic real-time polling
    );
    
    const sendMessage = trpc.messaging.sendMessage.useMutation({
        onSuccess: () => {
            setMessage('');
            utils.messaging.getMessages.invalidate(selectedUserId!);
            utils.messaging.getConversations.invalidate();
        }
    });

    if (!selectedUserId) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-24 h-24 rounded-[2.5rem] bg-card/30 border border-white/5 flex items-center justify-center mb-8">
                    <MessageSquare size={40} className="text-white/20" />
                </div>
                <h2 className="text-3xl font-black mb-4">Select a conversation</h2>
                <p className="text-white/40">Choose a peer from the sidebar to start studying together.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto py-6">
            <header className="flex items-center justify-between mb-8 p-6 rounded-[2.5rem] bg-card/30 border border-white/5 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-purple-500/20">
                        <AvatarFallback>{activeConv?.username?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-bold text-lg">{activeConv?.name || activeConv?.username || 'Syncing...'}</h4>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-white/30">Secure Neural Link Established</span>
                        </div>
                    </div>
                </div>
                <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">View Profile</Button>
            </header>

            <ScrollArea className="flex-1 px-4 mb-6">
                <div className="space-y-6">
                    {messagesQuery.data?.map((msg, idx) => {
                        const isOwn = msg.senderId !== selectedUserId;
                        return (
                            <motion.div 
                                key={msg.id} 
                                initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] p-5 rounded-[2rem] ${
                                    isOwn 
                                        ? 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-500/20' 
                                        : 'bg-card/40 border border-white/5 text-white/80 rounded-tl-none backdrop-blur-xl'
                                }`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${isOwn ? 'text-white/40' : 'text-white/20'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="p-4 rounded-[2.5rem] bg-card/30 border border-white/5 backdrop-blur-3xl group focus-within:border-purple-500/30 transition-all">
                <div className="flex items-center gap-4">
                    <Input 
                        placeholder="Type a neural message..." 
                        className="bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-white/20"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && message.trim() && sendMessage.mutate({ receiverId: selectedUserId, content: message })}
                    />
                    <Button 
                        onClick={() => sendMessage.mutate({ receiverId: selectedUserId, content: message })}
                        disabled={!message.trim() || sendMessage.isPending}
                        className="bg-purple-600 hover:bg-purple-700 rounded-2xl h-12 w-12 p-0 shadow-lg shadow-purple-500/20"
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- CREATE GROUP MODAL ---

const CreateGroupModal = ({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    
    const createGroup = trpc.groups.create.useMutation({
        onSuccess: () => {
            toast.success("Study Group initialized!");
            onCreated();
        },
        onError: (err) => {
            toast.error(err.message || "Failed to initialize collective. Check encryption links.");
        }
    });

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-xl bg-[#0D0D14] border border-white/10 p-10 rounded-[3rem] shadow-2xl shadow-purple-500/10"
            >
                <h2 className="text-4xl font-black italic tracking-tighter mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    INITIALIZE GROUP
                </h2>
                
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Group Designation</p>
                        <Input 
                            placeholder="e.g. Quantum Physics Deep Dive" 
                            className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 focus:ring-purple-500/50"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Mission Statement</p>
                        <textarea 
                            placeholder="What are the core goals of this collective?"
                            className="w-full h-32 bg-white/5 border border-white/5 rounded-3xl p-6 text-sm focus:outline-none focus:border-purple-500/30 transition-all resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                        <div>
                            <p className="font-bold">Public Discovery</p>
                            <p className="text-xs text-white/30">Allow others to find and request to join.</p>
                        </div>
                        <button 
                            onClick={() => setIsPublic(!isPublic)}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${isPublic ? 'bg-purple-600' : 'bg-white/10'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mt-10">
                    <Button onClick={onClose} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold">Abort</Button>
                    <Button 
                        onClick={() => createGroup.mutate({ name, description, isPublic })}
                        disabled={!name || createGroup.isPending}
                        className="flex-1 h-14 bg-purple-600 hover:bg-purple-700 rounded-2xl font-bold shadow-lg shadow-purple-500/20"
                    >
                        Create Collective
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- GROUP CHAT ---

const GroupChat = ({ groupId }: { groupId: number }) => {
    const [message, setMessage] = useState('');
    const utils = trpc.useUtils();
    
    const chatQuery = trpc.groupContent.getChatMessages.useQuery(
        groupId, 
        { refetchInterval: 3000 }
    );
    
    const sendChatMessage = trpc.groupContent.sendChatMessage.useMutation({
        onSuccess: () => {
            setMessage('');
            utils.groupContent.getChatMessages.invalidate(groupId);
        }
    });

    return (
        <div className="h-[600px] flex flex-col bg-card/10 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl">
            <ScrollArea className="flex-1 p-8">
                <div className="space-y-6">
                    {chatQuery.data?.map((msg) => (
                        <div key={msg.id} className="flex gap-4 group">
                            <Avatar className="w-10 h-10 border border-white/10">
                                <AvatarFallback>{msg.authorUsername?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-white/80 group-hover:text-purple-400 transition-colors">{msg.authorName || msg.authorUsername}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm text-white/50 leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            
            <div className="p-6 border-t border-white/5">
                <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-2 focus-within:ring-2 focus-within:ring-purple-500/50 transition-all">
                    <Input 
                        placeholder="Neural sync..." 
                        className="bg-transparent border-none focus-visible:ring-0"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && message.trim() && sendChatMessage.mutate({ groupId, content: message })}
                    />
                    <Button 
                        onClick={() => sendChatMessage.mutate({ groupId, content: message })}
                        disabled={!message.trim() || sendChatMessage.isPending}
                        className="bg-purple-600 rounded-xl p-2 h-10 w-10"
                    >
                        <Send size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- GROUP ENVIRONMENT ---

const GroupEnvironment = ({ groupId }: { groupId: number }) => {
    const [, setLocation] = useLocation();
    const utils = trpc.useUtils();
    const { data: thisGroup } = trpc.groups.getGroup.useQuery(groupId); 
    
    const groupData = trpc.groupContent.getFeed.useQuery(groupId, { enabled: thisGroup?.status === 'approved' });
    const groupTasks = trpc.groupContent.getTasks.useQuery(groupId, { enabled: thisGroup?.status === 'approved' });
    const leaderboardQuery = trpc.leaderboards.getGroupMembers.useQuery(groupId, { enabled: thisGroup?.status === 'approved' });
    const pendingRequests = trpc.groups.getJoinRequests.useQuery(groupId, { enabled: thisGroup?.role === 'admin' });
    
    const [subTab, setSubTab] = useState<'feed' | 'tasks' | 'chat' | 'sessions' | 'leaderboard'>('feed');

    const handleJoinRequest = trpc.groups.handleJoinRequest.useMutation({
        onSuccess: () => {
            toast.success("Neural sync permission updated.");
            utils.groups.getJoinRequests.invalidate(groupId);
            utils.leaderboards.getGroupMembers.invalidate(groupId);
        }
    });

    const requestJoin = trpc.groups.requestJoin.useMutation({
        onSuccess: () => {
            toast.success("Sync request transmitted.");
            utils.groups.getGroup.invalidate(groupId);
        }
    });

    const joinViaInvite = trpc.groups.joinViaInvite.useMutation({
        onSuccess: (data) => {
            if (data.alreadyMember) return;
            toast.success("Neural link established via uplink invitation.");
            utils.groups.getGroup.invalidate(groupId);
            utils.groups.listMyGroups.invalidate();
        }
    });

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('invite') === 'true' && thisGroup && thisGroup.status !== 'approved') {
            joinViaInvite.mutate({ groupId });
        }
    }, [thisGroup?.id, thisGroup?.status]);

    // Restricted View for non-members
    if (thisGroup && thisGroup.status !== 'approved') {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 max-w-4xl mx-auto">
                <div className="p-12 rounded-[3.5rem] bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 backdrop-blur-3xl text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
                    <div className="relative z-10">
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl font-black italic mx-auto mb-8 shadow-2xl shadow-purple-500/20">
                            {thisGroup.name[0]}
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter mb-4">{thisGroup.name}</h1>
                        <p className="text-xl text-white/40 mb-12 max-w-xl mx-auto leading-relaxed">{thisGroup.description || 'This collective is currently encrypted. Request a neural link to participate.'}</p>
                        
                        <div className="flex flex-col items-center gap-6">
                            {thisGroup.status === 'pending' ? (
                                <div className="p-6 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center gap-3">
                                    <Clock size={20} /> SYNC REQUEST PENDING OVERSEER APPROVAL
                                </div>
                            ) : (
                                <Button 
                                    onClick={() => requestJoin.mutate(groupId)}
                                    disabled={requestJoin.isPending || joinViaInvite.isPending}
                                    className="bg-white text-black hover:bg-white/90 rounded-[2rem] h-20 px-12 font-black text-xl shadow-2xl shadow-white/10 group overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        INITIATE NEURAL SYNC <ChevronRight size={24} />
                                    </span>
                                </Button>
                            )}
                            
                            <div className="flex items-center gap-12 text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">
                                <div className="flex items-center gap-2">
                                    <Users size={14} /> {thisGroup.memberCount} PEERS
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield size={14} /> {thisGroup.isPrivate ? 'ENCRYPTED' : 'PUBLIC'}
                                </div>
                                {leaderboardQuery.data && leaderboardQuery.data.length > 0 && (
                                    <div className="flex items-center -space-x-2">
                                        {leaderboardQuery.data.slice(0, 3).map((m: any) => (
                                            <div key={m.id} className="w-6 h-6 rounded-full border-2 border-black overflow-hidden bg-white/10">
                                                {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px]">{m.name[0]}</div>}
                                            </div>
                                        ))}
                                        <span className="ml-4">Top Overseers</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="py-12">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] border border-purple-500/20">Active Group</span>
                    <span className="text-white/20">•</span>
                    <span className="text-white/40 text-sm font-medium">{thisGroup?.memberCount || 1} Members Syncing</span>
                </div>
                <h1 className="text-6xl font-black tracking-tighter mb-4">{thisGroup?.name || 'Loading Neural Hub...'}</h1>
                <p className="text-xl text-white/40 max-w-3xl leading-relaxed">{thisGroup?.description}</p>
                
                <div className="flex gap-2 mt-8 overflow-x-auto pb-2">
                    {['feed', 'tasks', 'chat', 'sessions', 'leaderboard'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setSubTab(tab as any)}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                                subTab === tab ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
                <main>
                    {subTab === 'feed' && (
                        <div className="space-y-8">
                            <PostCreator groupId={groupId} />
                            {groupData.data?.length === 0 ? (
                                <div className="py-20 text-center text-white/20 font-bold uppercase tracking-widest bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5">
                                    Primary Feed Empty. Initialize a transmission.
                                </div>
                            ) : (
                                groupData.data?.map(post => <PostItem key={post.id} post={post} type="group" />)
                            )}
                        </div>
                    )}
                    {subTab === 'tasks' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center p-8 rounded-[2rem] bg-card/30 border border-white/5">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Group Tasks</h3>
                                    <p className="text-sm text-white/40">Collaborative goals for this week.</p>
                                </div>
                                <Button className="bg-blue-600 rounded-xl">Add Task</Button>
                            </div>
                            <div className="grid gap-4">
                                {groupTasks.data?.map(t => (
                                    <div key={t.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl border-2 border-white/10 flex items-center justify-center transition-colors group-hover:border-blue-500/50`}>
                                                {t.status === 'completed' ? <CheckCircle2 className="text-emerald-400" size={18} /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                                            </div>
                                            <div>
                                                <span className={`font-bold ${t.status === 'completed' ? 'line-through text-white/20' : ''}`}>{t.title}</span>
                                                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1">Assigned: Collective</p>
                                            </div>
                                        </div>
                                        <span className="text-white/20 text-xs font-bold">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'NO DEADLINE'}</span>
                                    </div>
                                ))}
                                {groupTasks.data?.length === 0 && (
                                    <div className="py-10 text-center text-white/20 text-sm font-bold uppercase tracking-widest">No active objectives.</div>
                                )}
                            </div>
                        </div>
                    )}
                    {subTab === 'chat' && (
                        <GroupChat groupId={groupId} />
                    )}
                    {subTab === 'sessions' && (
                        <div className="p-20 text-center bg-card/30 rounded-[3rem] border border-dashed border-white/10">
                            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/20">
                                <Clock size={32} className="text-purple-400 animate-pulse" />
                            </div>
                            <h3 className="text-3xl font-black italic tracking-tighter mb-4">Neural Study Session</h3>
                            <p className="text-white/40 mb-10 max-w-sm mx-auto">Sync your biometrics with the collective. All time spent studying together adds to group XP.</p>
                            <Button 
                                onClick={() => {
                                    // Trigger global study session
                                    toast.success("Synchronizing session across all group members...");
                                    setLocation('/study-session/group-' + groupId);
                                }}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-2xl h-16 px-12 font-black shadow-xl shadow-purple-500/30"
                            >
                                Start Collective Session
                            </Button>
                        </div>
                    )}
                    {subTab === 'leaderboard' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-end p-8 rounded-[2rem] bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 shadow-2xl shadow-purple-500/10 mb-8">
                                <div>
                                    <h3 className="text-3xl font-black mb-2 flex items-center gap-3">
                                       <Award className="w-8 h-8 text-yellow-400" /> 
                                       In-Group Rankings
                                    </h3>
                                    <p className="text-white/60 font-medium">Rankings refresh in real-time. Lead your squad.</p>
                                </div>
                            </div>
                            
                            {leaderboardQuery.isLoading ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-4 bg-card/20 p-8 rounded-[2.5rem] border border-white/5">
                                    {leaderboardQuery.data?.map((member, idx) => (
                                        <div key={member.id} className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-8 text-center font-black text-2xl text-white/40">
                                                #{idx + 1}
                                            </div>
                                            
                                            <Avatar className="w-12 h-12 border-2 border-white/10 shadow-lg">
                                                <AvatarImage src={member.avatar || undefined} />
                                                <AvatarFallback>{member.name?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <div className="font-bold text-lg flex items-center gap-2">
                                                    {member.name}
                                                    {member.role === 'admin' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[9px] font-black uppercase">Admin</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-white/40">@{member.username} • Level {member.level}</div>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-black text-2xl text-purple-400 flex items-center gap-2">
                                                    {member.xp?.toLocaleString()} <Zap className="w-5 h-5 text-purple-500" />
                                                </div>
                                                <div className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Total XP</div>
                                            </div>
                                        </div>
                                    ))}
                                    {leaderboardQuery.data?.length === 0 && (
                                        <div className="text-center py-10 text-white/40 font-bold uppercase tracking-widest">No members found.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <aside className="space-y-8">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 relative overflow-hidden group">
                        <UserPlus className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" size={120} />
                        <h4 className="text-lg font-black italic mb-4">Invite Peers</h4>
                        <p className="text-sm text-white/60 mb-6">Level up together. Share this group link with your study mates.</p>
                        <Button 
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Invite link copied to clipboard!");
                            }}
                            className="w-full bg-white text-black rounded-2xl font-bold hover:bg-white/90"
                        >
                            Copy Invite Link
                        </Button>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6">Group Admins</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-[10px]">A</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-bold">Admin Prime</span>
                            </div>
                        </div>
                    </div>

                    {thisGroup?.role === 'admin' && (
                        <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6">Pending Requests</h4>
                            <div className="space-y-4">
                                {pendingRequests.data?.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={req.avatar || undefined} />
                                                <AvatarFallback>{req.username?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold truncate">{req.name}</p>
                                                <p className="text-[9px] text-white/30 tracking-tight">@{req.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleJoinRequest.mutate({ groupId, userId: req.id, action: 'approve' })}
                                                className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleJoinRequest.mutate({ groupId, userId: req.id, action: 'reject' })}
                                                className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                                            >
                                                <Plus className="rotate-45" size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {pendingRequests.data?.length === 0 && (
                                    <p className="text-xs text-white/20 text-center py-4">No pending neural sync requests.</p>
                                )}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </motion.div>
    );
};

// --- POST HELPERS ---

 const PostItem = ({ post, type = 'community' }: { post: any, type?: 'community' | 'group' }) => {
    const [isLiked, setIsLiked] = useState(false); 
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const utils = trpc.useUtils();
    
    // ── MUTATIONS ──
    const likeGroup = trpc.groupContent.likePost.useMutation({
        onSuccess: () => { utils.groupContent.getFeed.invalidate(); }
    });
    
    const likeCommunity = trpc.community.likePost.useMutation({
        onSuccess: () => { utils.community.getPosts.invalidate(); }
    });

    const addCommentGroup = trpc.groupContent.addComment.useMutation({
        onSuccess: () => {
            setCommentText('');
            utils.groupContent.getComments.invalidate(post.id);
            toast.success("Intelligence shared with group.");
        }
    });

    const addCommentCommunity = trpc.community.addComment.useMutation({
        onSuccess: () => {
            setCommentText('');
            utils.community.getComments.invalidate(post.id);
            toast.success("Transmission broadcasted globally.");
        }
    });

    // ── QUERIES ──
    const comments = type === 'community' 
        ? trpc.community.getComments.useQuery(post.id, { enabled: showComments })
        : trpc.groupContent.getComments.useQuery(post.id, { enabled: showComments });

    const handleLike = () => {
        setIsLiked(!isLiked);
        if (type === 'community') likeCommunity.mutate({ postId: post.id });
        else likeGroup.mutate({ postId: post.id });
    };

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        if (type === 'community') addCommentCommunity.mutate({ postId: post.id, content: commentText });
        else addCommentGroup.mutate({ postId: post.id, content: commentText });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-10 rounded-[3rem] bg-card/30 border border-white/5 backdrop-blur-3xl hover:border-purple-500/20 transition-all group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[60px] pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8">
                <Avatar className="w-14 h-14 border-2 border-white/5 ring-4 ring-purple-500/5">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-lg font-black">{post.authorName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-black text-xl tracking-tight text-white/90">{post.authorName || 'Student Alpha'}</h4>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock size={10} /> {new Date(post.createdAt || new Date()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <h3 className="text-3xl font-black tracking-tighter mb-4 group-hover:text-purple-400 transition-colors leading-tight">{post.title}</h3>
            <p className="text-white/60 leading-relaxed text-lg mb-8 font-medium">{post.content}</p>
            
            <div className="flex gap-6 pt-8 border-t border-white/5 items-center">
                <button 
                    onClick={handleLike}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-sm ${
                        isLiked ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-red-400'
                    }`}
                >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} /> 
                    <span>{post.likes || 0}</span>
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-blue-400 transition-all font-black text-sm"
                >
                    <MessageCircle size={20} /> 
                    <span>{post.commentsCount || 0}</span>
                </button>

                <div className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/10">
                    <Hash size={12} /> SECURE TRANSMISSION
                </div>
            </div>

            <AnimatePresence>
                {showComments && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-8 space-y-4 pt-8 border-t border-white/5">
                            <div className="flex gap-4">
                                <Input 
                                    placeholder="Add a neural comment..." 
                                    className="h-12 bg-white/5 border-white/5 rounded-2xl px-6 focus:ring-purple-500/50"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <Button 
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim() || addCommentGroup.isPending || addCommentCommunity.isPending}
                                    className="h-12 w-12 rounded-2xl bg-purple-600 p-0"
                                >
                                    <Send size={18} />
                                </Button>
                            </div>

                            <div className="space-y-4 mt-6">
                                {comments.data?.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="text-[10px]">{comment.authorName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black text-white/80">{comment.authorName}</span>
                                                <span className="text-[9px] text-white/20 uppercase font-black">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-white/60 font-medium">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const PostCreator = ({ groupId }: { groupId?: number }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const utils = trpc.useUtils();
    
    const createPost = trpc.groupContent.createPost.useMutation({
        onSuccess: () => {
            setTitle('');
            setContent('');
            utils.groupContent.getFeed.invalidate(groupId);
            toast.success("Intelligence transmission broadcasting.");
        }
    });

    return (
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl shadow-purple-500/5 group focus-within:border-purple-500/40 transition-all">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Broadcasting to Collective</span>
            </div>
            <Input 
                placeholder="Post Designation (Title)" 
                className="bg-transparent border-none text-2xl font-black p-0 mb-6 focus-visible:ring-0 placeholder:text-white/10 h-auto"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea 
                placeholder="Synchronize your study insights or results with the group..."
                className="w-full bg-transparent border-none resize-none min-h-[120px] text-lg text-white/60 focus:outline-none placeholder:text-white/10 font-medium leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between items-center pt-8 mt-4 border-t border-white/5">
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="rounded-xl text-white/20 hover:text-purple-400 hover:bg-purple-400/10">
                        <Plus size={18} className="mr-2" /> Add Intel
                    </Button>
                </div>
                <Button 
                    onClick={() => createPost.mutate({ groupId: groupId!, title, content })}
                    disabled={!title || !content || createPost.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 px-10 font-black shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-3"
                >
                    INITIATE BROADCAST <Send size={20} />
                </Button>
            </div>
        </div>
    );
};
