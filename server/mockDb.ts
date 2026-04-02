// In-memory Mock DB for missing localhost DB connection
export const MOCK_CHALLENGES = [
  // Study Time
  { id: 1, title: "First Hour", description: "Log 60 minutes of total study time.", category: "study_time", targetValue: 60, currentProgress: 30, completed: 0, rewardXp: 100, difficulty: "easy" },
  { id: 2, title: "Half Day Grind", description: "Log 3 hours of total study time.", category: "study_time", targetValue: 180, currentProgress: 60, completed: 0, rewardXp: 200, difficulty: "easy" },
  { id: 3, title: "Full Day Scholar", description: "Log 8 hours of total study time.", category: "study_time", targetValue: 480, currentProgress: 480, completed: 1, rewardXp: 400, difficulty: "medium" },
  { id: 4, title: "Marathon Learner", description: "Log 20 hours of total study time.", category: "study_time", targetValue: 1200, currentProgress: 0, completed: 0, rewardXp: 700, difficulty: "medium" },
  { id: 5, title: "Century Club", description: "Log 100 hours of total study time.", category: "study_time", targetValue: 6000, currentProgress: 0, completed: 0, rewardXp: 1500, difficulty: "hard" },
  { id: 6, title: "Neural Titan", description: "Log 500 hours of total study time.", category: "study_time", targetValue: 30000, currentProgress: 0, completed: 0, rewardXp: 5000, difficulty: "hard" },
  
  // Streak
  { id: 11, title: "3-Day Fire", description: "Maintain a 3-day study streak.", category: "streak", targetValue: 3, currentProgress: 2, completed: 0, rewardXp: 150, difficulty: "easy" },
  { id: 12, title: "One Week Warrior", description: "Maintain a 7-day study streak.", category: "streak", targetValue: 7, currentProgress: 2, completed: 0, rewardXp: 300, difficulty: "easy" },
  { id: 13, title: "Two Week Champion", description: "Maintain a 14-day study streak.", category: "streak", targetValue: 14, currentProgress: 0, completed: 0, rewardXp: 600, difficulty: "medium" },
  { id: 14, title: "21-Day Habit", description: "Maintain a 21-day study streak.", category: "streak", targetValue: 21, currentProgress: 0, completed: 0, rewardXp: 900, difficulty: "medium" },
  { id: 15, title: "Month Lock", description: "Maintain a 30-day study streak.", category: "streak", targetValue: 30, currentProgress: 0, completed: 0, rewardXp: 1500, difficulty: "hard" },
  { id: 16, title: "Legendary Streak", description: "Maintain a 60-day study streak.", category: "streak", targetValue: 60, currentProgress: 0, completed: 0, rewardXp: 3000, difficulty: "hard" },

  // Focus
  { id: 21, title: "Focus Initiator", description: "Complete 1 locked focus session.", category: "focus", targetValue: 1, currentProgress: 1, completed: 1, rewardXp: 100, difficulty: "easy" },
  { id: 22, title: "Deep Work Starter", description: "Complete 5 locked focus sessions.", category: "focus", targetValue: 5, currentProgress: 2, completed: 0, rewardXp: 250, difficulty: "easy" },
  { id: 23, title: "Flow State", description: "Complete 15 locked focus sessions.", category: "focus", targetValue: 15, currentProgress: 0, completed: 0, rewardXp: 500, difficulty: "medium" },
  { id: 24, title: "Distraction Slayer", description: "Complete 30 locked focus sessions.", category: "focus", targetValue: 30, currentProgress: 0, completed: 0, rewardXp: 900, difficulty: "medium" },
  { id: 25, title: "Iron Mind", description: "Complete 75 locked focus sessions.", category: "focus", targetValue: 75, currentProgress: 0, completed: 0, rewardXp: 2000, difficulty: "hard" },
  { id: 26, title: "Zero Distractions", description: "Complete 150 locked sessions.", category: "focus", targetValue: 150, currentProgress: 0, completed: 0, rewardXp: 4000, difficulty: "hard" },

  // Consistency
  { id: 31, title: "First Steps", description: "Complete 3 study sessions.", category: "consistency", targetValue: 3, currentProgress: 1, completed: 0, rewardXp: 100, difficulty: "easy" },
  { id: 32, title: "Routine Builder", description: "Complete 10 study sessions.", category: "consistency", targetValue: 10, currentProgress: 1, completed: 0, rewardXp: 250, difficulty: "easy" },
  { id: 33, title: "Committed Learner", description: "Complete 25 study sessions.", category: "consistency", targetValue: 25, currentProgress: 0, completed: 0, rewardXp: 500, difficulty: "medium" },
  { id: 34, title: "Disciplined Scholar", description: "Complete 50 study sessions.", category: "consistency", targetValue: 50, currentProgress: 0, completed: 0, rewardXp: 1000, difficulty: "medium" },
  { id: 35, title: "System Machine", description: "Complete 100 study sessions.", category: "consistency", targetValue: 100, currentProgress: 0, completed: 0, rewardXp: 2000, difficulty: "hard" },
  { id: 36, title: "Consistency God", description: "Complete 250 study sessions.", category: "consistency", targetValue: 250, currentProgress: 0, completed: 0, rewardXp: 5000, difficulty: "hard" },

  // AI Usage
  { id: 41, title: "AI First Timer", description: "Send your first AI coach message.", category: "ai_usage", targetValue: 1, currentProgress: 1, completed: 1, rewardXp: 75, difficulty: "easy" },
  { id: 42, title: "Neural Connector", description: "Send 10 AI coach messages.", category: "ai_usage", targetValue: 10, currentProgress: 5, completed: 0, rewardXp: 200, difficulty: "easy" },
  { id: 43, title: "AI Collaborator", description: "Send 30 AI coach messages.", category: "ai_usage", targetValue: 30, currentProgress: 0, completed: 0, rewardXp: 450, difficulty: "medium" },
  { id: 44, title: "Research Partner", description: "Send 75 AI coach messages.", category: "ai_usage", targetValue: 75, currentProgress: 0, completed: 0, rewardXp: 900, difficulty: "medium" },
  { id: 45, title: "AI Synced", description: "Send 150 AI coach messages.", category: "ai_usage", targetValue: 150, currentProgress: 0, completed: 0, rewardXp: 1800, difficulty: "hard" },
  { id: 46, title: "Neural Architect", description: "Send 500 AI coach messages.", category: "ai_usage", targetValue: 500, currentProgress: 0, completed: 0, rewardXp: 5000, difficulty: "hard" },

  // Group
  { id: 51, title: "First Contact", description: "Make your first post in a study group.", category: "group", targetValue: 1, currentProgress: 1, completed: 1, rewardXp: 100, difficulty: "easy" },
  { id: 52, title: "Community Member", description: "Make 5 group interactions.", category: "group", targetValue: 5, currentProgress: 0, completed: 0, rewardXp: 200, difficulty: "easy" },
  { id: 53, title: "Active Collaborator", description: "Make 15 group interactions.", category: "group", targetValue: 15, currentProgress: 0, completed: 0, rewardXp: 500, difficulty: "medium" },
  { id: 54, title: "Squad Leader", description: "Make 30 group interactions.", category: "group", targetValue: 30, currentProgress: 0, completed: 0, rewardXp: 900, difficulty: "medium" },
  { id: 55, title: "Network Weaver", description: "Make 75 group interactions.", category: "group", targetValue: 75, currentProgress: 0, completed: 0, rewardXp: 2000, difficulty: "hard" },
  { id: 56, title: "Community Pillar", description: "Make 200 group interactions.", category: "group", targetValue: 200, currentProgress: 0, completed: 0, rewardXp: 5000, difficulty: "hard" }
];

export const MOCK_USERS = [
  { id: 101, name: "Mahmoud Emad", username: "mahmoud_emad", avatar: "https://i.pravatar.cc/150?u=mahmoud", xp: 4500, level: 12 },
  { id: 102, name: "Ahmed Zidan", username: "ahmed_zidan", avatar: "https://i.pravatar.cc/150?u=ahmed", xp: 3200, level: 9 },
  { id: 103, name: "Yasmine Yasser", username: "yasmine_yasser", avatar: "https://i.pravatar.cc/150?u=yasmine", xp: 5100, level: 15 },
  { id: 104, name: "Ali Hassan", username: "ali_hassan", avatar: "https://i.pravatar.cc/150?u=ali", xp: 2100, level: 6 },
  { id: 105, name: "Sara Kamel", username: "sara_kamel", avatar: "https://i.pravatar.cc/150?u=sara", xp: 1800, level: 5 },
  { id: 106, name: "Omar Sherif", username: "omar_sherif", avatar: "https://i.pravatar.cc/150?u=omar", xp: 6200, level: 18 },
  { id: 107, name: "Nourhan Adel", username: "nourhan_adel", avatar: "https://i.pravatar.cc/150?u=nourhan", xp: 800, level: 3 },
  { id: 108, name: "Khaled Gamal", username: "khaled_gamal", avatar: "https://i.pravatar.cc/150?u=khaled", xp: 1200, level: 4 },
  { id: 109, name: "Mona Zakaria", username: "mona_zakaria", avatar: "https://i.pravatar.cc/150?u=mona", xp: 3900, level: 11 },
  { id: 110, name: "Tarek Sameh", username: "tarek_sameh", avatar: "https://i.pravatar.cc/150?u=tarek", xp: 2700, level: 8 },
];

export const MOCK_GROUPS = [
  { id: 201, name: "Neural Architects", description: "Deep work and systems thinking collective.", memberCount: 14, totalXp: 12500, avatar: null },
  { id: 202, name: "Global Hackers", description: "Coding the future, 25 hours a day.", memberCount: 8, totalXp: 8400, avatar: null },
  { id: 203, name: "Focus Collective", description: "Eliminate all distractions.", memberCount: 22, totalXp: 15600, avatar: null },
];

// In-memory messages (persists across reloads on local dev server)
export const MOCK_MESSAGES: any[] = [
  { id: 1, senderId: 101, receiverId: 999, content: "Hey! Ready to study?", createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 2, senderId: 999, receiverId: 101, content: "Yes! Joining the focus room now.", createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
];
