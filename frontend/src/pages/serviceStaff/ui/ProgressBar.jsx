import React from 'react';

export function ProgressBar({
  progress,
  showPercentage = true
}) {
  // Determine color based on progress
  let barColor;
  if (progress < 25) barColor = 'bg-red-500';
  else if (progress < 50) barColor = 'bg-yellow-500';
  else if (progress < 75) barColor = 'bg-blue-500';
  else barColor = 'bg-green-500';

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        {showPercentage && (
          <span className="text-xs font-medium text-gray-700">
            {progress}% Complete
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${barColor}`}
          style={{
            width: `${progress}%`
          }}
        ></div>
      </div>
    </div>
  );
}