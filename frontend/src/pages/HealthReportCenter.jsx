import React, { useState, useEffect } from 'react';
import DateFilter from '../components/DateFilter';
import ReportCard from '../components/ReportCard';

// --- MOCK DATA START (Replace this with API call later) ---
const MOCK_REPORTS = [
  {
    id: 1,
    date: "2024-11-05T11:00:00",
    refId: "RHR-002156",
    doctor: "Dr. Emily Rodriguez", // From Physician Table [cite: 83]
    specialty: "Cardiology",
    height: "176 cm",
    weight: "68 kg",
    bmi: "28.5",
  },
  {
    id: 2,
    date: "2024-12-10T15:00:00",
    refId: "RHR-001234",
    doctor: "Dr. Michael Chen",
    specialty: "Internal Medicine",
    height: "180 cm",
    weight: "85 kg",
    bmi: "23.4",
  },
  {
    id: 3,
    date: "2024-08-20T23:00:00",
    refId: "RHR-002921",
    doctor: "Dr. Lisa Thompson",
    specialty: "General Practice",
    height: "163 cm",
    weight: "54 kg",
    bmi: "20.3",
  },
];
// --- MOCK DATA END ---

export default function HealthReportCenter() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to handle fetching data (Mock or Real)
  const fetchReports = (startDate, endDate) => {
    setLoading(true);
    
    // --- REAL BACKEND OPTION ---
    // If connecting to the Node.js backend plan:
    // const params = new URLSearchParams({ patientId: 1, from: startDate, to: endDate });
    // fetch(`http://localhost:3001/api/health-reports?${params}`)
    //   .then(res => res.json())
    //   .then(data => setReports(data))
    //   .finally(() => setLoading(false));

    // --- MOCK DATA OPTION (Current) ---
    setTimeout(() => {
      let filtered = MOCK_REPORTS;

      if (startDate || endDate) {
        filtered = MOCK_REPORTS.filter((r) => {
          const rDate = new Date(r.date).getTime();
          const sDate = startDate ? new Date(startDate).getTime() : 0;
          const eDate = endDate ? new Date(endDate).setHours(23,59,59) : Infinity;
          return rDate >= sDate && rDate <= eDate;
        });
      }
      
      setReports(filtered);
      setLoading(false);
    }, 500); // Fake network delay
  };

  // Initial load
  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-2">
          Health Reports
        </h1>

        <div className="mb-8 text-gray-600">
          <h2 className="text-lg font-semibold mb-2 underline decoration-2 decoration-gray-300 underline-offset-4">
            Date Range Filter Section
          </h2>
        </div>

        {/* Filter Component */}
        <DateFilter onFilter={fetchReports} />

        {/* Reports List */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4 underline decoration-2 decoration-gray-300 underline-offset-4 text-blue-900 bg-blue-50 inline-block px-2 py-1">
            Health Reports
          </h2>
          
          <div className="space-y-4 border-t border-gray-200 pt-4 border-l border-r border-b p-4 bg-white min-h-[300px] rounded-b-lg">
            {loading ? (
              <div className="flex justify-center items-center h-40 text-gray-400">
                Loading reports...
              </div>
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <div className="text-center text-gray-400 py-10">
                No reports found in this date range.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}