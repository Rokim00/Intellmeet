import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, CheckCircle2, User, Mail, Lock, Building2, MapPin, Globe, KeyRound } from 'lucide-react';
import { Box, Grid, Stack, Typography } from '@mui/material';

import { useAuth } from '@/context/AuthContext';
import { verifyInviteCode } from '@/api/organization/organization.api';
import type { OrgVerifyResponse } from '@/api/organization/organization.types';
import { signupSchema, type SignupFormValues } from '@/schemas/auth.schema';
import { parseApiError } from '@/utils/apiError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IntellMeetLogo } from '@/components/ui/IntellMeetLogo';

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifiedOrg, setVerifiedOrg] = useState<OrgVerifyResponse | null>(null);
  const [codeError, setCodeError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      isCreatingOrg: true,
      organizationName: '',
      organizationLocation: '',
      organizationSlug: '',
      inviteCode: '',
    },
  });

  const isCreatingOrg = useWatch({ control, name: 'isCreatingOrg' });
  const organizationName = useWatch({ control, name: 'organizationName' });
  const inviteCode = useWatch({ control, name: 'inviteCode' });

  // Auto-generate URL slug from org name
  useEffect(() => {
    if (organizationName) {
      setValue('organizationSlug', organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  }, [organizationName, setValue]);

  // Debounced invite code verification
  useEffect(() => {
    const t = setTimeout(() => {
      if (isCreatingOrg || !inviteCode || inviteCode.trim().length < 4) {
        setVerifiedOrg(null);
        setCodeError('');
        return;
      }

      setVerifyingCode(true);
      setCodeError('');
      setVerifiedOrg(null);
      verifyInviteCode(inviteCode.trim().toUpperCase())
        .then(({ data }) => {
          if (data?.data?.valid) {
            setVerifiedOrg(data.data);
            clearErrors('inviteCode');
          }
        })
        .catch((err) => {
          const { message } = parseApiError(err);
          setCodeError(message);
          setError('inviteCode', { message });
        })
        .finally(() => {
          setVerifyingCode(false);
        });
    }, 450);

    return () => clearTimeout(t);
  }, [inviteCode, isCreatingOrg, setError, clearErrors]);

  const onSubmit = async (values: SignupFormValues) => {
    setServerError('');
    try {
      await signup({
        name: values.name,
        email: values.email,
        password: values.password,
        isCreatingOrg: values.isCreatingOrg,
        ...(values.isCreatingOrg
          ? {
            organizationName: values.organizationName,
            organizationLocation: values.organizationLocation || undefined,
            organizationSlug: values.organizationSlug || undefined,
          }
          : {
            inviteCode: values.inviteCode?.toUpperCase(),
          }),
      });
      navigate('/dashboard');
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        setError(field as keyof SignupFormValues, { message: msg });
      });
      setServerError(message);
    }
  };

  const inputCls =
    'h-9 sm:h-9.5 rounded-md border-border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground shadow-none transition-colors hover:border-emerald-500/50 focus-visible:border-emerald-500/80 focus-visible:ring-1 focus-visible:ring-emerald-500/30';
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
      }}
    >
      <Grid container sx={{ minHeight: '100vh', width: '100%' }}>
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
          {/* Inner Rounded Green Card (All 4 Corners Rounded: TL, TR, BL, BR) */}
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
            {/* Radial Ambient Glow */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                opacity: 0.4,
                background: 'radial-gradient(circle at 65% 40%, rgba(16, 185, 129, 0.35) 0%, transparent 65%)',
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

            {/* Bottom Hero & Step Indicator Cards */}
            <Stack spacing={4} sx={{ position: 'relative', zIndex: 10, width: '100%' }}>
              {/* Header: Title on Left, Subtitle on Right */}
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
                  Get Started<br />with Us
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
                  Complete these easy steps to register your account.
                </Typography>
              </Stack>

              {/* 3 Step Cards using MUI Grid */}
              <Grid container spacing={1.75}>
                {[
                  { n: '1', label: 'Sign up your\naccount', active: true },
                  { n: '2', label: 'Set up your\nworkspace', active: false },
                  { n: '3', label: 'Set up your\nprofile', active: false },
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
            py: { xs: 2.5, sm: 3, lg: 1.5 },
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
            <Stack spacing={1.5}>
              {/* Header */}
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
                  Sign Up Account
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', mt: 0.25 }}>
                  Enter your personal data to create your account.
                </Typography>
              </Box>

              {/* Mode Toggle */}
              <Grid
                container
                spacing={0.75}
                sx={{
                  p: 0.5,
                  bgcolor: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
              >
                <Grid size={{ xs: 6 }}>
                  <button
                    type="button"
                    onClick={() => setValue('isCreatingOrg', true)}
                    aria-pressed={isCreatingOrg}
                    className={`w-full py-1.5 px-3 rounded-md text-xs font-semibold transition-all border cursor-pointer ${isCreatingOrg
                      ? 'bg-card text-foreground border-border shadow-xs'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Create Org
                  </button>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <button
                    type="button"
                    onClick={() => setValue('isCreatingOrg', false)}
                    aria-pressed={!isCreatingOrg}
                    className={`w-full py-1.5 px-3 rounded-md text-xs font-semibold transition-all border cursor-pointer ${!isCreatingOrg
                      ? 'bg-card text-foreground border-border shadow-xs'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Join via Invite
                  </button>
                </Grid>
              </Grid>

              {serverError && (
                <Box
                  role="alert"
                  sx={{
                    p: 1.75,
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
                <Stack spacing={1.25}>
                  {/* Full Name */}
                  <Stack spacing={0.5}>
                    <Label htmlFor="name" className={labelCls}>
                      Full Name
                    </Label>
                    <Box sx={{ position: 'relative' }}>
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-err' : undefined}
                        className={`${inputCls} pl-10`}
                        {...register('name')}
                      />
                    </Box>
                    {errors.name && (
                      <p id="name-err" role="alert" className="text-[11px] leading-tight text-red-500 mt-0.5">
                        {errors.name.message}
                      </p>
                    )}
                  </Stack>

                  {/* Email */}
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

                  {/* Password */}
                  <Stack spacing={0.5}>
                    <Label htmlFor="password" className={labelCls}>
                      Password
                    </Label>
                    <Box sx={{ position: 'relative' }}>
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
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

                  {/* Conditional Organization / Invite Section */}
                  <Box sx={{ pt: 1.5, borderTop: '1px solid var(--border)' }}>
                    {isCreatingOrg ? (
                      <Stack spacing={1.5}>
                        <Stack spacing={0.5}>
                          <Label htmlFor="organizationName" className={labelCls}>
                            Organization Name
                          </Label>
                          <Box sx={{ position: 'relative' }}>
                            <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                              id="organizationName"
                              type="text"
                              aria-invalid={!!errors.organizationName}
                              aria-describedby={errors.organizationName ? 'org-err' : undefined}
                              className={`${inputCls} pl-10`}
                              {...register('organizationName')}
                            />
                          </Box>
                          {errors.organizationName && (
                            <p id="org-err" role="alert" className="text-[11px] leading-tight text-red-500 mt-0.5">
                              {errors.organizationName.message}
                            </p>
                          )}
                        </Stack>

                        <Grid container spacing={1.25}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack spacing={0.5}>
                              <Label htmlFor="organizationLocation" className={labelCls}>
                                Location <span className="text-muted-foreground font-normal">(optional)</span>
                              </Label>
                              <Box sx={{ position: 'relative' }}>
                                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                  id="organizationLocation"
                                  type="text"
                                  className={`${inputCls} pl-10`}
                                  {...register('organizationLocation')}
                                />
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack spacing={0.5}>
                              <Label htmlFor="organizationSlug" className={labelCls}>
                                URL Slug
                              </Label>
                              <Box sx={{ position: 'relative' }}>
                                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                  id="organizationSlug"
                                  type="text"
                                  className={`${inputCls} pl-10 font-mono`}
                                  {...register('organizationSlug')}
                                />
                              </Box>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Stack>
                    ) : (
                      <Stack spacing={0.5}>
                        <Label htmlFor="inviteCode" className={labelCls}>
                          Invite Code
                        </Label>
                        <Box sx={{ position: 'relative' }}>
                          <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <Input
                            id="inviteCode"
                            type="text"
                            className={`${inputCls} uppercase font-mono tracking-widest pl-10 pr-10`}
                            aria-invalid={!!errors.inviteCode}
                            aria-describedby="invite-status"
                            {...register('inviteCode', {
                              onChange: (e) => {
                                e.target.value = e.target.value.toUpperCase();
                              },
                            })}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 14,
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}
                            aria-live="polite"
                          >
                            {verifyingCode && <Loader2 size={15} className="animate-spin text-emerald-500" />}
                            {!verifyingCode && verifiedOrg && <CheckCircle2 size={15} className="text-emerald-500" />}
                          </Box>
                        </Box>
                        {verifiedOrg && (
                          <p id="invite-status" role="status" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ Joining <strong>{verifiedOrg.organizationName}</strong>
                          </p>
                        )}
                        {(errors.inviteCode || codeError) && (
                          <p className="text-[11px] leading-tight text-red-500 mt-0.5" role="alert">
                            {errors.inviteCode?.message || codeError}
                          </p>
                        )}
                      </Stack>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-9.5 mt-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-md transition-colors shadow-sm cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Creating account…
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </Button>
                </Stack>
              </form>

              <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)', pt: 0.5 }}>
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                  Log in
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
