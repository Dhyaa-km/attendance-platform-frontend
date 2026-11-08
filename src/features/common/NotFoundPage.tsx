import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.tsx';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { APP_ROUTES } from '../../utils/constants.ts';
import { RadioTower, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card hudCorner className="max-w-md w-full text-center p-8 bg-[#091024]/90 border-blue-900/40">
        <CardContent className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto shadow-xl shadow-blue-950/60">
            <RadioTower className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="font-telemetry text-xs text-cyan-400 uppercase tracking-widest">
              TELEMETRY ERROR 404
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Signal Lost</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The requested operations module or page route was not found in the Algiers station navigation table.
            </p>
          </div>

          <div className="pt-2">
            <Link to={APP_ROUTES.DASHBOARD}>
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Mission Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
