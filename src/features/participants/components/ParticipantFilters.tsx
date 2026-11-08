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
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  counts: ParticipantCounts;
}

export const ParticipantFilters: React.FC<ParticipantFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
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

  const categories = [
    { id: 'all', label: 'All Roles' },
    { id: 'hacker', label: 'Hackers' },
    { id: 'mentor', label: 'Mentors' },
    { id: 'judge', label: 'Judges' },
    { id: 'volunteer', label: 'Volunteers' },
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

        {/* Role Category Dropdown */}
        <div className="sm:w-48 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-[#080f21] border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-telemetry cursor-pointer"
            aria-label="Filter by participant role"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-[#0b1633] text-slate-200">
                {cat.label}
              </option>
            ))}
          </select>
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
