import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Lock, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function BlockedWebsitesPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [domain, setDomain] = useState("");
  const [reason, setReason] = useState("");

  const { data: websites, isLoading } = trpc.blockedWebsites.list.useQuery(undefined, { enabled: isAuthenticated });
  const addMutation = trpc.blockedWebsites.add.useMutation({
    onSuccess: () => {
      setDomain("");
      setReason("");
      setShowAddWebsite(false);
    },
  });
  const removeMutation = trpc.blockedWebsites.remove.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Focus Mode - Block Websites</h1>
          <p className="text-foreground/60 mb-8">Please log in to manage blocked websites</p>
          <Button onClick={() => setLocation("/")} className="bg-indigo-600 hover:bg-indigo-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleAddWebsite = async () => {
    if (!domain.trim()) return;
    await addMutation.mutateAsync({ domain, reason: reason || undefined });
  };

  const handleRemoveWebsite = async (websiteId: number) => {
    await removeMutation.mutateAsync({ websiteId });
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-indigo-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Focus Mode
              </h1>
            </div>
            <Button
              onClick={() => setShowAddWebsite(!showAddWebsite)}
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-foreground"
            >
              <Plus className="w-5 h-5 mr-2" />
              Block Website
            </Button>
          </div>
          <p className="text-foreground/60">Block distracting websites during your study sessions</p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 border border-indigo-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm"
        >
          <h2 className="text-xl font-bold mb-2">🎯 Stay Focused</h2>
          <p className="text-foreground/80">
            Block social media and other distracting websites while studying. You can unblock them anytime when you're done!
          </p>
        </motion.div>

        {/* Add Website Form */}
        {showAddWebsite && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-indigo-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm"
          >
            <h2 className="text-2xl font-bold mb-4">Block a Website</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Website Domain</label>
                <input
                  type="text"
                  placeholder="e.g., facebook.com, twitter.com, instagram.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-indigo-500/60 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="Why are you blocking this? e.g., Too distracting"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-indigo-500/60 transition-all duration-300"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddWebsite}
                  disabled={addMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-foreground"
                >
                  {addMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Block Website"}
                </Button>
                <Button
                  onClick={() => setShowAddWebsite(false)}
                  className="bg-background border border-foreground/20 hover:border-foreground/40 text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Blocked Websites List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold mb-4">Blocked Websites ({websites?.length || 0})</h2>

          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : websites && websites.length > 0 ? (
            websites.map((website, idx) => (
              <motion.div
                key={website.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 rounded-2xl border border-indigo-500/20 bg-background hover:border-indigo-500/40 transition-all duration-300 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{website.domain}</h3>
                  {website.reason && (
                    <p className="text-foreground/60 text-sm">{website.reason}</p>
                  )}
                  <p className="text-foreground/40 text-xs mt-2">
                    Blocked on {new Date(website.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleRemoveWebsite(website.id)}
                  disabled={removeMutation.isPending}
                  className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30"
                >
                  {removeMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </Button>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-background border border-indigo-500/20 rounded-2xl">
              <Lock className="w-16 h-16 text-indigo-400/30 mx-auto mb-4" />
              <p className="text-foreground/60">No blocked websites yet. Add one to stay focused!</p>
            </div>
          )}
        </motion.div>

        {/* Popular Websites to Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-background border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold mb-4">Popular Websites to Block</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "facebook.com",
              "twitter.com",
              "instagram.com",
              "tiktok.com",
              "youtube.com",
              "reddit.com",
              "discord.com",
              "twitch.tv",
              "netflix.com",
            ].map((site) => (
              <Button
                key={site}
                onClick={() => {
                  setDomain(site);
                  setShowAddWebsite(true);
                }}
                className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30"
              >
                Block {site}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
