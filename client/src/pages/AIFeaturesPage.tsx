import { motion } from 'framer-motion';
import { MessageCircle, Lightbulb, Zap, BookOpen, TrendingUp, Sparkles } from 'lucide-react';

export default function AIFeaturesPage() {
  const aiFeatures = [
    {
      icon: MessageCircle,
      title: 'AI Tutor Chat',
      description: 'Chat with our advanced AI tutor that understands your learning style and provides personalized explanations',
      features: ['24/7 Availability', 'Instant Answers', 'Concept Clarification'],
    },
    {
      icon: Lightbulb,
      title: 'Smart Suggestions',
      description: 'Get AI-powered recommendations for study topics, resources, and learning paths',
      features: ['Personalized Paths', 'Resource Recommendations', 'Gap Analysis'],
    },
    {
      icon: Zap,
      title: 'Adaptive Learning',
      description: 'Our AI adapts to your progress and adjusts difficulty levels in real-time',
      features: ['Dynamic Difficulty', 'Progress Tracking', 'Adaptive Content'],
    },
    {
      icon: BookOpen,
      title: 'Content Generation',
      description: 'AI generates custom study materials, quizzes, and practice problems',
      features: ['Custom Quizzes', 'Practice Problems', 'Study Guides'],
    },
    {
      icon: TrendingUp,
      title: 'Performance Analysis',
      description: 'Deep insights into your learning patterns and performance metrics',
      features: ['Learning Analytics', 'Weakness Detection', 'Strength Building'],
    },
    {
      icon: Sparkles,
      title: 'Motivational AI',
      description: 'Personalized encouragement and motivation based on your progress',
      features: ['Custom Motivation', 'Streak Tracking', 'Achievement Rewards'],
    },
  ];

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
            AI Features
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Powered by cutting-edge artificial intelligence to enhance your learning experience
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="container mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative bg-background border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((f, i) => (
                      <li key={i} className="text-xs text-purple-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="container bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-8 mb-20"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">How AI Enhances Your Learning</h2>
        <p className="text-gray-300 mb-4">
          Our AI system uses advanced machine learning algorithms to understand your learning patterns, identify knowledge gaps, and create personalized learning experiences. Every interaction helps the AI better understand your needs and provide more targeted assistance.
        </p>
        <p className="text-gray-300">
          From real-time feedback to adaptive content difficulty, our AI ensures you're always learning at the optimal pace for maximum retention and understanding.
        </p>
      </motion.div>
    </div>
  );
}
