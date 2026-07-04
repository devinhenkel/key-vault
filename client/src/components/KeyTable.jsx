import React from 'react';
import { getKeyStatus, statusBadge, formatDate } from '../utils/helpers.js';

export default function KeyTable({ keys, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Label</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {keys.map((key) => {
              const status = getKeyStatus(key);
              const badge = statusBadge(status);
              return (
                <tr key={key.id} className="hover:bg-gray-50">
                  {/* Status badge */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${badge.class}`}>
                      {badge.label}
                    </span>
                  </td>

                  {/* Platform name */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onView(key)}
                      className="text-sm font-medium text-gray-900 hover:text-brand-600"
                    >
                      {key.platformName}
                    </button>
                    {key.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{key.description}</p>
                    )}
                  </td>

                  {/* Key label */}
                  <td className="px-4 py-3 text-sm text-gray-600">{key.keyLabel}</td>

                  {/* Masked key value */}
                  <td className="px-4 py-3">
                    <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded font-mono">
                      {key.keyValue}
                    </code>
                  </td>

                  {/* Created by */}
                  <td className="px-4 py-3 text-sm text-gray-600">{key.createdBy}</td>

                  {/* Expiration date */}
                  <td className="px-4 py-3 text-sm">
                    {key.expirationDate ? (
                      <span className={
                        status === 'expired' ? 'text-red-600 font-medium' :
                        status === 'expiring-soon' ? 'text-amber-600 font-medium' :
                        'text-gray-600'
                      }>
                        {formatDate(key.expirationDate)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onView(key)}
                      className="text-sm text-brand-600 hover:text-brand-700 px-2"
                      title="View"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(key)}
                      className="text-sm text-gray-600 hover:text-gray-900 px-2"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(key)}
                      className="text-sm text-red-600 hover:text-red-700 px-2"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}