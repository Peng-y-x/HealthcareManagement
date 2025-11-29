import React, { useState } from 'react';

const DateFilter = ({ onFilter }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleShowClick = () => {
    onFilter(fromDate, toDate);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-full max-w-sm mx-auto mb-8">
      {/* From Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </div>
      
      {/* To Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      {/* Action Button */}
      <button 
        onClick={handleShowClick}
        className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded transition-colors"
      >
        Show
      </button>
    </div>
  );
};

export default DateFilter;