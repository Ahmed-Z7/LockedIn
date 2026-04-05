import React from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { ShieldAlert, Trash2, ShieldCheck, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const [_, setLocation] = useLocation();

    React.useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            setLocation('/dashboard');
            toast.error('Unauthorized access. Admin privileges required.');
        }
    }, [user, loading, setLocation]);

    const utils = trpc.useUtils();
    const posts = trpc.community.getPosts.useQuery(undefined, { enabled: user?.role === 'admin' });
    const deletePost = trpc.community.deletePost.useMutation({
        onSuccess: () => {
            utils.community.getPosts.invalidate();
            toast.success("Post deleted by Admin.");
        }
    });

    if (loading || !user || user.role !== 'admin') {
        return <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">Authenticating Admin Protocol...</div>;
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white pt-20 px-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <ShieldAlert className="text-red-500 w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black italic tracking-tighter text-red-500">ADMIN CONTROL PANEL</h1>
                        <p className="text-foreground/40 font-medium">Global moderation and system overview.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                     <div className="p-8 rounded-[2.5rem] bg-card/30 border border-border/50">
                        <ShieldCheck className="text-emerald-500 w-10 h-10 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">System Status</h3>
                        <p className="text-emerald-500 text-sm font-bold uppercase tracking-widest">All Systems Normal</p>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-card/30 border border-border/50">
                        <Search className="text-blue-500 w-10 h-10 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Total Posts</h3>
                        <p className="text-foreground/60 text-sm">{posts.data?.length || 0} active global transmissions</p>
                    </div>
                </div>

                <div className="p-10 rounded-[3rem] bg-card/30 border border-border/50">
                    <h2 className="text-3xl font-black mb-8 border-b border-border pb-4">Global Incident Feed</h2>
                    
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-6">
                            {posts.data?.map((post: any) => (
                                <div key={post.id} className="p-6 rounded-3xl bg-white/[0.02] border border-border/50 hover:border-red-500/30 transition-colors flex justify-between items-start group">
                                    <div className="flex gap-4 max-w-2xl">
                                        <Avatar className="border border-border mt-1">
                                            <AvatarImage src={post.authorAvatar || undefined} />
                                            <AvatarFallback>{post.authorName?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-bold">{post.authorName}</span>
                                                <span className="text-[10px] text-foreground/30 uppercase tracking-widest">{new Date(post.createdAt).toLocaleString()}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-foreground/80 mb-1">{post.title}</h4>
                                            <p className="text-sm text-foreground/40">{post.content}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="destructive" 
                                        className="rounded-xl font-bold bg-red-600 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                            if (confirm('Are you certain you want to erase this transmission from the database?')) {
                                                deletePost.mutate({ postId: post.id });
                                            }
                                        }}
                                        disabled={deletePost.isPending}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Force OVERRIDE (Delete)
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
