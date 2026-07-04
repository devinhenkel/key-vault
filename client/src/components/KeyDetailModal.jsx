import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { getKeyStatus, statusBadge, formatDate } from '../utils/helpers.js';

export default function KeyDetailModal({ apiKey, onClose, onEdit }) {
  const [revealedKey, setRevealedKey] = useState(null);
  const [revealLoading, setRevealLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = getKeyStatus(apiKey);
  const badge = statusBadge(status);

  const handleReveal = async () => {
    setRevealLoading(true);
    try {
      const { keyValue } = await api.revealKey(apiKey.id);
      setRevealedKey(keyValue);
    } catch (err) {
      alert('Failed to reveal key: ' + err.message);
    } finally {
      setRevealLoading(false);
    }
  };

  const handleCopy = async () => {
    let valueToCopy = revealedKey;
    if (!valueToCopy) {
      setRevealLoading(true);
      try {
        const { keyValue } = await api.revealKey(apiKey.id);
        valueToCopy = keyValue;
        setRevealedKey(keyValue);
      } catch (err) {
        alert('Failed to copy key: ' + err.message);
        setRevealLoading(false);
        return;
      }
      setRevealLoading(false);
    }
    try {
      await navigator.clipboard.writeText(valueToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = valueToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const Field = ({ label, value, children }) => (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm text-gray-900 mt-1">{children || value || '—'}</dd>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{apiKey.platformName}</h2>
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${badge.class}`}>
              {badge.label}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* Description */}
          {apiKey.description && (
            <p className="text-sm text-gray-600">{apiKey.description}</p>
          )}

          {/* Key value section */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">API Key Value</span>
              <div className="flex gap-2">
                <button
                  onClick={handleReveal}
                  disabled={revealLoading}
                  className="px-3 py-1 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded hover:bg-brand-100 disabled:opacity-50"
                >
                  {revealLoading ? 'Loading...' : revealedKey ? 'Hide' : 'Reveal'}
                </button>
                <button
                  onClick={handleCopy}
                  disabled={revealLoading}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <code className="text-sm font-mono text-gray-700 break-all">
              {revealedKey || apiKey.keyValue}
            </code>
          </div>

          {/* Details grid */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Key Label" value={apiKey.keyLabel} />
            <Field label="Created By" value={apiKey.createdBy} />
            <Field label="API Endpoint" value={apiKey.endpointUrl}>
              {apiKey.endpointUrl ? (
                <a href={apiKey.endpointUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline break-all">
                  {apiKey.endpointUrl}
                </a>
              ) : '—'}
            </Field>
            <Field label="Documentation" value={apiKey.docsUrl}>
              {apiKey.docsUrl ? (
                <a href={apiKey.docsUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline break-all">
                  {apiKey.docsUrl}
                </a>
              ) : '—'}
            </Field>
            <Field label="Expiration Date">
              {apiKey.expirationDate ? (
                <span className={
                  status === 'expired' ? 'text-red-600 font-medium' :
                  status === 'expiring-soon' ? 'text-amber-600 font-medium' :
                  ''
                }>
                  {formatDate(apiKey.expirationDate)}
                </span>
              ) : '—'}
            </Field>
            <Field label="Status" value={apiKey.isActive ? 'Active' : 'Inactive'} />
            <Field label="Created At" value={formatDate(apiKey.createdAt)} />
            <Field label="Updated At" value={formatDate(apiKey.updatedAt)} />
          </dl>

          {/* Notes */}
          {apiKey.notes && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Notes</dt>
              <dd className="text-sm text-gray-700 whitespace-pre-wrap p-3 bg-gray-50 rounded-lg border border-gray-200">
                {apiKey.notes}
              </dd>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}