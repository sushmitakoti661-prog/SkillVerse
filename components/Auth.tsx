import React, { useState, useEffect } from 'react';
import { ArrowRight, Lock, Mail, User as UserIcon, Eye, EyeOff, AlertTriangle, Check, ArrowLeft, Github, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { checkPasswordStrength, validateEmail, validateUsername } from '../utils/validators';

type AuthView = 'login' | 'signup' | 'forgot' | 'verify';

export const Auth: React.FC = () => {
  const { login, signup, resetPassword, loginWithGoogle, loginWithGithub, resendVerificationEmail, user } = useAuth();
  
  // If user is logged in but unverified, force them into verify view
  const [view, setView] = useState<AuthView>('login');
  
  useEffect(() => {
    if (user && !user.emailVerified && user.providerData[0]?.providerId === "password") {
       setView('verify');
    }
  }, [user]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear fields on view switch
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
    if (view === 'login') setUsername('');
  }, [view]);

  const pwdStrength = checkPasswordStrength(password);
  
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(true);
    try {
      if (provider === 'google') await loginWithGoogle();
      if (provider === 'github') await loginWithGithub();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Strict Validations Before Submission
    if (view === 'signup') {
      const uValid = validateUsername(username);
      if (!uValid.valid) return setError(uValid.error || "Invalid username");
    }

    const eValid = validateEmail(email);
    if (!eValid.valid) return setError(eValid.error || "Invalid email");

    if (view === 'signup' || view === 'forgot') {
      if (pwdStrength.score < 2 || !pwdStrength.checks.length) { // Require at least fair and 12 chars
        return setError("Please create a stronger password (minimum 12 characters).");
      }
      if (view === 'forgot' && password !== confirmPassword) {
        return setError("Passwords do not match.");
      }
    }

    setLoading(true);
    try {
      if (view === 'signup') {
        await signup(email, password, username);
        setView('verify');
      } else if (view === 'login') {
        await login(email, password);
        // Protected route will catch verified users and redirect to dashboard, 
        // unverified will get pushed to verify state via the useEffect above.
      } else if (view === 'forgot') {
        await resetPassword(email);
        setSuccessMsg("Password reset email sent! Check your inbox.");
        setTimeout(() => setView('login'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerify = async () => {
    setLoading(true);
    try {
      await resendVerificationEmail();
      setSuccessMsg("Verification email sent! Please check your inbox.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const shakeAnimation = {
    shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
  };

  if (view === 'verify') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12 relative z-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-glass border border-white/20 p-8 rounded-3xl shadow-2xl text-center">
           <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="text-primaryLight w-10 h-10" />
           </div>
           <h2 className="text-3xl font-display font-bold text-white mb-2">Verify your email</h2>
           <p className="text-textMuted mb-8">
             We've sent a verification link to <span className="font-bold text-white">{user?.email || email}</span>. 
             Please verify your email to access the platform.
           </p>
           {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
           {successMsg && <div className="mb-4 text-green-500 text-sm">{successMsg}</div>}
           <button 
             onClick={handleResendVerify}
             disabled={loading}
             className="w-full bg-gradient-main text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/40 transition-all flex justify-center items-center gap-2 mb-4 disabled:opacity-50"
           >
             {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Resend Verification Email"}
           </button>
           <button onClick={() => window.location.reload()} className="text-textMuted text-sm hover:text-white transition-colors">
             I have verified my email
           </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12 relative z-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <motion.h1 
            key={`h1-${view}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-display font-bold mb-4 bg-gradient-main bg-clip-text text-transparent"
          >
            {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Start Your Journey' : 'Reset Password'}
          </motion.h1>
          <motion.p 
            key={`p-${view}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-textMuted"
          >
            {view === 'login' 
              ? 'Continue building your professional portfolio.' 
              : view === 'signup'
              ? 'Join thousands of developers mastering their craft.'
              : 'Create a new password to access your account.'}
          </motion.p>
        </div>

        <motion.div 
           layout
           className="bg-glass border border-white/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden group backdrop-blur-md"
        >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto', ...shakeAnimation.shake }}
                       exit={{ opacity: 0, height: 0 }}
                       className="mb-6 overflow-hidden"
                    >
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                           <AlertTriangle size={16} className="shrink-0" /> {error}
                        </div>
                    </motion.div>
                )}
                {successMsg && (
                    <motion.div 
                       initial={{ opacity: 0, height: 0, scale: 0.95 }}
                       animate={{ opacity: 1, height: 'auto', scale: 1 }}
                       exit={{ opacity: 0, height: 0 }}
                       className="mb-6 overflow-hidden"
                    >
                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm flex items-center gap-2">
                           <Check size={16} className="shrink-0" /> {successMsg}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
              <AnimatePresence mode="popLayout">
                {view === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="px-1 py-1 space-y-2"
                  >
                    <label className="text-xs font-semibold uppercase tracking-wider text-textMuted pl-1">Username</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                      <input 
                        type="text" 
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-textMain placeholder-textMuted focus:outline-none focus:border-primaryLight focus:ring-1 focus:ring-primaryLight transition-all"
                        placeholder="Choose a username"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2 px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-textMuted pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-textMain placeholder-textMuted focus:outline-none focus:border-primaryLight focus:ring-1 focus:ring-primaryLight transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2 px-1">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textMuted pl-1">
                        {view === 'forgot' ? 'New Password' : 'Password'}
                    </label>
                    {view === 'login' && (
                        <button 
                            type="button"
                            onClick={() => setView('forgot')}
                            className="text-xs text-primaryLight hover:underline focus:outline-none"
                        >
                            Forgot Password?
                        </button>
                    )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-textMain placeholder-textMuted focus:outline-none focus:border-primaryLight focus:ring-1 focus:ring-primaryLight transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Live Password Checklist */}
                <AnimatePresence>
                  {(view === 'signup' || view === 'forgot') && password.length > 0 && (
                    <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="overflow-hidden mt-3"
                    >
                       <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                          <div className="flex justify-between items-center mb-3">
                             <div className="text-xs text-textMuted font-bold">Password Strength</div>
                             <div className={`text-xs font-bold ${pwdStrength.label === 'Weak' ? 'text-red-500' : pwdStrength.label === 'Fair' ? 'text-orange-500' : pwdStrength.label === 'Good' ? 'text-yellow-400' : 'text-green-500'}`}>
                                {pwdStrength.label}
                             </div>
                          </div>
                          
                          <div className="w-full h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden flex gap-1">
                             <div className={`h-full ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-transparent'} flex-1 transition-colors duration-300`} />
                             <div className={`h-full ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-transparent'} flex-1 transition-colors duration-300`} />
                             <div className={`h-full ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-transparent'} flex-1 transition-colors duration-300`} />
                             <div className={`h-full ${pwdStrength.score >= 4 ? pwdStrength.color : 'bg-transparent'} flex-1 transition-colors duration-300`} />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                             <CheckItem met={pwdStrength.checks.length} label="12+ characters" />
                             <CheckItem met={pwdStrength.checks.upper} label="Uppercase" />
                             <CheckItem met={pwdStrength.checks.lower} label="Lowercase" />
                             <CheckItem met={pwdStrength.checks.number} label="Number" />
                             <CheckItem met={pwdStrength.checks.special} label="Special char" />
                             <CheckItem met={pwdStrength.checks.notCommon} label="Not common" />
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {view === 'forgot' && (
                  <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="space-y-2 px-1 overflow-hidden"
                  >
                    <label className="text-xs font-semibold uppercase tracking-wider text-textMuted pl-1">Confirm New Password</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                      <input 
                        type="password"
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-textMain placeholder-textMuted focus:outline-none focus:border-primaryLight focus:ring-1 focus:ring-primaryLight transition-all"
                        placeholder="••••••••"
                      />
                      {confirmPassword.length > 0 && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              {confirmPassword === password ? <Check size={18} className="text-green-500" /> : <AlertTriangle size={18} className="text-red-500" />}
                          </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading || ((view === 'signup' || view === 'forgot') && pwdStrength.score < 2)}
                className="mt-4 w-full bg-gradient-main text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'} <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </form>

            {view !== 'forgot' && (
                <>
                   <div className="flex items-center gap-4 my-6">
                      <div className="h-px bg-white/10 flex-1" />
                      <div className="text-xs text-textMuted uppercase">Or continue with</div>
                      <div className="h-px bg-white/10 flex-1" />
                   </div>
                   
                   <div className="flex gap-4">
                      <button 
                        onClick={() => handleSocialLogin('google')}
                        disabled={loading}
                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 transition-colors focus:outline-none"
                      >
                         <Chrome size={18} /> Google
                      </button>
                      <button 
                        onClick={() => handleSocialLogin('github')}
                        disabled={loading}
                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 transition-colors focus:outline-none"
                      >
                         <Github size={18} /> GitHub
                      </button>
                   </div>
                </>
            )}

            <div className="mt-8 text-center">
                {view === 'forgot' ? (
                     <button 
                       onClick={() => setView('login')}
                       className="text-textMuted hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors focus:outline-none"
                     >
                       <ArrowLeft size={14} /> Back to Login
                     </button>
                ) : (
                  <p className="text-textMuted text-sm">
                    {view === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button 
                      onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                      className="text-primaryLight hover:text-white font-medium transition-colors ml-1 focus:outline-none"
                    >
                      {view === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                  </p>
                )}
            </div>
        </motion.div>
      </div>
    </div>
  );
};

const CheckItem: React.FC<{ met: boolean, label: string }> = ({ met, label }) => (
    <div className={`flex items-center gap-1.5 transition-colors duration-300 ${met ? 'text-green-400' : 'text-textMuted'}`}>
       <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300 ${met ? 'bg-green-400/20' : 'bg-white/5'}`}>
          {met ? <Check size={10} className="text-green-400" /> : <div className="w-1 h-1 rounded-full bg-white/20" />}
       </div>
       {label}
    </div>
);