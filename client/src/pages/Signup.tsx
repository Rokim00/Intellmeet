import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { FieldError } from '../types/auth';

export const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Member'>('Member');
  const [showPassword, setShowPassword] = useState(false);

  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) {
      setFieldErrors({ name: 'Please enter your first and last name.' });
      return;
    }

    if (password.length < 8) {
      setFieldErrors({ password: 'Must be at least 8 characters.' });
      return;
    }

    setLoading(true);

    try {
      await signup({
        name: fullName,
        email,
        password,
        role,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorResponse = (err as { response?: { data?: { message?: string; errors?: FieldError[] } } })?.response?.data;

      if (errorResponse?.errors && Array.isArray(errorResponse.errors)) {
        const errorsMap: Record<string, string> = {};
        errorResponse.errors.forEach((item: FieldError) => {
          errorsMap[item.field] = item.message;
        });
        setFieldErrors(errorsMap);
      }
      setGeneralError(errorResponse?.message || 'Failed to register account. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f11] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-[#14171a] rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Branding / Progress Panel */}
        <div className="relative bg-gradient-to-br from-[#0c3128] via-[#08201a] to-[#0d0f11] p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-16">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-black text-sm">
                IM
              </div>
              <span className="text-white font-semibold text-lg tracking-wide">IntellMeet</span>
            </div>

            <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
              Get Started<br />with Us
            </h1>
            <p className="text-sm text-neutral-400">
              Complete these easy steps to register your team account.
            </p>
          </div>

          {/* Stepper Cards */}
          <div className="grid grid-cols-3 gap-3 mt-12">
            <div className="bg-white text-black p-3.5 rounded-xl flex flex-col justify-between shadow-sm">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-semibold">
                1
              </span>
              <p className="text-xs font-semibold mt-3 leading-snug">Sign up your account</p>
            </div>

            <div className="bg-white/5 border border-white/10 text-neutral-300 p-3.5 rounded-xl flex flex-col justify-between backdrop-blur-sm">
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-semibold">
                2
              </span>
              <p className="text-xs font-medium mt-3 leading-snug">Set up your workspace</p>
            </div>

            <div className="bg-white/5 border border-white/10 text-neutral-300 p-3.5 rounded-xl flex flex-col justify-between backdrop-blur-sm">
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-semibold">
                3
              </span>
              <p className="text-xs font-medium mt-3 leading-snug">Set up your profile</p>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="p-8 md:p-10 flex flex-col justify-center bg-[#111317]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign Up Account</h2>
            <p className="text-xs text-neutral-400 mt-1">Enter your personal data to create your account.</p>
          </div>

          {/* Social Auth Placeholders */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#1a1d24] hover:bg-[#222730] text-xs text-neutral-200 border border-neutral-800 transition"
            >
              <span className="font-semibold text-white">G</span> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#1a1d24] hover:bg-[#222730] text-xs text-neutral-200 border border-neutral-800 transition"
            >
              <span className="font-semibold text-white">🐙</span> GitHub
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-neutral-800 w-full"></div>
            <span className="bg-[#111317] px-3 text-[11px] text-neutral-500 uppercase tracking-widest absolute">
              Or
            </span>
          </div>

          {/* Alert for Server-level Errors */}
          {generalError && (
            <div className="p-3 mb-4 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-xs">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Split Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                  placeholder="eg. John"
                  className="w-full bg-[#1a1d24] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                  placeholder="eg. Francisco"
                  className="w-full bg-[#1a1d24] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
            {fieldErrors.name && <p className="text-[11px] text-red-400">{fieldErrors.name}</p>}

            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="eg. johnfrans@gmail.com"
                className="w-full bg-[#1a1d24] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition"
              />
              {fieldErrors.email && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#1a1d24] border border-neutral-800 rounded-lg pl-3 pr-10 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Must be at least 8 characters.</p>
              {fieldErrors.password && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.password}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as 'Admin' | 'Member')}
                className="w-full bg-[#1a1d24] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin (Host)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-white text-black hover:bg-neutral-200 font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-xs text-neutral-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};