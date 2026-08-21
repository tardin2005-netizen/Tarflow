import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Mail, Lock, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { auth, googleProvider } from "../../lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function WelcomeTab() {
  const { t } = useTranslation();
  
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error("Login failed", error);
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Auth failed", error);
      if (error.code === 'auth/invalid-credential') {
        setErrorMsg("Email ou senha incorretos.");
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMsg("Este email já está cadastrado.");
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setErrorMsg("Erro na autenticação. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 relative z-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center shrink-0 w-full max-w-sm -mt-8 md:-mt-16"
      >
        {/* Logo */}
        <div className="w-full max-w-[16rem] md:max-w-xs flex justify-center items-center shrink-0 pointer-events-none mb-0">
          <img
            src={`${import.meta.env.BASE_URL}tarflowicon.png`}
            alt="Tarflow"
            className="w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(45,115,255,0.3)] transition-all duration-300 scale-[1.2] md:scale-[1.3] pointer-events-auto hover:drop-shadow-[0_20px_40px_rgba(45,115,255,0.5)]"
          />
        </div>
        
        {/* Title and Subtitle container */}
        <div className="flex flex-col items-center gap-2 z-10 relative -mt-6 md:-mt-10 w-full">
          <h1 className="text-5xl md:text-[4rem] font-sans font-black text-[var(--text-primary)] leading-none mb-2" style={{ fontVariantLigatures: "none", letterSpacing: "0.035em" }}>
            Tarflow
          </h1>
          <p className="text-[var(--text-secondary)] text-base md:text-xl font-medium tracking-wide text-center mb-8">
            {t("Controle suas finanças com")} <span className="text-[#00F5FF]">clareza.</span>
          </p>

          <AnimatePresence mode="wait">
            {!isEmailMode ? (
              <motion.div 
                key="social-login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full space-y-3"
              >
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-sm md:text-base shadow-xl transition-all bg-white text-zinc-900 w-full hover:bg-gray-50 border border-zinc-200"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 shrink-0" />
                  <span>{t("Continuar com Google")}</span>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEmailMode(true)}
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-sm md:text-base shadow-xl transition-all bg-[#2C5F7C]/20 hover:bg-[#2C5F7C]/30 border border-[#2C5F7C]/50 text-[var(--text-primary)] w-full"
                >
                  <Mail size={18} className="shrink-0" />
                  <span>{t("Continuar com Email")}</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.form 
                key="email-login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleEmailAuth}
                className="w-full bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)] shadow-xl relative"
              >
                <button 
                  type="button"
                  onClick={() => setIsEmailMode(false)}
                  className="absolute top-4 left-4 p-2 rounded-full hover:bg-[var(--section-bg)] text-[var(--text-muted)] transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isSignUp ? "signup" : "login"}
                    initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="text-center mb-6 mt-2">
                      <h3 className="font-black text-xl text-[var(--text-primary)]">
                        {isSignUp ? "Criar Conta" : "Fazer Login"}
                      </h3>
                    </div>

                    {errorMsg && (
                      <div className="mb-4 text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
                        {errorMsg}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block mb-1.5 ml-1 text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail size={16} className="text-[#667eea] opacity-80" />
                          </div>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="w-full py-3.5 pl-11 pr-4 bg-[var(--section-bg)] border-2 border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:border-[#667eea] outline-none transition-all font-bold placeholder-[var(--text-muted)]/50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1.5 ml-1 text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">
                          Senha
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={16} className="text-[#667eea] opacity-80" />
                          </div>
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            required
                            minLength={6}
                            className="w-full py-3.5 pl-11 pr-4 bg-[var(--section-bg)] border-2 border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:border-[#667eea] outline-none transition-all font-bold placeholder-[var(--text-muted)]/50"
                          />
                        </div>
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-6 bg-gradient-to-r from-blue-500 to-[#00F5FF] text-white py-3.5 rounded-xl font-black text-sm shadow-xl hover:shadow-2xl disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span className="animate-pulse">Aguarde...</span>
                      ) : (
                        <>
                          <LogIn size={16} />
                          {isSignUp ? "Cadastrar" : "Entrar"}
                        </>
                      )}
                    </motion.button>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-xs font-bold text-[var(--text-muted)] hover:text-[#667eea] transition-colors"
                      >
                        {isSignUp ? "Já tenho uma conta. Fazer login" : "Não tem conta? Cadastre-se"}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
