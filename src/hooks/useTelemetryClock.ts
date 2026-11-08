import { useState, useEffect } from 'react';
import { formatTime, formatTelemetryDate } from '../utils/formatters.ts';

export interface TelemetryTime {
  timeStr: string;
  dateStr: string;
  isoStr: string;
  algiersOffset: string;
}

export function useTelemetryClock(): TelemetryTime {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    timeStr: formatTime(time),
    dateStr: formatTelemetryDate(time),
    isoStr: time.toISOString(),
    algiersOffset: 'UTC+1',
  };
}
