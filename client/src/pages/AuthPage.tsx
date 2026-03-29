import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { refresh } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Successfully logged in!");
      await refresh();
      setLocation("/dashboard");
    },
    onError: (error) => toast.error(error.message || "Failed to log in")
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      toast.success("Account created successfully!");
      await refresh();
      setLocation("/dashboard");
    },
    onError: (error) => toast.error(error.message || "Failed to register")
  });

  const handleGoogleAuth = () => {
    // Redirect to backend OAuth route
    window.location.href = "/api/oauth/google";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ email: formData.email, password: formData.password });
    } else {
      registerMutation.mutate(formData);
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden w-full px-4">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 gradient-animate opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass neon-border rounded-2xl p-8 shadow-2xl backdrop-blur-xl bg-card/40">
          <div className="text-center mb-8">
            <motion.h1 
              key={isLogin ? "login-title" : "register-title"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary"
            >
              {isLogin ? "Welcome Back" : "Join LockedIn"}
            </motion.h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {isLogin ? "Enter your credentials to access your dashboard" : "Create an account to unlock your full potential"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-10 bg-background/50 border-input/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-background/50 border-input/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
                {isLogin && <a href="#" className="text-xs text-primary hover:text-accent transition-colors">Forgot password?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-background/50 border-input/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium rounded-lg shadow-lg shadow-primary/25 transition-all mt-6"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Sign Up")}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-4 before:flex-1 before:h-px before:bg-border after:flex-1 after:h-px after:bg-border">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Or</span>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleAuth}
              className="w-full h-11 bg-background/40 hover:bg-background/80 border-border/50 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M23.52 12.27c0-.85-.08-1.67-.22-2.47H12v4.67h6.46a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.58-5.17 3.58-8.85Z" fill="#4285F4"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A11.99 11.99 0 0 0 12 24Z" fill="#34A853"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M5.27 14.26a7.22 7.22 0 0 1-.37-2.26c0-.79.14-1.55.37-2.26V6.64H1.29a11.99 11.99 0 0 0 0 10.72l3.98-3.1Z" fill="#FBBC05"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M12 4.78c1.76 0 3.34.6 4.58 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.39 0 3.39 2.65 1.29 6.64l3.98 3.1c.95-2.85 3.6-4.96 6.73-4.96Z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-medium hover:text-accent transition-colors underline-offset-4 hover:underline focus:outline-none"
              >
                {isLogin ? "Create one" : "Sign in instead"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
