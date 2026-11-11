import React from 'react';
import { Input } from '../../../components/ui/Input.tsx';
import { Tabs } from '../../../components/ui/Tabs.tsx';
import type { ParticipantFilterStatus, ParticipantCounts } from '../services/participantService.ts';
import { Search, X, Users, UserCheck, UserMinus, Clock } from 'lucide-react';

interface ParticipantFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeStatus: ParticipantFilterStatus;
  onStatusChange: (status: ParticipantFilterStatus) => void;
  counts: ParticipantCounts;
}

export const ParticipantFilters: React.FC<ParticipantFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeStatus,
  onStatusChange,
  counts,
}) => {
  const statusTabs = [
    {
      id: 'all',
      label: 'All Attendees',
      count: counts.all,
      icon: <Users className="w-3.5 h-3.5" />,
    },
    {
      id: 'checked_in',
      label: 'Checked In',
      count: counts.checkedIn,
      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      id: 'checked_out',
      label: 'Checked Out',
      count: counts.checkedOut,
      icon: <UserMinus className="w-3.5 h-3.5 text-sky-400" />,
    },
    {
      id: 'pending',
      label: 'Not Checked In',
      count: counts.pending,
      icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar & Role Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by full name, email, badge QR (e.g. ALG26-HCK), or team..."
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            rightIcon={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : undefined
            }
          />
        </div>

      </div>

      {/* Filter Status Tabs */}
      <div className="overflow-x-auto pb-1">
        <Tabs
          tabs={statusTabs}
          activeTab={activeStatus}
          onChange={(tab) => onStatusChange(tab as ParticipantFilterStatus)}
        />
      </div>
    </div>
  );
};
