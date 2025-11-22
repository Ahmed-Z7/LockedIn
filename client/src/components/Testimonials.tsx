import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'أحمد محمد',
      role: 'طالب جامعي',
      content: 'LOCKEDIN غيّر طريقة دراستي تماماً. الـ AI Coach ساعدني أفهم الرياضيات بشكل أسهل بكثير!',
      rating: 5,
      avatar: '👨‍🎓',
    },
    {
      name: 'فاطمة علي',
      role: 'طالبة ثانوي',
      content: 'أحب نظام الـ Gamification! الـ Streaks والـ Badges خلتني أركز أكتر في الدراسة.',
      rating: 5,
      avatar: '👩‍🎓',
    },
    {
      name: 'محمود حسن',
      role: 'معد لامتحان TOEFL',
      content: 'Focus Mode ساعدني أتجنب الـ Social Media والـ Smart Scheduler خطط لي بشكل ذكي جداً.',
      rating: 5,
      avatar: '👨‍💼',
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-400 bg-clip-text text-transparent">
              What Students Say
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of students who are already studying smarter with LOCKEDIN
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <div className="relative bg-background border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array(testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-purple-400 text-purple-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
