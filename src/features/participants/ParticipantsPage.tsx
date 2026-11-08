import React, { useState, useEffect } from 'react';
import { ParticipantFilters } from './components/ParticipantFilters.tsx';
import { ParticipantsTable } from './components/ParticipantsTable.tsx';
import { ParticipantDetailsModal } from './components/ParticipantDetailsModal.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import {
  participantService,
  type ParticipantFilterStatus,
  type ParticipantCounts,
} from './services/participantService.ts';
import type { Participant } from '../../types/participant.ts';
import { Users, Database, Shield } from 'lucide-react';

export const ParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [counts, setCounts] = useState<ParticipantCounts>({
    all: 0,
    checkedIn: 0,
    checkedOut: 0,
    pending: 0,
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStatus, setActiveStatus] = useState<ParticipantFilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch participant records and counts
  useEffect(() => {
    let isMounted = true;
    const requestKey = JSON.stringify([searchQuery, activeStatus, selectedCategory, loadAttempt]);
    Promise.all([
      participantService.getParticipants({
        search: searchQuery,
        status: activeStatus,
        category: selectedCategory,
      }),
      participantService.getParticipantCounts(),
    ])
      .then(([data, totalCounts]) => {
        if (isMounted) {
          setParticipants(data);
          setCounts(totalCounts);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setParticipants([]);
          setLoadError('The participant roster could not be loaded. Please retry.');
        }
      })
      .finally(() => {
        if (isMounted) setLoadedRequestKey(requestKey);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, activeStatus, selectedCategory, loadAttempt]);

  const isLoading =
    loadedRequestKey !== JSON.stringify([searchQuery, activeStatus, selectedCategory, loadAttempt]);

  const handleOpenDetails = (p: Participant) => {
    setSelectedParticipant(p);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedParticipant(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Participants
            </h1>
            <Badge variant="telemetry" className="text-xs">
              {counts.all} TOTAL
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Official NASA Space Apps Challenge Algiers 2026 participant roster and check-in records.
          </p>
        </div>

        {/* Database Sync Status Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070e20] border border-slate-800 text-xs font-telemetry text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Roster Synchronized</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
          </div>
        </div>
      </div>

      {/* 2. Search & Filters Card */}
      <Card hudCorner className="bg-[#0b1328]/90 border-slate-800/80">
        <CardContent className="p-4 sm:p-5">
          <ParticipantFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            counts={counts}
          />
        </CardContent>
      </Card>

      {/* 3. Search Results Meta Bar */}
      <div className="flex items-center justify-between text-xs font-telemetry text-slate-400 px-1">
        <div>
          Showing <span className="text-cyan-300 font-semibold">{participants.length}</span> of {counts.all} attendees
          {searchQuery && (
            <span> matching &ldquo;<span className="text-slate-200">{searchQuery}</span>&rdquo;</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>Algiers Roster Database</span>
        </div>
      </div>

      {/* 4. Responsive Participants Table & Mobile Cards */}
      {loadError ? (
        <Alert type="error" title="ROSTER UNAVAILABLE">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{loadError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            >
              Retry
            </Button>
          </div>
        </Alert>
      ) : (
        <ParticipantsTable
          participants={participants}
          onSelectParticipant={handleOpenDetails}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
      )}

      {/* 5. Participant Details Modal View */}
      <ParticipantDetailsModal
        participant={selectedParticipant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
