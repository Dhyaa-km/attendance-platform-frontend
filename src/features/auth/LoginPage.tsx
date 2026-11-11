import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.tsx';
import { LoginForm } from './components/LoginForm.tsx';
import { EVENT_DETAILS } from '../../utils/constants.ts';
import { ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-lg font-bold uppercase tracking-wider text-white">
              {EVENT_DETAILS.NAME}
            </h1>
            <span className="text-[10px] font-telemetry bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
              {EVENT_DETAILS.YEAR}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            {EVENT_DETAILS.LOCATION} — {EVENT_DETAILS.TAGLINE}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-telemetry">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>RESTRICTED ACCESS • ORGANIZER TERMINAL ONLY</span>
        </div>
      </div>

      <Card hudCorner className="border-blue-900/40 bg-[#0a1226]/90 shadow-2xl backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <CardTitle className="text-base text-slate-100 flex items-center justify-between">
            <span>Sign in</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 leading-relaxed pt-1">
            Sign in with your organizer account to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <LoginForm />
        </CardContent>
      </Card>

      <div className="text-center text-[11px] text-slate-400 font-telemetry space-y-1">
        <p>NASA International Space Apps Challenge • Local Edition Algiers</p>
      </div>
    </div>
  );
};
