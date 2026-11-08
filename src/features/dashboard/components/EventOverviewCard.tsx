import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { EVENT_DETAILS } from '../../../utils/constants.ts';
import { Calendar, MapPin, Globe, Shield, ExternalLink, Activity } from 'lucide-react';

export const EventOverviewCard: React.FC = () => {
  return (
    <Card hudCorner className="bg-[#0b1328]/90 border-slate-800/80">
      <CardHeader className="pb-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Event Intelligence & Location
            </CardTitle>
          </div>
          <Badge variant="success" withDot pulseDot className="text-[10px] uppercase font-telemetry">
            {EVENT_DETAILS.STATUS}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Main Event Headline */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-telemetry text-cyan-400 font-semibold tracking-wider">
              {EVENT_DETAILS.EDITION}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
            {EVENT_DETAILS.NAME}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Internal operational dashboard for on-site organizers. Real-time participant check-in, attendance telemetry, and gate verification.
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Dates */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#070e20] border border-slate-800/70">
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-telemetry uppercase text-slate-400 block">
                Event Schedule
              </span>
              <span className="text-xs font-semibold text-slate-100 font-telemetry">
                {EVENT_DETAILS.DATES}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#070e20] border border-slate-800/70">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-telemetry uppercase text-slate-400 block">
                Verified Venue
              </span>
              <span className="text-xs font-semibold text-slate-100">
                {EVENT_DETAILS.LOCATION}
              </span>
            </div>
          </div>
        </div>

        {/* Station Telemetry Footer */}
        <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-telemetry text-slate-400">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Node: Algiers Central Terminal</span>
          </div>

          <a
            href={EVENT_DETAILS.OFFICIAL_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Globe className="w-3 h-3" />
            <span>spaceappschallenge.org/algiers</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
