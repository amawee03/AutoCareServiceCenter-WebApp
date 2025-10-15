import React from 'react';

const StatsCard = ({
  title,
  value,
  icon,
  change,
  bgColor = 'bg-white',
}) => {
  return (
    <div className={`${bgColor} rounded-lg shadow-md p-6`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <p
                className={`ml-2 text-sm font-medium ${
                  change.positive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change.positive ? '+' : ''}
                {change.value}
              </p>
            )}
          </div>
        </div>
        <div className="p-2 bg-gray-50 rounded-md">{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
