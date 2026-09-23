import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import { signupSchema, type SignupInput } from "../schemas/auth";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// Reusable minimal input to match the new aesthetic
const MinimalInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full h-11 bg-[#141414] border ${error ? 'border-red-500/50' : 'border-[#222]'} rounded-lg px-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:bg-[#1a1a1a] transition-all ${className}`}
      {...props}
    />
  )
);
MinimalInput.displayName = "MinimalInput";

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Member",
    },
    mode: "onTouched",
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);
    try {
      const response = await api.post("/signup", {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
      });

      const resData = response.data as any;
      const user = resData.user || resData.data?.user || resData.data;
      const accessToken = resData.accessToken || resData.token || resData.data?.accessToken || resData.data?.token;

      if (user && accessToken) {
        login(user, accessToken);
        navigate("/dashboard");
      } else {
        setServerError("Registration successful, but received unexpected data from the server.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.message || err.response?.data?.error || "Registration failed.");
      } else {
        setServerError("A network error occurred. Please verify your connection.");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-black text-zinc-100 font-sans">
      
      {/* Left Panel - Deep Emerald Gradient & Steps */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-center p-16">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[#06120e]" />
        <div className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800/40 via-transparent to-transparent opacity-80 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-md mt-20">
          <h1 className="text-[2.75rem] leading-tight font-medium text-white tracking-tight mb-4">
            Get Started<br />with Us
          </h1>
          <p className="text-emerald-100/60 text-sm mb-16 max-w-[200px] leading-relaxed">
            Complete these easy steps to register your account.
          </p>

          {/* Step Cards */}
          <div className="flex gap-4">
            {/* Active Step */}
            <div className="flex-1 bg-white rounded-2xl p-5 shadow-xl shadow-black/20">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium mb-4">1</div>
              <p className="text-black text-sm font-medium leading-snug">Sign up your<br/>account</p>
            </div>
            
            {/* Inactive Steps */}
            <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white/50 flex items-center justify-center text-xs font-medium mb-4">2</div>
              <p className="text-white/60 text-sm font-medium leading-snug">Set up your<br/>workspace</p>
            </div>
            
            <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white/50 flex items-center justify-center text-xs font-medium mb-4">3</div>
              <p className="text-white/60 text-sm font-medium leading-snug">Set up your<br/>profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Minimal Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#050505]">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-white mb-2">Sign Up Account</h2>
            <p className="text-zinc-500 text-xs">Enter your personal data to create your account.</p>
          </div>

          {/* Social Mock Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" className="flex items-center justify-center gap-2 h-10 bg-[#111] border border-[#222] rounded-lg text-xs text-zinc-300 hover:bg-[#1a1a1a] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 h-10 bg-[#111] border border-[#222] rounded-lg text-xs text-zinc-300 hover:bg-[#1a1a1a] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Github
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#222]"></div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px bg-[#222]"></div>
          </div>

          {serverError && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 ml-1">Full Name</label>
              <MinimalInput placeholder="e.g. John Doe" error={Boolean(errors.name)} {...register("name")} />
              {errors.name && <p className="mt-1 text-[11px] text-red-400 ml-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 ml-1">Email</label>
              <MinimalInput type="email" placeholder="e.g. john@company.com" error={Boolean(errors.email)} {...register("email")} />
              {errors.email && <p className="mt-1 text-[11px] text-red-400 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1.5 ml-1">Password</label>
                <MinimalInput type="password" placeholder="Enter password" error={Boolean(errors.password)} {...register("password")} />
                {errors.password && <p className="mt-1 text-[11px] text-red-400 ml-1 leading-tight">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1.5 ml-1">Confirm</label>
                <MinimalInput type="password" placeholder="Confirm password" error={Boolean(errors.confirmPassword)} {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="mt-1 text-[11px] text-red-400 ml-1 leading-tight">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="pt-2">
               <label className="block text-[11px] text-zinc-400 mb-2 ml-1">Account Type</label>
               <div className="flex bg-[#111] border border-[#222] rounded-lg p-1">
                 <label className={`flex-1 text-center py-2 text-xs rounded-md cursor-pointer transition-colors ${selectedRole === 'Member' ? 'bg-[#222] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                   <input type="radio" value="Member" {...register("role")} className="hidden" />
                   Member
                 </label>
                 <label className={`flex-1 text-center py-2 text-xs rounded-md cursor-pointer transition-colors ${selectedRole === 'Host' ? 'bg-[#222] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                   <input type="radio" value="Host" {...register("role")} className="hidden" />
                   Host
                 </label>
               </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-4 bg-white hover:bg-zinc-200 text-black text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                 <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <Link to="/login" className="text-white hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};