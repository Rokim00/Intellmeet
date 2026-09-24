import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowRight, ArrowUpRight, AudioLines, Eye, EyeOff, 
  LockKeyhole, Mail, ShieldCheck, Video, AlertCircle, Code, Globe
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

type LoginInput = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const response = await api.post("/login", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      const resData = response.data as any;
      const user = resData.user || resData.data?.user || resData.data;
      const accessToken = resData.accessToken || resData.token || resData.data?.accessToken || resData.data?.token;

      if (user && accessToken) {
        login(user, accessToken);
        navigate("/dashboard");
      } else {
        setServerError("Authentication succeeded, but invalid payload received.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        if (errorData?.errors && errorData.errors.length > 0) {
          setServerError(errorData.errors[0].message);
        } else {
          setServerError(errorData?.message || "Invalid credentials provided.");
        }
      } else {
        setServerError("Network error. Please check your connection.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 sm:p-8 font-sans text-zinc-100 selection:bg-emerald-500/30">
      
      {/* Main Split Container */}
      <div className="w-full max-w-[1100px] bg-[#0a0a0a] border border-white/[0.04] rounded-3xl flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* Left Half - Brand Panel */}
        <section className="hidden md:flex md:w-[45%] relative p-10 flex-col justify-between border-r border-white/[0.04] bg-[#050505] overflow-hidden">
          {/* Emerald Mesh Background Simulation */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-0" />
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent blur-3xl z-0" />
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-white font-medium hover:opacity-80 transition-opacity">
              <span className="text-emerald-500"><Video size={20} strokeWidth={1.7} /></span>
              <span>IntellMeet<span className="text-emerald-500">.</span></span>
            </Link>
          </div>

          <div className="relative z-10 mt-16 mb-8 space-y-6">
            <div className="flex items-center gap-2 text-[10px] tracking-widest text-zinc-400 uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> A little closer, from anywhere
            </div>
            <h1 className="text-4xl md:text-5xl leading-[1.1] font-medium text-white tracking-tight">
              Great minds.<br /><span className="text-zinc-400">Closer together.</span>
            </h1>

            <div className="flex items-center gap-2 text-sm text-emerald-400/90 font-medium pt-2">
              <AudioLines size={18} strokeWidth={1.6} />
              <span>Less friction. More connection.</span>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between text-sm text-zinc-300">
              <p>Good things start with a conversation.</p>
              <ArrowUpRight size={18} strokeWidth={1.4} />
            </div>
            <div className="flex justify-between text-[10px] tracking-wider text-zinc-500 font-semibold uppercase">
              <span>Thoughtfully Connected</span>
              <span>Est. 2026</span>
            </div>
          </div>
        </section>

        {/* Right Half - Login Form */}
        <section className="w-full md:w-[55%] p-8 sm:p-12 md:p-16 flex flex-col relative bg-[#0a0a0a]">
          
          <div className="flex items-center gap-2 text-[10px] tracking-widest text-zinc-400 uppercase font-semibold mb-12">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Your space to connect
          </div>

          <header className="mb-10">
            <h2 className="text-3xl font-medium text-white mb-2 tracking-tight">Welcome back.</h2>
            <p className="text-zinc-400 text-sm">Your next great conversation starts here.</p>
          </header>

          {serverError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail size={18} strokeWidth={1.5} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className={`w-full h-12 bg-[#121212] border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-lg pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:bg-[#181818] transition-all`}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <LockKeyhole size={18} strokeWidth={1.5} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`w-full h-12 bg-[#121212] border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-lg pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:bg-[#181818] transition-all`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 font-medium">{errors.password.message}</p>}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-[#121212] checked:bg-emerald-500 checked:border-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 focus:ring-1 transition-all" />
                <span className="text-sm text-zinc-400">Remember me</span>
              </label>
              <button type="button" className="text-sm font-medium text-white hover:text-emerald-400 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-4 bg-white hover:bg-zinc-200 text-black text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} strokeWidth={2} /></>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-xs text-zinc-500">or continue with</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-auto">
            <button className="flex items-center justify-center gap-2 h-11 rounded-lg border border-white/10 bg-[#121212] hover:bg-[#181818] transition-colors text-sm font-medium text-zinc-300">
              <Globe size={16} /> Google
            </button>
            <button className="flex items-center justify-center gap-2 h-11 rounded-lg border border-white/10 bg-[#121212] hover:bg-[#181818] transition-colors text-sm font-medium text-zinc-300">
              <Code size={16} /> GitHub
            </button>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">
              New to IntellMeet?{' '}
              <Link to="/signup" className="text-white hover:text-emerald-400 font-medium transition-colors inline-flex items-center gap-1">
                Create an account <ArrowUpRight size={14} />
              </Link>
            </p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <ShieldCheck size={14} strokeWidth={1.5} />
                <span>Secure</span>
            </div>
          </div>
          
        </section>
      </div>
    </div>
  );
};