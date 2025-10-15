import React from 'react';

export function StatusBadge({
  status
}) {
  let bgColor, textColor, label;

  switch (status) {
    case 'scheduled':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      label = 'Scheduled';
      break;
    case 'check-in':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      label = 'Check-in';
      break;
    case 'in-progress':
      bgColor = 'bg-indigo-100';
      textColor = 'text-indigo-800';
      label = 'In Progress';
      break;
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      label = 'Completed';
      break;
    case 'flagged':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'Issue Flagged';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      label = 'Unknown';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}