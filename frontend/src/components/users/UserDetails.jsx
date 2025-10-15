import React from 'react';

export default function UserDetails({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">User Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-gray-600">Name</div>
            <div className="col-span-2 text-gray-900">{user.name || '—'}</div>

            <div className="font-medium text-gray-600">Email</div>
            <div className="col-span-2 text-gray-900">{user.email || '—'}</div>

            <div className="font-medium text-gray-600">Role</div>
            <div className="col-span-2 text-gray-900">{user.role || '—'}</div>

            <div className="font-medium text-gray-600">Phone(s)</div>
            <div className="col-span-2 text-gray-900">{user.phoneNumbers?.join(', ') || '—'}</div>

            <div className="font-medium text-gray-600">Address</div>
            <div className="col-span-2 text-gray-900">{user.address || '—'}</div>

            <div className="font-medium text-gray-600">Preferred Contact</div>
            <div className="col-span-2 text-gray-900">{user.preferredContactMethod || '—'}</div>

            <div className="font-medium text-gray-600">Created</div>
            <div className="col-span-2 text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700">Close</button>
        </div>
      </div>
    </div>
  );
}


