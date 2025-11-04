import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import Dashboard from '@/components/Dashboard';
import FocusMode from '@/components/FocusMode';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <Features />
        {isAuthenticated && <Dashboard />}
        <FocusMode />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
