import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Calendar, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function SchedulePage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(60);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const { data: schedules, isLoading } = trpc.schedule.list.useQuery(undefined, { enabled: isAuthenticated });
  const createMutation = trpc.schedule.create.useMutation({
    onSuccess: () => {
      setSubject("");
      setDuration(60);
      setPriority("medium");
      setScheduledDate("");
      setScheduledTime("");
      setShowAddSchedule(false);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Study Schedule</h1>
          <p className="text-foreground/60 mb-8">Please log in to create your study schedule</p>
          <Button onClick={() => setLocation("/")} className="bg-indigo-600 hover:bg-indigo-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateSchedule = async () => {
    if (!subject.trim() || !scheduledDate || !scheduledTime) return;
    const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    await createMutation.mutateAsync({
      subject,
      duration,
      priority,
      scheduledTime: dateTime,
    });
  };

  const priorityColors = {
    low: "bg-green-500/20 border-green-500/30 text-green-400",
    medium: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
    high: "bg-red-500/20 border-red-500/30 text-red-400",
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
              <Calendar className="w-8 h-8 text-indigo-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Study Schedule
              </h1>
            </div>
            <Button
              onClick={() => setShowAddSchedule(!showAddSchedule)}
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-foreground"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Schedule
            </Button>
          </div>
          <p className="text-foreground/60">Plan your study sessions and stay on track</p>
        </motion.div>

        {/* Create Schedule Form */}
        {showAddSchedule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-indigo-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm"
          >
            <h2 className="text-2xl font-bold mb-4">Schedule New Study Session</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-indigo-500/60 transition-all duration-300"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-indigo-500/60 transition-all duration-300"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-indigo-500/60 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-indigo-500/60 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                    className="w-full bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-indigo-500/60 transition-all duration-300"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateSchedule}
                  disabled={createMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-foreground"
                >
                  {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add to Schedule"}
                </Button>
                <Button
                  onClick={() => setShowAddSchedule(false)}
                  className="bg-background border border-foreground/20 hover:border-foreground/40 text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Schedule List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : schedules && schedules.length > 0 ? (
            schedules.map((schedule, idx) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-6 rounded-2xl border ${priorityColors[schedule.priority || "medium"]} backdrop-blur-sm hover:scale-105 transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{schedule.subject}</h3>
                    <p className="text-foreground/70 text-sm mb-2">
                      {new Date(schedule.scheduledTime).toLocaleString()}
                    </p>
                    <p className="text-foreground/60 text-sm">Duration: {schedule.duration} minutes</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${priorityColors[schedule.priority || "medium"]}`}>
                      {schedule.priority?.toUpperCase() || "MEDIUM"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-background border border-indigo-500/20 rounded-2xl">
              <Calendar className="w-16 h-16 text-indigo-400/30 mx-auto mb-4" />
              <p className="text-foreground/60">No schedules yet. Create your first study schedule!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
