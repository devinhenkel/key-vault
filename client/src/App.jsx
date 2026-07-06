import React, { useCallback, useEffect } from 'react';
import KeyTable from './components/KeyTable.jsx';
import KeyForm from './components/KeyForm.jsx';
import KeyDetailModal from './components/KeyDetailModal.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import { api } from './utils/api.js';
import { useTheme } from './utils/useTheme.js';
import { usePersistedState } from './utils/usePersistedState.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state — persisted across sessions
  const [search, setSearch] = usePersistedState('keyvault-search', '');
  const [activeFilter, setActiveFilter] = usePersistedState('keyvault-filter', 'all');

  // Non-persisted UI state
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [detailKey, setDetailKey] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (activeFilter !== 'all') params.active = activeFilter;
      const data = await api.listKeys(params);
      setKeys(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = () => {
    setEditingKey(null);
    setShowForm(true);
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingKey) {
        await api.updateKey(editingKey.id, formData);
        showToast('Key updated successfully');
      } else {
        await api.createKey(formData);
        showToast('Key created successfully');
      }
      setShowForm(false);
      setEditingKey(null);
      fetchKeys();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteKey(deleteTarget.id);
      showToast('Key deleted');
      setDeleteTarget(null);
      fetchKeys();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🔐 API Key Catalog</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Private catalog of API keys by platform</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium text-sm"
              >
                + Add Key
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by platform, label, description, or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
          />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          >
            <option value="all">All Keys</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Error:</strong> {error}
            </p>
            <button onClick={fetchKeys} className="mt-2 text-sm text-red-600 dark:text-red-400 underline">
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && keys.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔑</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {search || activeFilter !== 'all'
                ? 'No keys match your filters.'
                : 'No API keys yet. Add your first key to get started.'}
            </p>
            {!search && activeFilter === 'all' && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium text-sm"
              >
                + Add Key
              </button>
            )}
          </div>
        )}

        {/* Key table */}
        {!loading && !error && keys.length > 0 && (
          <KeyTable
            keys={keys}
            onView={setDetailKey}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />
        )}
      </main>

      {/* Form modal */}
      {showForm && (
        <KeyForm
          key={editingKey?.id || 'new'}
          existingKey={editingKey}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingKey(null);
          }}
        />
      )}

      {/* Detail modal */}
      {detailKey && (
        <KeyDetailModal
          apiKey={detailKey}
          onClose={() => setDetailKey(null)}
          onEdit={() => {
            const k = detailKey;
            setDetailKey(null);
            handleEdit(k);
          }}
        />
      )}
      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete API Key"
          message={`Are you sure you want to delete the key "${deleteTarget.keyLabel}" for ${deleteTarget.platformName}? This cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}