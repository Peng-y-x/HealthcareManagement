import React, { useState } from 'react';
import { DateInput } from '@mantine/dates';
import { Button, Group, Box } from '@mantine/core';
import "./DateFilter.css";

export default function DateFilter({ onFilter }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleFilter = () => {
    const start = startDate ? startDate.toISOString().split('T')[0] : null;
    const end = endDate ? endDate.toISOString().split('T')[0] : null;
    onFilter(start, end);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onFilter(null, null);
  };

  return (
    <Box className="date-filter">
      <div className="date-filter-container">
        <div className="date-inputs">
          <DateInput
            label="From Date"
            placeholder="Select start date"
            value={startDate}
            onChange={setStartDate}
            className="date-input"
          />
          <DateInput
            label="To Date"
            placeholder="Select end date"
            value={endDate}
            onChange={setEndDate}
            minDate={startDate || undefined}
            className="date-input"
          />
        </div>
        
        <Group className="filter-buttons">
          <Button onClick={handleFilter} className="filter-btn">
            Filter Reports
          </Button>
          <Button variant="outline" onClick={handleClear} className="clear-btn">
            Clear Filter
          </Button>
        </Group>
      </div>
    </Box>
  );
}