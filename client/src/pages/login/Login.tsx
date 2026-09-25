import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { Box, Grid, Stack, Typography } from '@mui/material';

import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { parseApiError } from '@/utils/apiError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IntellMeetLogo } from '@/components/ui/IntellMeetLogo';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');
    try {
      await login({ email: data.email, password: data.password });
      navigate('/dashboard');
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        setError(field as keyof LoginFormValues, { message: msg });
      });
      setServerError(message);
    }
  };

  const inputCls =
    'h-10.5 rounded-md border-border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground shadow-none transition-all hover:border-emerald-500/50 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:shadow-[0_0_20px_rgba(16,185,129,0.3)]';
  const labelCls = 'text-[11px] font-medium text-muted-foreground';

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'var(--background)',
        color: 'var(--foreground)',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Ambient Green Color Bloom Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '25%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0) 70%)',
          filter: 'blur(40px)',
          zIndex: 1,
        }}
      />

      <Grid container sx={{ minHeight: '100vh', width: '100%', position: 'relative', zIndex: 2 }}>
        {/* ── Left Hero Column (Inset with all 4 corners rounded) ── */}
        <Grid
          size={{ xs: 12, lg: 6 }}
          sx={{
            display: { xs: 'none', lg: 'flex' },
            p: 1,
            height: { lg: '100vh' },
            position: { lg: 'sticky' },
            top: 0,
            boxSizing: 'border-box',
          }}
        >
          {/* Inner Rounded Green Card */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              p: { lg: 5, xl: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(145deg, #031c13 0%, #063725 45%, #095237 100%)',
              border: 'none',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
            }}
          >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.5,
              background: 'radial-gradient(circle at 65% 40%, rgba(16, 185, 129, 0.45) 0%, transparent 65%)',
            }}
          />

          {/* Top Brand Mark */}
          <Box sx={{ position: 'relative', zIndex: 10 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/30 shadow-xs">
                <IntellMeetLogo size={20} />
              </div>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.025em',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Intell<span style={{ color: '#34d399' }}>Meet</span>
              </Typography>
            </Stack>
          </Box>

          {/* Bottom Hero & Steps */}
          <Stack spacing={4} sx={{ position: 'relative', zIndex: 10, width: '100%' }}>
            <Stack
              direction={{ xs: 'column', xl: 'row' }}
              spacing={2}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', xl: 'flex-end' },
              }}
            >
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', xl: '2.5rem' },
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome<br />Back
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: 'rgba(167, 243, 208, 0.75)',
                  maxWidth: 240,
                  lineHeight: 1.5,
                  pb: { xl: 0.5 },
                }}
              >
                Sign in to manage your meetings and collaborate with your team.
              </Typography>
            </Stack>

            <Grid container spacing={1.75}>
              {[
                { n: '1', label: 'Sign in to\nyour account', active: true },
                { n: '2', label: 'Select your\nworkspace', active: false },
                { n: '3', label: 'Access your\nmeetings', active: false },
              ].map((step) => (
                <Grid key={step.n} size={{ xs: 4 }}>
                  <Box
                    sx={{
                      p: { xs: 1.75, xl: 2 },
                      height: '100%',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      border: step.active ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.1)',
                      bgcolor: step.active ? '#ffffff' : 'rgba(255, 255, 255, 0.07)',
                      color: step.active ? '#09090b' : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: step.active ? 'none' : 'blur(4px)',
                      boxShadow: step.active ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)' : 'none',
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        mb: 1.5,
                        bgcolor: step.active ? '#09090b' : 'rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                      }}
                    >
                      {step.n}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        lineHeight: 1.35,
                        whiteSpace: 'pre-line',
                        color: step.active ? '#09090b' : 'rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      {step.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Box>
      </Grid>

        {/* ── Right Form Panel (MUI Layout) ── */}
        <Grid
          size={{ xs: 12, lg: 6 }}
          sx={{
            minHeight: '100vh',
            height: { lg: '100vh' },
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: { xs: 3, sm: 6, lg: 8 },
            py: { xs: 3, sm: 4, lg: 2.5 },
            bgcolor: 'var(--background)',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--border)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'var(--muted-foreground)',
            },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 440, mx: 'auto', my: 'auto' }}>
            <Stack spacing={2.5}>
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: '1.35rem', sm: '1.55rem' },
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--foreground)',
                  }}
                >
                  Login Account
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', mt: 0.25 }}>
                  Enter your personal data to access your account.
                </Typography>
              </Box>

              {serverError && (
                <Box
                  role="alert"
                  sx={{
                    p: 1.5,
                    borderRadius: '6px',
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    lineHeight: 1.5,
                  }}
                >
                  {serverError}
                </Box>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={1.75}>
                  <Stack spacing={0.5}>
                    <Label htmlFor="email" className={labelCls}>
                      Email
                    </Label>
                    <Box sx={{ position: 'relative' }}>
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-err' : undefined}
                        className={`${inputCls} pl-10`}
                        {...register('email')}
                      />
                    </Box>
                    {errors.email && (
                      <p id="email-err" role="alert" className="text-[11px] leading-tight text-red-500 mt-0.5">
                        {errors.email.message}
                      </p>
                    )}
                  </Stack>

                  <Stack spacing={0.5}>
                    <Label htmlFor="password" className={labelCls}>
                      Password
                    </Label>
                    <Box sx={{ position: 'relative' }}>
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={`${inputCls} pl-10 pr-10`}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'pass-err' : undefined}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </Box>
                    {errors.password && (
                      <p id="pass-err" role="alert" className="text-[11px] leading-tight text-red-500 mt-0.5">
                        {errors.password.message}
                      </p>
                    )}
                  </Stack>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10.5 mt-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm rounded-md transition-all duration-200 shadow-md cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Signing in…
                      </>
                    ) : (
                      'Log In'
                    )}
                  </Button>
                </Stack>
              </form>

              <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)', pt: 1 }}>
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                  Sign Up
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
