import React, { useEffect, useState } from 'react';
import { Alert } from '../../components/ui/Alert.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Dialog } from '../../components/ui/Dialog.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { organizerService, type ManagedOrganizer } from './services/organizerService.ts';
import axios from 'axios';

export const OrganizersPage: React.FC = () => {
  const [organizers, setOrganizers] = useState<ManagedOrganizer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedOrganizer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', isActive: true });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try { setOrganizers(await organizerService.list()); }
    catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : 'Organizer accounts could not be loaded.'); }
  };
  useEffect(() => { void load(); }, []);

  const openCreate = () => {
    setEditing(null); setForm({ name: '', email: '', password: '', isActive: true }); setError(null); setIsOpen(true);
  };
  const openEdit = (organizer: ManagedOrganizer) => {
    setEditing(organizer); setForm({ name: organizer.name, email: organizer.email, password: '', isActive: organizer.isActive }); setError(null); setIsOpen(true);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(null);
    try {
      if (editing) await organizerService.update(editing.id, { name: form.name, email: form.email, isActive: form.isActive });
      else await organizerService.create({ name: form.name, email: form.email, password: form.password });
      setIsOpen(false); await load();
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : 'Organizer account could not be saved.');
    } finally { setLoading(false); }
  };
  const remove = async (organizer: ManagedOrganizer) => {
    if (!window.confirm(`Delete ${organizer.name}'s organizer account?`)) return;
    try { await organizerService.remove(organizer.id); await load(); }
    catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : 'Organizer account could not be deleted.'); }
  };

  return <div className="space-y-6">
    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
      <div><h1 className="text-2xl font-bold text-white">Organizer accounts</h1><p className="text-sm text-slate-400 mt-1">Create and manage accounts that can scan attendance.</p></div>
      <Button onClick={openCreate}>Add organizer</Button>
    </div>
    {error && <Alert type="error" title="ORGANIZER MANAGEMENT">{error}</Alert>}
    <Card><CardContent className="p-0 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-800 text-left text-xs text-slate-400"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>
      {organizers.map((organizer) => <tr key={organizer.id} className="border-b border-slate-800/70"><td className="p-4 text-slate-100">{organizer.name}</td><td className="p-4 text-slate-300">{organizer.email}</td><td className="p-4">{organizer.isActive ? <span className="text-emerald-400">Active</span> : <span className="text-amber-400">Inactive</span>}</td><td className="p-4 text-right"><Button variant="ghost" size="xs" onClick={() => openEdit(organizer)}>Edit</Button><Button variant="ghost" size="xs" className="text-red-400" onClick={() => void remove(organizer)}>Delete</Button></td></tr>)}
      {organizers.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No organizer accounts found.</td></tr>}
    </tbody></table></CardContent></Card>
    <Dialog isOpen={isOpen} onClose={() => !loading && setIsOpen(false)} title={editing ? 'Edit organizer' : 'Add organizer'} description={editing ? 'Update the organizer name, email, or active status.' : 'Create an organizer account with an email and password.'}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {!editing && <Input label="Password" type="password" minLength={12} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} helperText="Use at least 12 characters." />}
        {editing && <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Account is active</label>}
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" isLoading={loading}>{editing ? 'Save changes' : 'Create organizer'}</Button></div>
      </form>
    </Dialog>
  </div>;
};
