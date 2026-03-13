import { motion } from 'framer-motion';
import { Trophy, Users, Clock, Zap, Target } from 'lucide-react';
import { useState } from 'react';

export default function ChallengesPage() {
  const [challenges] = useState([
    {
      id: 1,
      title: '7-Day Focus Challenge',
      description: 'Maintain focus for 7 consecutive days without breaking your streak',
      reward: '500 XP + Golden Badge',
      participants: 2341,
      daysLeft: 3,
      progress: 4,
      totalDays: 7,
      difficulty: 'Easy',
    },
    {
      id: 2,
      title: 'Master Learner Challenge',
      description: 'Complete 10 AI-generated quizzes with 90% accuracy or higher',
      reward: '1000 XP + Platinum Badge',
      participants: 1856,
      daysLeft: 5,
      progress: 6,
      totalDays: 10,
      difficulty: 'Hard',
    },
    {
      id: 3,
      title: 'Community Helper Challenge',
      description: 'Help 5 community members solve their study problems',
      reward: '750 XP + Helper Badge',
      participants: 934,
      daysLeft: 7,
      progress: 2,
      totalDays: 5,
      difficulty: 'Medium',
    },
    {
      id: 4,
      title: 'Speed Learner Challenge',
      description: 'Complete 20 hours of focused study in one week',
      reward: '800 XP + Speed Badge',
      participants: 1523,
      daysLeft: 2,
      progress: 18,
      totalDays: 20,
      difficulty: 'Hard',
    },
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Member Challenges
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Compete with the community, earn rewards, and unlock exclusive badges
        </p>
      </motion.div>

      {/* Challenges Grid */}
      <div className="container mb-20">
        <div className="space-y-6">
          {challenges.map((challenge, idx) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-background border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-foreground">{challenge.title}</h3>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getDifficultyColor(challenge.difficulty)} border-current/30`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-400">{challenge.description}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-semibold text-purple-400">{challenge.progress}/{challenge.totalDays}</span>
                </div>
                <div className="h-2 bg-card rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(challenge.progress / challenge.totalDays) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Participants</p>
                    <p className="font-semibold text-foreground">{challenge.participants.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Days Left</p>
                    <p className="font-semibold text-foreground">{challenge.daysLeft}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Reward</p>
                    <p className="font-semibold text-purple-400">{challenge.reward}</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-foreground font-semibold transition-all duration-300 glow-purple flex items-center justify-center gap-2"
              >
                <Target className="w-5 h-5" />
                Join Challenge
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="container bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-8 mb-20"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Your Challenge Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400 mb-2">3</p>
            <p className="text-gray-400">Active Challenges</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400 mb-2">12</p>
            <p className="text-gray-400">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400 mb-2">8</p>
            <p className="text-gray-400">Badges Earned</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400 mb-2">4,250</p>
            <p className="text-gray-400">Total XP</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
