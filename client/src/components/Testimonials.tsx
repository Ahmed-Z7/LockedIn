import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import NeonCard from './NeonCard';

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  glowColor: 'indigo' | 'cyan' | 'violet';
  delay: number;
}

function TestimonialCard({
  name,
  role,
  content,
  rating,
  glowColor,
  delay,
}: TestimonialProps) {
  return (
    <NeonCard glowColor={glowColor} delay={delay}>
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + i * 0.1 }}
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-300 mb-6 italic">"{content}"</p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{name}</p>
          <p className="text-xs text-gray-400">{role}</p>
        </div>
      </div>
    </NeonCard>
  );
}

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Ahmed Hassan',
      role: 'University Student',
      content:
        'AuraLearn completely transformed my study habits. The AI coach is like having a personal tutor available 24/7!',
      rating: 5,
      glowColor: 'indigo' as const,
    },
    {
      name: 'Fatima Al-Mansouri',
      role: 'High School Student',
      content:
        'The gamification system keeps me motivated. I love earning badges and maintaining my focus streaks!',
      rating: 5,
      glowColor: 'cyan' as const,
    },
    {
      name: 'Mohammed Ali',
      role: 'Self-Learner',
      content:
        'The smart scheduler saved me so much time. No more guessing about how to organize my study sessions.',
      rating: 5,
      glowColor: 'violet' as const,
    },
    {
      name: 'Layla Ahmed',
      role: 'College Student',
      content:
        'Focus Mode is a game-changer. The ambient sounds and timer help me stay in the zone for hours.',
      rating: 5,
      glowColor: 'indigo' as const,
    },
    {
      name: 'Omar Ibrahim',
      role: 'Medical Student',
      content:
        'The analytics dashboard shows exactly where I need to improve. Data-driven learning at its best!',
      rating: 5,
      glowColor: 'cyan' as const,
    },
    {
      name: 'Noor Khalil',
      role: 'Engineering Student',
      content:
        'The personalized roadmap feature adapted perfectly to my learning pace. Highly recommended!',
      rating: 5,
      glowColor: 'violet' as const,
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="container relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Loved by Students
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join thousands of students who have transformed their learning journey
            with AuraLearn.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              rating={testimonial.rating}
              glowColor={testimonial.glowColor}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
