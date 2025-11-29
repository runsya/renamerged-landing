import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, Save, AlertCircle, CheckCircle, Link as LinkIcon, Package, Github, HardDrive } from 'lucide-react';

interface SiteConfig {
  id: string;
  github_repo_url: string;
  download_url: string;
  version: string;
  file_size: string;
  updated_at: string;
}

export default function AppConfigManager() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error loading config:', error);
      showMessage('error', 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!config) return;

    if (!config.github_repo_url || !config.download_url || !config.version || !config.file_size) {
      showMessage('error', 'All fields are required');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_config')
        .update({
          github_repo_url: config.github_repo_url,
          download_url: config.download_url,
          version: config.version,
          file_size: config.file_size,
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.id);

      if (error) throw error;

      showMessage('success', 'Configuration saved successfully!');
      loadConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      showMessage('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SiteConfig, value: string) => {
    if (config) {
      setConfig({ ...config, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="text-center py-12 text-red-400">
          Configuration not found. Please check your database.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20'
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-green-400" size={20} />
          ) : (
            <AlertCircle className="text-red-400" size={20} />
          )}
          <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2">
          <Settings className="text-blue-400" size={24} />
          <h3 className="text-xl font-bold text-white">App Configuration</h3>
        </div>
        <p className="text-sm text-slate-400 mt-1">Manage your application settings</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Github size={16} />
            GitHub Repository URL
          </label>
          <input
            type="url"
            value={config.github_repo_url}
            onChange={(e) => updateField('github_repo_url', e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <p className="text-xs text-slate-500">
            The main GitHub repository URL for your project
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <LinkIcon size={16} />
            Download URL
          </label>
          <input
            type="url"
            value={config.download_url}
            onChange={(e) => updateField('download_url', e.target.value)}
            placeholder="https://github.com/username/repo/releases/latest/download/file.exe"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <p className="text-xs text-slate-500">
            Direct download link for your application installer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Package size={16} />
              Current Version
            </label>
            <input
              type="text"
              value={config.version}
              onChange={(e) => updateField('version', e.target.value)}
              placeholder="1.0.0"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <p className="text-xs text-slate-500">
              Semantic version number (e.g., 1.0.0, 2.1.3)
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <HardDrive size={16} />
              File Size
            </label>
            <input
              type="text"
              value={config.file_size}
              onChange={(e) => updateField('file_size', e.target.value)}
              placeholder="~33MB"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <p className="text-xs text-slate-500">
              Display file size (e.g., ~33MB, 45.2MB)
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Last updated: {new Date(config.updated_at).toLocaleString()}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-400">Configuration Tips</p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>GitHub URL should point to your repository homepage</li>
              <li>Download URL should be a direct link to the installer file</li>
              <li>Version format: MAJOR.MINOR.PATCH (e.g., 1.0.0)</li>
              <li>File size format: use ~ for approximate (e.g., ~33MB, 45.2MB)</li>
              <li>Changes will be reflected on the landing page immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
