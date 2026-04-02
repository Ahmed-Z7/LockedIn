import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { refresh } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
  const [resetVerificationStep, setResetVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  // Handle token from Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      // Set cookie manually for the Vercel domain
      const expires = new Date(Date.now() + ONE_YEAR_MS).toUTCString();
      document.cookie = `${COOKIE_NAME}=${token}; path=/; expires=${expires}; SameSite=Lax; Secure`;
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast.success("Successfully logged in with Google!");
      refresh().then(() => {
        setLocation("/dashboard");
      });
    }
  }, [refresh, setLocation]);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Successfully logged in!");
      await refresh();
      setLocation("/dashboard");
    },
    onError: (error) => toast.error(error.message || "Failed to log in")
  });

  const sendCodeMutation = trpc.auth.sendVerificationCode.useMutation({
    onSuccess: () => {
      toast.success("Verification PIN sent to your email!");
      setVerificationStep(true);
    },
    onError: (error) => toast.error(error.message || "Failed to send code")
  });

  const registerMutation = trpc.auth.registerWithCode.useMutation({
    onSuccess: async () => {
      toast.success("Account created successfully!");
      await refresh();
      setLocation("/dashboard");
    },
    onError: (error) => toast.error(error.message || "Invalid verification code")
  });

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      toast.success("Password reset code sent to your email!");
      setResetVerificationStep(true);
    },
    onError: (error) => toast.error(error.message || "Failed to request reset")
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully! Please log in.");
      setForgotPasswordStep(false);
      setResetVerificationStep(false);
      setIsLogin(true);
      setVerificationCode("");
      setFormData({ ...formData, password: "", confirmPassword: "" });
    },
    onError: (error) => toast.error(error.message || "Invalid code")
  });

  const handleGoogleAuth = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://lockedin.up.railway.app";
    window.location.href = `${backendUrl}/api/oauth/google`;
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotPasswordStep(true);
    setIsLogin(false);
    setVerificationStep(false);
    setResetVerificationStep(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (forgotPasswordStep) {
      if (!resetVerificationStep) {
        requestResetMutation.mutate({ email: formData.email });
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        resetPasswordMutation.mutate({
          email: formData.email,
          code: verificationCode,
          newPassword: formData.password
        });
      }
      return;
    }

    if (isLogin) {
      loginMutation.mutate({ email: formData.email, password: formData.password });
    } else {
      if (!verificationStep) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        sendCodeMutation.mutate({ 
          email: formData.email, 
          name: formData.name, 
          password: formData.password 
        });
      } else {
        registerMutation.mutate({
          email: formData.email,
          code: verificationCode
        });
      }
    }
  };

  const isPending = loginMutation.isPending || sendCodeMutation.isPending || registerMutation.isPending || requestResetMutation.isPending || resetPasswordMutation.isPending;

  return (
    <div className="min-h-screen bg-[#030014] relative flex items-center justify-center overflow-hidden w-full px-4">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-7000" />

      {/* Floating Octopus Element */}
      <motion.div 
        className="absolute top-10 right-10 lg:top-20 lg:right-40 opacity-30 blur-sm pointer-events-none"
        animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 22s-2-2-4-8c-1-3-2-6-3-6"/>
          <path d="M12 22s2-2 4-8c1-3 2-6 3-6"/>
          <circle cx="9" cy="10" r="1"/>
          <circle cx="15" cy="10" r="1"/>
          <path d="M10 14h4"/>
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative z-10 bg-black/40 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 mx-auto bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30"
            >
              <Lock className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 
              key={forgotPasswordStep ? (resetVerificationStep ? "reset-verify-title" : "forgot-title") : (isLogin ? "login-title" : (verificationStep ? "verify-title" : "register-title"))}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-white tracking-tight"
            >
              {forgotPasswordStep ? (resetVerificationStep ? "Reset Password" : "Forgot Password") : (isLogin ? "Welcome Back" : (verificationStep ? "Verify Email" : "Join LockedIn"))}
            </motion.h1>
            <p className="text-gray-400 mt-2 text-sm text-balance">
              {forgotPasswordStep ? (resetVerificationStep ? "Enter the 6-digit code sent to your email and your new password" : "Enter your email to receive a password reset code") : (isLogin ? "Enter your credentials to access your dashboard" : (verificationStep ? "Enter the 6-digit code sent to your email" : "Create an account to unlock your full potential"))}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {forgotPasswordStep ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-11 bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500/20 transition-all h-12"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={resetVerificationStep}
                      />
                    </div>
                  </div>

                  {resetVerificationStep && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="reset-code" className="text-gray-300">6-Digit Reset Code</Label>
                        <div className="relative">
                          <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                          <Input
                            id="reset-code"
                            placeholder="• • • • • •"
                            className="pl-11 bg-white/5 border-white/10 text-white focus:border-pink-500 focus:ring-pink-500/20 transition-all h-14 text-2xl tracking-[0.5em] text-center font-bold font-mono"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                            maxLength={6}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-gray-300">New Password</Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                          <Input
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-11 pr-11 bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500/20 transition-all h-12"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                          />
                          <button 
                            type="button" 
                            onMouseDown={() => setShowPassword(true)}
                            onMouseUp={() => setShowPassword(false)}
                            onMouseLeave={() => setShowPassword(false)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-password" className="text-gray-300">Confirm New Password</Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                          <Input
                            id="confirm-new-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-11 pr-11 bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500/20 transition-all h-12"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : verificationStep ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="code" className="text-gray-300 text-center block">Enter 6-Digit PIN</Label>
                    <div className="relative flex justify-center">
                      <Input
                        id="code"
                        placeholder="• • • • • •"
                        className="bg-white/5 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400/30 transition-all h-16 w-full max-w-[280px] text-3xl tracking-[0.5em] text-center shadow-inner rounded-xl font-bold font-mono"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                        required
                        maxLength={6}
                      />
                    </div>
                  </div>
                  <div className="text-center pt-2">
                    <button 
                      type="button" 
                      onClick={() => sendCodeMutation.mutate({ email: formData.email, name: formData.name, password: formData.password })}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      disabled={sendCodeMutation.isPending}
                    >
                      Didn't receive a code? Resend
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Nickname</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                        <Input
                          id="name"
                          placeholder="CoolOctopus99"
                          className="pl-11 bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500/20 transition-all h-12"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-11 bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500/20 transition-all h-12"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-gray-300">Password</Label>
                      {isLogin && <button onClick={handleForgotPassword} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</button>}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-11 pr-11 bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500/20 transition-all h-12"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <button 
                        type="button" 
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-11 pr-11 bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500/20 transition-all h-12"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required={!isLogin}
                        />
                        <button 
                          type="button" 
                          onMouseDown={() => setShowConfirmPassword(true)}
                          onMouseUp={() => setShowConfirmPassword(false)}
                          onMouseLeave={() => setShowConfirmPassword(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl shadow-lg shadow-purple-600/25 transition-all mt-6 text-base"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (forgotPasswordStep ? (resetVerificationStep ? "Apply New Password" : "Send Reset Code") : (verificationStep ? "Verify & Join" : (isLogin ? "Sign In" : "Sign Up")))}
            </Button>
          </form>

          {(!verificationStep && !forgotPasswordStep && isLogin) && (
            <>
              <div className="mt-8 flex items-center gap-4 before:flex-1 before:h-px before:bg-white/10 after:flex-1 after:h-px after:bg-white/10">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Or</span>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  className="w-full h-12 bg-white/5 hover:bg-white/10 border-white/10 text-white transition-colors flex items-center justify-center gap-3 rounded-xl"
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
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              {forgotPasswordStep ? "Remembered your password?" : (isLogin ? "Don't have an account?" : "Already have an account?")}
              <button
                type="button"
                onClick={() => {
                  if (forgotPasswordStep) {
                    setForgotPasswordStep(false);
                    setIsLogin(true);
                  } else {
                    setIsLogin(!isLogin);
                  }
                  setVerificationStep(false);
                  setResetVerificationStep(false);
                  setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                  setVerificationCode("");
                }}
                className="ml-2 text-purple-400 font-medium hover:text-purple-300 transition-colors underline-offset-4 hover:underline focus:outline-none"
              >
                {forgotPasswordStep ? "Back to sign in" : (isLogin ? "Create one" : "Sign in instead")}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
