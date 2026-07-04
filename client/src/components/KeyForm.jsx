import React, { useState } from 'react';

export default function KeyForm({ existingKey, onSubmit, onCancel }) {
  const isEdit = Boolean(existingKey);

  const [form, setForm] = useState({
    platformName: existingKey?.platformName || '',
    description: existingKey?.description || '',
    endpointUrl: existingKey?.endpointUrl || '',
    docsUrl: existingKey?.docsUrl || '',
    keyLabel: existingKey?.keyLabel || '',
    keyValue: '', // Always empty on form load — never pre-fill with encrypted value
    createdBy: existingKey?.createdBy || '',
    expirationDate: existingKey?.expirationDate ? existingKey.expirationDate.split('T')[0] : '',
    notes: existingKey?.notes || '',
    isActive: existingKey?.isActive ?? true,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
    // Clear field error
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    const e = {};
    if (!form.platformName.trim()) e.platformName = 'Required';
    if (!form.keyLabel.trim()) e.keyLabel = 'Required';
    if (!form.keyValue.trim() && !isEdit) e.keyValue = 'Required';
    if (!form.createdBy.trim()) e.createdBy = 'Required';
    if (form.endpointUrl && !isValidUrl(form.endpointUrl)) e.endpointUrl = 'Must be a valid URL';
    if (form.docsUrl && !isValidUrl(form.docsUrl)) e.docsUrl = 'Must be a valid URL';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...form };
    // If editing and keyValue was left blank (masked), send the masked value back
    // The backend will detect the mask pattern and keep the existing encrypted value
    if (isEdit && !form.keyValue.trim()) {
      payload.keyValue = '••••'; // signal to backend to keep existing
    }
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit API Key' : 'Add API Key'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Platform name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.platformName}
              onChange={handleChange('platformName')}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                errors.platformName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g. OpenAI"
            />
            {errors.platformName && <p className="text-xs text-red-500 mt-1">{errors.platformName}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={handleChange('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="What is this platform used for?"
            />
          </div>

          {/* Endpoint URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint URL</label>
              <input
                type="url"
                value={form.endpointUrl}
                onChange={handleChange('endpointUrl')}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.endpointUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://api.example.com"
              />
              {errors.endpointUrl && <p className="text-xs text-red-500 mt-1">{errors.endpointUrl}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Documentation URL</label>
              <input
                type="url"
                value={form.docsUrl}
                onChange={handleChange('docsUrl')}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.docsUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://docs.example.com"
              />
              {errors.docsUrl && <p className="text-xs text-red-500 mt-1">{errors.docsUrl}</p>}
            </div>
          </div>

          {/* Key label and value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.keyLabel}
                onChange={handleChange('keyLabel')}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.keyLabel ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g. Production Key"
              />
              {errors.keyLabel && <p className="text-xs text-red-500 mt-1">{errors.keyLabel}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key Value {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={form.keyValue}
                onChange={handleChange('keyValue')}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono ${
                  errors.keyValue ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={isEdit ? 'Leave blank to keep existing key' : 'Paste the API key'}
              />
              {errors.keyValue && <p className="text-xs text-red-500 mt-1">{errors.keyValue}</p>}
              {isEdit && (
                <p className="text-xs text-gray-400 mt-1">Leave blank to keep the existing key value.</p>
              )}
            </div>
          </div>

          {/* Created by and expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.createdBy}
                onChange={handleChange('createdBy')}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.createdBy ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Your name"
              />
              {errors.createdBy && <p className="text-xs text-red-500 mt-1">{errors.createdBy}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input
                type="date"
                value={form.expirationDate}
                onChange={handleChange('expirationDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={handleChange('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={handleChange('isActive')}
              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
            >
              {isEdit ? 'Save Changes' : 'Create Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}