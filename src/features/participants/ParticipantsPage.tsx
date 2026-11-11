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
import { Users, Database, Shield, Upload, UserPlus } from 'lucide-react';
import { Dialog } from '../../components/ui/Dialog.tsx';
import { Input } from '../../components/ui/Input.tsx';
import axios from 'axios';

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
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    category: 'hacker',
    role: 'participant',
  });

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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setIsImporting(true);
    setImportMessage(null);
    try {
      const result = await participantService.importCsv(file);
      setImportMessage(`Imported ${result.imported} participants. ${result.duplicates} duplicates and ${result.invalid} invalid rows.`);
      setLoadAttempt((attempt) => attempt + 1);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? error.message
        : error instanceof Error
          ? error.message
          : 'CSV import failed.';
      setImportMessage(message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleShowQr = async (participant: Participant) => {
    const result = await participantService.getParticipantQr(participant.id);
    setQrImage(result.qrCodeDataUrl);
    setSelectedParticipant(participant);
    setIsQrOpen(true);
  };

  const handleCreateParticipant = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    try {
      const result = await participantService.createParticipant(createForm);
      setIsCreateOpen(false);
      setCreateForm({ fullName: '', studentId: '', email: '', phone: '', category: 'hacker', role: 'participant' });
      setLoadAttempt((attempt) => attempt + 1);
      setSelectedParticipant(result.data);
      setQrImage(result.qrCodeDataUrl);
      setIsQrOpen(true);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? error.message
        : error instanceof Error ? error.message : 'Participant creation failed.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setCreateForm({
      fullName: participant.fullName,
      studentId: participant.studentId ?? '',
      email: participant.email,
      phone: participant.phone ?? '',
      category: participant.category,
      role: participant.role ?? 'participant',
    });
    setCreateError(null);
    setIsEditOpen(true);
  };

  const handleUpdateParticipant = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedParticipant) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      await participantService.updateParticipant(selectedParticipant.id, createForm);
      setIsEditOpen(false);
      setLoadAttempt((attempt) => attempt + 1);
    } catch (error) {
      setCreateError(axios.isAxiosError(error) ? error.response?.data?.message ?? error.message : 'Participant update failed.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteParticipant = async (participant: Participant) => {
    if (!window.confirm(`Delete ${participant.fullName}? This also removes their attendance records.`)) return;
    try {
      await participantService.deleteParticipant(participant.id);
      setLoadAttempt((attempt) => attempt + 1);
    } catch (error) {
      setLoadError(axios.isAxiosError(error) ? error.response?.data?.message ?? error.message : 'Participant deletion failed.');
    }
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
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => {
              setCreateError(null);
              setIsCreateOpen(true);
            }}
          >
            Add Participant
          </Button>
          <label className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            {isImporting ? 'Importing...' : 'Upload CSV'}
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} disabled={isImporting} />
          </label>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070e20] border border-slate-800 text-xs font-telemetry text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Roster Synchronized</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
          </div>
          {importMessage && (
            <Alert type={importMessage.includes('failed') ? 'error' : 'success'} title="CSV IMPORT">
              {importMessage}
            </Alert>
          )}
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
          onShowQr={handleShowQr}
          onEditParticipant={handleEditParticipant}
          onDeleteParticipant={handleDeleteParticipant}
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
      {selectedParticipant && (
        <Dialog isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} title="Participant QR Code" maxWidth="sm">
          <div className="flex flex-col items-center gap-4">
            {qrImage && <img src={qrImage} alt={`QR code for ${selectedParticipant.fullName}`} className="w-64 h-64 bg-white p-3 rounded-lg" />}
            <div className="text-center">
              <p className="font-semibold text-white">{selectedParticipant.fullName}</p>
              <p className="text-xs text-slate-400 break-all">{selectedParticipant.qrCode}</p>
            </div>
          </div>
        </Dialog>
      )}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => {
          if (!isCreating) setIsCreateOpen(false);
        }}
        title="Add participant"
        description="Create a participant and generate their QR ticket."
        maxWidth="md"
      >
        <form onSubmit={handleCreateParticipant} className="space-y-4">
          {createError && <Alert type="error" title="PARTICIPANT NOT CREATED">{createError}</Alert>}
          <Input
            label="Full name"
            required
            value={createForm.fullName}
            onChange={(event) => setCreateForm({ ...createForm, fullName: event.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Student ID"
              value={createForm.studentId}
              onChange={(event) => setCreateForm({ ...createForm, studentId: event.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })}
            />
            <Input
              label="Phone"
              type="tel"
              value={createForm.phone}
              onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })}
            />
            <Input
              label="Role"
              required
              placeholder="Participant, organizer, VIP..."
              value={createForm.role}
              onChange={(event) => setCreateForm({ ...createForm, role: event.target.value })}
            />
            <label className="space-y-1.5 text-xs font-medium text-slate-300">
              Category
              <select
                value={createForm.category}
                onChange={(event) => setCreateForm({ ...createForm, category: event.target.value })}
                className="w-full rounded-lg border border-slate-700/80 bg-[#080f21] px-3.5 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                {['hacker', 'mentor', 'judge', 'organizer', 'volunteer', 'vip'].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} leftIcon={<UserPlus className="w-4 h-4" />}>
              Create participant
            </Button>
          </div>
        </form>
      </Dialog>
      <Dialog isOpen={isEditOpen} onClose={() => { if (!isCreating) setIsEditOpen(false); }} title="Edit participant" description="Update participant details." maxWidth="md">
        <form onSubmit={handleUpdateParticipant} className="space-y-4">
          {createError && <Alert type="error" title="PARTICIPANT NOT UPDATED">{createError}</Alert>}
          <Input label="Full name" required value={createForm.fullName} onChange={(event) => setCreateForm({ ...createForm, fullName: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Email" type="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} />
            <Input label="Phone" value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} />
            <Input label="Role" required value={createForm.role} onChange={(event) => setCreateForm({ ...createForm, role: event.target.value })} />
            <label className="space-y-1.5 text-xs font-medium text-slate-300">Category<select value={createForm.category} onChange={(event) => setCreateForm({ ...createForm, category: event.target.value })} className="w-full rounded-lg border border-slate-700/80 bg-[#080f21] px-3.5 py-2 text-sm text-slate-100">{['hacker', 'mentor', 'judge', 'organizer', 'volunteer', 'vip'].map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button type="submit" isLoading={isCreating}>Save changes</Button></div>
        </form>
      </Dialog>
    </div>
  );
};
