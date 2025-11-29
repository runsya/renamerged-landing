import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Settings, FileText, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

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
  changes: string[];
  sort_order: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const addChangelogEntry = () => {
    const newEntry: ChangelogEntry = {
      id: crypto.randomUUID(),
      version: '1.0.0',
      date: new Date().toISOString().split('T')[0],
      changes: ['New feature'],
      sort_order: changelog.length
    };
    setChangelog([newEntry, ...changelog]);
  };

  const updateChangelogEntry = (id: string, field: keyof ChangelogEntry, value: any) => {
    setChangelog(changelog.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addChange = (entryId: string) => {
    setChangelog(changelog.map(entry =>
      entry.id === entryId
        ? { ...entry, changes: [...entry.changes, 'New change'] }
        : entry
    ));
  };

  const updateChange = (entryId: string, changeIndex: number, value: string) => {
    setChangelog(changelog.map(entry =>
      entry.id === entryId
        ? {
            ...entry,
            changes: entry.changes.map((c, i) => i === changeIndex ? value : c)
          }
        : entry
    ));
  };

  const removeChange = (entryId: string, changeIndex: number) => {
    setChangelog(changelog.map(entry =>
      entry.id === entryId
        ? { ...entry, changes: entry.changes.filter((_, i) => i !== changeIndex) }
        : entry
    ));
  };

  const deleteChangelogEntry = (id: string) => {
    setChangelog(changelog.filter(entry => entry.id !== id));
  };

  const saveChangelog = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await supabase.from('changelog_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const entries = changelog.map((entry, index) => ({
        id: entry.id,
        version: entry.version,
        date: entry.date,
        changes: entry.changes,
        sort_order: changelog.length - index
      }));

      const { error } = await supabase.from('changelog_entries').insert(entries);
      if (error) throw error;

      setMessage({ type: 'success', text: 'Changelog saved successfully!' });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
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
            {message && (
              <div className={`mb-6 flex items-center gap-2 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            {activeTab === 'config' && config && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    GitHub Repository URL
                  </label>
                  <input
                    type="text"
                    value={config.github_repo_url}
                    onChange={(e) => setConfig({ ...config, github_repo_url: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Download URL
                  </label>
                  <input
                    type="text"
                    value={config.download_url}
                    onChange={(e) => setConfig({ ...config, download_url: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Version
                  </label>
                  <input
                    type="text"
                    value={config.version}
                    onChange={(e) => setConfig({ ...config, version: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            )}

            {activeTab === 'changelog' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Changelog Entries</h2>
                  <button
                    onClick={addChangelogEntry}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Entry
                  </button>
                </div>

                <div className="space-y-4">
                  {changelog.map((entry) => (
                    <div key={entry.id} className="p-4 bg-slate-900/50 border border-slate-600 rounded-lg space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={entry.version}
                          onChange={(e) => updateChangelogEntry(entry.id, 'version', e.target.value)}
                          placeholder="Version"
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateChangelogEntry(entry.id, 'date', e.target.value)}
                          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => deleteChangelogEntry(entry.id)}
                          className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {entry.changes.map((change, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={change}
                              onChange={(e) => updateChange(entry.id, index, e.target.value)}
                              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => removeChange(entry.id, index)}
                              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addChange(entry.id)}
                          className="w-full px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded transition-colors"
                        >
                          + Add Change
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveChangelog}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changelog'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
