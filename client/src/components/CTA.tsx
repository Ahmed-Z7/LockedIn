import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import GlowButton from './GlowButton';

export default function CTA() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{ y: [0, 100, 0], x: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ y: [0, -100, 0], x: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background opacity-50" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 to-violet-950/50 backdrop-blur-xl p-12 md:p-16"
        >
          <motion.div
            className="absolute inset-0 rounded-2xl border border-indigo-500/50 opacity-0"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <div className="relative z-10 text-center">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 mb-6 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">
                Limited Time Offer
              </span>
            </motion.div>

            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Ready to Transform Your Learning?
            </motion.h2>

            <motion.p
              className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join thousands of students who are already studying smarter with
              AuraLearn. Get started free today and unlock your full potential.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button
                onClick={() => isAuthenticated ? setLocation('/dashboard') : window.location.href = getLoginUrl()}
              >
                <GlowButton variant="indigo" size="lg">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </GlowButton>
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocation('/flash-cards')}
                className="px-8 py-4 rounded-lg border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 font-semibold transition-colors"
              >
                Study Flash Cards
              </motion.button>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                Cancel anytime
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
