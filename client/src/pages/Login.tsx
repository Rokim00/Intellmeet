import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

const MinimalInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full h-12 bg-white/[0.02] border ${
        error ? "border-red-500/50" : "border-white/[0.08]"
      } rounded-xl px-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-300 ${className}`}
      {...props}
    />
  )
);
MinimalInput.displayName = "MinimalInput";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

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
    <div className="min-h-screen w-full flex bg-[#030504] text-zinc-100 font-sans selection:bg-emerald-500/30">
      
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 border-r border-white/[0.04]">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-emerald-900/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-900/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">IntellMeet</span>
        </div>

        <div className="relative z-10 max-w-lg mb-20">
          <h1 className="text-5xl leading-[1.1] font-medium text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 tracking-tight mb-6">
            Secure access to your workspace.
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            Enter your credentials to seamlessly resume your collaborative sessions and manage your teams.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
        
        <div className="w-full max-w-[420px] relative z-10">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] p-8 sm:p-10 rounded-3xl shadow-2xl shadow-black/50">
            <div className="mb-8">
              <h2 className="text-2xl font-medium text-white mb-2 tracking-tight">Welcome back</h2>
              <p className="text-zinc-500 text-sm">Please enter your details to sign in.</p>
            </div>

            {serverError && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-400 ml-1">Email Address</label>
                <MinimalInput 
                  type="email" 
                  placeholder="name@company.com" 
                  error={Boolean(errors.email)} 
                  {...register("email")} 
                />
                {errors.email && (
                  <p className="text-[11px] text-red-400 ml-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[12px] font-medium text-zinc-400">Password</label>
                  <Link to="#" className="text-[11px] text-emerald-400/80 hover:text-emerald-400 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <MinimalInput 
                  type="password" 
                  placeholder="••••••••" 
                  error={Boolean(errors.password)} 
                  {...register("password")} 
                />
                {errors.password && (
                  <p className="text-[11px] text-red-400 ml-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 mt-2 bg-white hover:bg-zinc-200 text-black text-sm font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center shadow-lg shadow-white/5"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-white hover:text-emerald-400 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};