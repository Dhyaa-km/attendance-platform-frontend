import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '../validation/loginSchema.ts';
import { useAuthStore } from '../../../stores/useAuthStore.ts';
import { authService } from '../services/authService.ts';
import { Input } from '../../../components/ui/Input.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Alert } from '../../../components/ui/Alert.tsx';
import { APP_ROUTES } from '../../../utils/constants.ts';
import { MOCK_ORGANIZERS } from '../../../mocks/mockData.ts';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
  Terminal,
} from 'lucide-react';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState<boolean>(false);

  const rememberedEmail = authService.getRememberedEmail();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail || '',
      password: '',
      rememberMe: Boolean(rememberedEmail),
    },
  });

  // Clear store errors when navigating or unmounting
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const organizer = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      const fallbackRoute = organizer.role === 'admin' ? APP_ROUTES.DASHBOARD : APP_ROUTES.SCANNER;
      navigate(from || fallbackRoute, { replace: true });
    } catch {
      // Error handled by store and displayed via Alert
    }
  };

  const handleSelectDemoAccount = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'algiers2026', { shouldValidate: true });
    clearError();
  };

  const isPending = isLoading || isSubmitting;

  return (
    <div className="space-y-5">
      {/* Global Error Banner */}
      {error && (
        <Alert type="error" title="AUTHENTICATION ERROR" onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <Input
            label="Organizer Email"
            type="email"
            placeholder="e.g. lead@spaceapps-algiers.dz"
            autoComplete="email"
            disabled={isPending}
            error={errors.email?.message}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            {...register('email')}
          />
        </div>

        {/* Password Field with Visibility Toggle */}
        <div>
          <Input
            label="Passcode / Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your organizer password"
            autoComplete="current-password"
            disabled={isPending}
            error={errors.password?.message}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus:text-blue-400"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            {...register('password')}
          />
        </div>

        {/* Remember Me Option */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
              type="checkbox"
              disabled={isPending}
              className="w-4 h-4 rounded bg-[#080f22] border-slate-700 text-blue-600 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none transition-colors cursor-pointer"
              {...register('rememberMe')}
            />
            <span className="text-xs text-slate-300 group-hover:text-slate-200 transition-colors">
              Remember organizer email on this workstation
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          className="w-full mt-2 font-semibold tracking-wide glow-blue"
          rightIcon={!isPending && <ArrowRight className="w-4 h-4" />}
        >
          {isPending ? 'Authenticating Terminal...' : 'Authenticate & Access Terminal'}
        </Button>
      </form>

      {/* Quick Authorized Flight Crew Drawer (Development & Testing Convenience) */}
      <div className="pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
          className="w-full flex items-center justify-between text-left p-2 rounded-lg bg-[#070e20] hover:bg-[#0b142c] border border-slate-800/80 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-telemetry text-slate-300 uppercase tracking-wider">
              Authorized Organizer Accounts (3–5 Crew)
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-telemetry group-hover:underline">
            {showDemoAccounts ? 'Hide' : 'Show'}
          </span>
        </button>

        {showDemoAccounts && (
          <div className="mt-2.5 space-y-2 p-3 rounded-xl bg-[#060c1d] border border-slate-800 animate-in fade-in duration-150">
            <p className="text-[11px] text-slate-400 leading-tight">
              Click any authorized organizer below to prefill credentials (password: <code className="text-cyan-300 font-telemetry">algiers2026</code>):
            </p>

            <div className="space-y-1.5 pt-1">
              {MOCK_ORGANIZERS.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSelectDemoAccount(org.email)}
                  className="w-full p-2 rounded-lg bg-[#091228] hover:bg-blue-950/40 border border-slate-800/80 hover:border-blue-700/50 text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-blue-900/40 border border-blue-500/30 text-blue-300 font-telemetry font-bold text-[10px] flex items-center justify-center">
                      {org.callsign?.slice(0, 2) || 'OR'}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {org.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-telemetry">
                        {org.email} • {org.badgeId}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-telemetry text-cyan-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Fill
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security & Access Restriction Notice */}
      <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-400 leading-relaxed font-telemetry">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <span>
          Access strictly restricted to authorized organizers. All check-in activities and terminal sessions are cryptographically logged.
        </span>
      </div>
    </div>
  );
};
