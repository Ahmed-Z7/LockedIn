import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Features from "@/components/Features";
import Dashboard from "@/components/Dashboard";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F8FF] via-[#F9FAFF] to-[#F7F8FF] text-[#0F172A] overflow-hidden">
      {/* Animated background elements - Crystal Glassmorphism */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top-Left: Fuchsia-Purple glow */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
          }}
          animate={{ y: [0, 100, 0], x: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        {/* Bottom-Right: Cyan opalescent glow */}
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          }}
          animate={{ y: [0, -100, 0], x: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        {/* Center: Subtle purple accent */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(196, 181, 253, 0.05) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        {/* Subtle neural network pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(196, 181, 253, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(165, 243, 252, 0.03) 0%, transparent 50%)',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <Features />
        <Dashboard />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
