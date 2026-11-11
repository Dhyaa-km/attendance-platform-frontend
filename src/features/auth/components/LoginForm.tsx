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
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const rememberedEmail = authService.getRememberedEmail();

  const {
    register,
    handleSubmit,
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

      <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-400 leading-relaxed font-telemetry">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <span>
          Access is restricted to authorized accounts.
        </span>
      </div>
    </div>
  );
};
