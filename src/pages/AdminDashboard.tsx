import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Settings, FileText, Plus, Trash2, Save, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SiteConfig {
  id: string;
  github_repo_url: string;
  download_url: string;
  version: string;
}

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  changes: {
    penambahan: string[];
    perubahan: string[];
    perbaikan: string[];
  };
  sort_order: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [showAllChangelogs, setShowAllChangelogs] = useState(false);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<{entryId: string, type: string, index: number} | null>(null);

  const [activeTab, setActiveTab] = useState<'config' | 'changelog'>('config');

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
    }
  };

  const loadData = async () => {
    try {
      const [configRes, changelogRes] = await Promise.all([
        supabase.from('site_config').select('*').maybeSingle(),
        supabase.from('changelog_entries').select('*').order('sort_order', { ascending: false })
      ]);

      if (configRes.data) setConfig(configRes.data);
      if (changelogRes.data) setChangelog(changelogRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('site_config')
        .update({
          github_repo_url: config.github_repo_url,
          download_url: config.download_url,
          version: config.version,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const addChangelogEntry = () => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const newEntry: ChangelogEntry = {
      id: crypto.randomUUID(),
      version: '1.0.0',
      date: formattedDate,
      changes: {
        penambahan: [],
        perubahan: [],
        perbaikan: []
      },
      sort_order: changelog.length > 0 ? Math.max(...changelog.map(e => e.sort_order)) + 1 : 1
    };
    setChangelog([newEntry, ...changelog]);
  };

  const updateChangelogEntry = (id: string, field: keyof ChangelogEntry, value: any) => {
    setChangelog(changelog.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addChange = (entryId: string, type: 'penambahan' | 'perubahan' | 'perbaikan') => {
    setChangelog(changelog.map(entry =>
      entry.id === entryId
        ? { ...entry, changes: { ...entry.changes, [type]: [...entry.changes[type], ''] } }
        : entry
    ));
  };

  const updateChange = (entryId: string, type: 'penambahan' | 'perubahan' | 'perbaikan', changeIndex: number, value: string) => {
    setChangelog(changelog.map(entry =>
      entry.id === entryId
        ? {
            ...entry,
            changes: {
              ...entry.changes,
              [type]: entry.changes[type].map((c, i) => i === changeIndex ? value : c)
            }
          }
        : entry
    ));
  };

  const removeChange = (entryId: string, type: 'penambahan' | 'perubahan' | 'perbaikan', changeIndex: number) => {
    const confirmKey = `${entryId}-${type}-${changeIndex}`;
    const currentConfirm = deleteItemConfirm;

    if (currentConfirm?.entryId === entryId && currentConfirm?.type === type && currentConfirm?.index === changeIndex) {
      setChangelog(changelog.map(entry =>
        entry.id === entryId
          ? {
              ...entry,
              changes: {
                ...entry.changes,
                [type]: entry.changes[type].filter((_, i) => i !== changeIndex)
              }
            }
          : entry
      ));
      setDeleteItemConfirm(null);
    } else {
      setDeleteItemConfirm({ entryId, type, index: changeIndex });
      setTimeout(() => setDeleteItemConfirm(null), 3000);
    }
  };

  const deleteChangelogEntry = (id: string) => {
    if (deleteConfirmId === id) {
      deleteChangelogFromDB(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const validateDate = (dateStr: string): boolean => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(dateStr);
  };

  const saveChangelogEntry = async (entryId: string) => {
    const entry = changelog.find(e => e.id === entryId);
    if (!entry) return;

    if (!validateDate(entry.date)) {
      setMessage({ type: 'error', text: 'Format tanggal harus DD/MM/YYYY' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setSavingEntryId(entryId);
    setMessage(null);

    try {
      const existingEntry = await supabase
        .from('changelog_entries')
        .select('id')
        .eq('id', entryId)
        .maybeSingle();

      if (existingEntry.data) {
        const { error } = await supabase
          .from('changelog_entries')
          .update({
            version: entry.version,
            date: entry.date,
            changes: entry.changes,
            sort_order: entry.sort_order
          })
          .eq('id', entryId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('changelog_entries')
          .insert({
            id: entry.id,
            version: entry.version,
            date: entry.date,
            changes: entry.changes,
            sort_order: entry.sort_order
          });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Changelog saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSavingEntryId(null);
    }
  };

  const deleteChangelogFromDB = async (entryId: string) => {
    try {
      await supabase.from('changelog_entries').delete().eq('id', entryId);
      setChangelog(changelog.filter(entry => entry.id !== entryId));
      setMessage({ type: 'success', text: 'Changelog deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'config'
                  ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <Settings className="w-5 h-5" />
              Site Configuration
            </button>
            <button
              onClick={() => setActiveTab('changelog')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'changelog'
                  ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-5 h-5" />
              Changelog
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-6 flex items-center gap-2 p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{message.text}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === 'config' && config && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    GitHub Repository URL
                  </label>
                  <input
                    type="text"
                    value={config.github_repo_url}
                    onChange={(e) => setConfig({ ...config, github_repo_url: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Download URL
                  </label>
                  <input
                    type="text"
                    value={config.download_url}
                    onChange={(e) => setConfig({ ...config, download_url: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Version
                  </label>
                  <input
                    type="text"
                    value={config.version}
                    onChange={(e) => setConfig({ ...config, version: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveConfig}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                >
                  <motion.div
                    animate={saving ? { rotate: 360 } : {}}
                    transition={saving ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                  >
                    <Save className="w-5 h-5" />
                  </motion.div>
                  {saving ? 'Saving...' : 'Save Configuration'}
                </motion.button>
              </motion.div>
            )}

            {activeTab === 'changelog' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Changelog Entries</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addChangelogEntry}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Entry
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {(showAllChangelogs ? changelog : changelog.slice(0, 5)).map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-slate-900/50 border border-slate-600 rounded-lg space-y-4"
                    >
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={entry.version}
                          onChange={(e) => updateChangelogEntry(entry.id, 'version', e.target.value)}
                          placeholder="Version"
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={entry.date}
                          onChange={(e) => updateChangelogEntry(entry.id, 'date', e.target.value)}
                          placeholder="DD/MM/YYYY"
                          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <AnimatePresence>
                          {editingEntryId === entry.id && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              onClick={() => deleteChangelogEntry(entry.id)}
                              className={`px-3 py-2 rounded transition-colors ${
                                deleteConfirmId === entry.id
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </AnimatePresence>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingEntryId(editingEntryId === entry.id ? null : entry.id)}
                          className={`px-3 py-2 rounded transition-colors ${
                            editingEntryId === entry.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                          }`}
                        >
                          {editingEntryId === entry.id ? 'Done' : 'Edit'}
                        </motion.button>
                      </div>
                      {deleteConfirmId === entry.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <p className="text-sm text-red-400">Klik tombol delete lagi untuk konfirmasi hapus!</p>
                        </motion.div>
                      )}

                      <div className="space-y-3">
                        <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-green-400">Penambahan</h4>
                            <button
                              onClick={() => addChange(entry.id, 'penambahan')}
                              className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {entry.changes.penambahan.map((change, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={change}
                                  onChange={(e) => updateChange(entry.id, 'penambahan', index, e.target.value)}
                                  className="flex-1 px-3 py-2 bg-slate-800 border border-green-500/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="Tambahkan fitur baru..."
                                />
                                <AnimatePresence>
                                  {editingEntryId === entry.id && (
                                    <motion.button
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      onClick={() => removeChange(entry.id, 'penambahan', index)}
                                      className={`px-3 py-2 rounded transition-colors ${
                                        deleteItemConfirm?.entryId === entry.id &&
                                        deleteItemConfirm?.type === 'penambahan' &&
                                        deleteItemConfirm?.index === index
                                          ? 'bg-red-500 hover:bg-red-600 text-white'
                                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                      }`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                          {deleteItemConfirm?.entryId === entry.id && deleteItemConfirm?.type === 'penambahan' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center gap-2 p-2 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                            >
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <p className="text-xs text-red-400">Klik tombol delete lagi untuk konfirmasi!</p>
                            </motion.div>
                          )}
                        </div>

                        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-blue-400">Perubahan</h4>
                            <button
                              onClick={() => addChange(entry.id, 'perubahan')}
                              className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {entry.changes.perubahan.map((change, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={change}
                                  onChange={(e) => updateChange(entry.id, 'perubahan', index, e.target.value)}
                                  className="flex-1 px-3 py-2 bg-slate-800 border border-blue-500/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Ubah fitur yang ada..."
                                />
                                <AnimatePresence>
                                  {editingEntryId === entry.id && (
                                    <motion.button
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      onClick={() => removeChange(entry.id, 'perubahan', index)}
                                      className={`px-3 py-2 rounded transition-colors ${
                                        deleteItemConfirm?.entryId === entry.id &&
                                        deleteItemConfirm?.type === 'perubahan' &&
                                        deleteItemConfirm?.index === index
                                          ? 'bg-red-500 hover:bg-red-600 text-white'
                                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                      }`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                          {deleteItemConfirm?.entryId === entry.id && deleteItemConfirm?.type === 'perubahan' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center gap-2 p-2 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                            >
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <p className="text-xs text-red-400">Klik tombol delete lagi untuk konfirmasi!</p>
                            </motion.div>
                          )}
                        </div>

                        <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-orange-400">Perbaikan</h4>
                            <button
                              onClick={() => addChange(entry.id, 'perbaikan')}
                              className="px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {entry.changes.perbaikan.map((change, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={change}
                                  onChange={(e) => updateChange(entry.id, 'perbaikan', index, e.target.value)}
                                  className="flex-1 px-3 py-2 bg-slate-800 border border-orange-500/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="Perbaiki bug..."
                                />
                                <AnimatePresence>
                                  {editingEntryId === entry.id && (
                                    <motion.button
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      onClick={() => removeChange(entry.id, 'perbaikan', index)}
                                      className={`px-3 py-2 rounded transition-colors ${
                                        deleteItemConfirm?.entryId === entry.id &&
                                        deleteItemConfirm?.type === 'perbaikan' &&
                                        deleteItemConfirm?.index === index
                                          ? 'bg-red-500 hover:bg-red-600 text-white'
                                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                      }`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                          {deleteItemConfirm?.entryId === entry.id && deleteItemConfirm?.type === 'perbaikan' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center gap-2 p-2 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                            >
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <p className="text-xs text-red-400">Klik tombol delete lagi untuk konfirmasi!</p>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => saveChangelogEntry(entry.id)}
                        disabled={savingEntryId === entry.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 disabled:bg-slate-600/50 text-blue-400 disabled:text-slate-500 rounded-lg transition-all border border-blue-500/20"
                      >
                        <motion.div
                          animate={savingEntryId === entry.id ? { rotate: 360 } : {}}
                          transition={savingEntryId === entry.id ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                        >
                          <Save className="w-4 h-4" />
                        </motion.div>
                        {savingEntryId === entry.id ? 'Saving...' : 'Save This Entry'}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                {changelog.length > 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center pt-4"
                  >
                    <button
                      onClick={() => setShowAllChangelogs(!showAllChangelogs)}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      <span className="font-medium">
                        {showAllChangelogs ? 'Show Less' : `Show All (${changelog.length} entries)`}
                      </span>
                      <motion.div
                        animate={{ rotate: showAllChangelogs ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={20} />
                      </motion.div>
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
