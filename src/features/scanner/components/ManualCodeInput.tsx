import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { QrCode, Send, Keyboard, Sparkles } from 'lucide-react';

interface ManualCodeInputProps {
  onSubmitCode: (code: string) => void;
  isProcessing: boolean;
}

export const ManualCodeInput: React.FC<ManualCodeInputProps> = ({
  onSubmitCode,
  isProcessing,
}) => {
  const [code, setCode] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isProcessing) return;
    onSubmitCode(code.trim());
    setCode('');
  };

  const handleQuickFill = (sampleCode: string) => {
    onSubmitCode(sampleCode);
  };

  return (
    <Card hudCorner className="bg-[#0b1328]/90 border-slate-800/80">
      <CardHeader className="pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Manual Badge Code Entry Fallback
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. ALG26-HCK-001 or paste QR string"
              telemetry
              disabled={isProcessing}
              leftIcon={<QrCode className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="md"
            disabled={!code.trim() || isProcessing}
            isLoading={isProcessing}
            rightIcon={<Send className="w-3.5 h-3.5" />}
            className="shrink-0 font-medium"
          >
            Verify Badge
          </Button>
        </form>

        {/* Quick Test Vectors (For Instant Testing in Non-Camera Environments) */}
        <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs font-telemetry">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Test Vectors:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('ALG26-HCK-003')}
              disabled={isProcessing}
              className="px-2 py-1 rounded bg-[#070e20] hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-[11px] text-emerald-400 font-telemetry transition-colors cursor-pointer"
              title="Test Pending Participant (Will Check In)"
            >
              Valid: ALG26-HCK-003
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('ALG26-HCK-001')}
              disabled={isProcessing}
              className="px-2 py-1 rounded bg-[#070e20] hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 text-[11px] text-amber-400 font-telemetry transition-colors cursor-pointer"
              title="Test Already Checked-In Participant"
            >
              Duplicate: ALG26-HCK-001
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('INVALID-CODE-999')}
              disabled={isProcessing}
              className="px-2 py-1 rounded bg-[#070e20] hover:bg-red-950/40 border border-slate-800 hover:border-red-500/50 text-[11px] text-red-400 font-telemetry transition-colors cursor-pointer"
              title="Test Unrecognized QR Code"
            >
              Invalid: BAD-QR
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
