import React from 'react';
import { Table, Button } from '@mantine/core';
import { PATIENTS, HEALTH_REPORTS, PHYSICIANS, WORK_ASSIGNMENTS, CLINICS } from '../../data/mockData';
import "./EntityTable.css";

const ENTITY_DATA = {
  patient: PATIENTS,
  healthreport: HEALTH_REPORTS,
  physician: PHYSICIANS,
  workassignment: WORK_ASSIGNMENTS,
  clinic: CLINICS
};

export default function EntityTable({ headers, activeTab, appliedFilter }) {
  
  // Filter data based on applied filter
  const filterData = (data, filter) => {
    if (!filter) return data;
    
    const filterLower = filter.toLowerCase();
    
    return data.filter(item => {
      // Check if filter matches "attribute, value" pattern
      if (filterLower.includes(',')) {
        const [attr, value] = filterLower.split(',').map(s => s.trim());
        
        // Handle common attribute names
        if (attr === 'name' && item.name) {
          return item.name.toLowerCase().includes(value);
        }
        if (attr === 'email' && item.email) {
          return item.email.toLowerCase().includes(value);
        }
        if (attr === 'department' && item.department) {
          return item.department.toLowerCase().includes(value);
        }
      }
      
      // Fallback: search all fields
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(filterLower)
      );
    });
  };

  const renderActionButton = (entityId) => {
    if (activeTab === 'patient' || activeTab === 'physician') {
      return (
        <Button 
          size="xs" 
          variant="filled" 
          className="action-button"
          onClick={() => {
            window.location.href = `/reports?${activeTab}Id=${entityId}`;
          }}
        >
          View Health Reports
        </Button>
      );
    }
    return null;
  };

  const renderTableRows = () => {
    const data = ENTITY_DATA[activeTab] || [];
    const filteredData = filterData(data, appliedFilter);

    if (filteredData.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={headers.length} className="no-data">
            No data available for {activeTab} or filter is too restrictive.
          </Table.Td>
        </Table.Tr>
      );
    }

    return filteredData.map((item, index) => {
      switch (activeTab) {
        case 'patient':
          return (
            <Table.Tr key={item.id}>
              <Table.Td>{item.id}</Table.Td>
              <Table.Td className="name-cell">{item.name}</Table.Td>
              <Table.Td>{item.email}</Table.Td>
              <Table.Td>{item.dob}</Table.Td>
              <Table.Td className="blood-type">{item.bloodtype}</Table.Td>
              <Table.Td>{item.phone}</Table.Td>
              <Table.Td>{item.address}</Table.Td>
              <Table.Td>{renderActionButton(item.id)}</Table.Td>
            </Table.Tr>
          );
        
        case 'healthreport':
          return (
            <Table.Tr key={item.id}>
              <Table.Td>{item.id}</Table.Td>
              <Table.Td>{item.reportDate}</Table.Td>
              <Table.Td className="name-cell">{item.physician}</Table.Td>
              <Table.Td className="name-cell">{item.patient}</Table.Td>
              <Table.Td>{item.weight}</Table.Td>
              <Table.Td>{item.height}</Table.Td>
              <Table.Td>{renderActionButton(item.id)}</Table.Td>
            </Table.Tr>
          );
        
        case 'physician':
          return (
            <Table.Tr key={item.id}>
              <Table.Td>{item.id}</Table.Td>
              <Table.Td className="name-cell">{item.name}</Table.Td>
              <Table.Td>{item.email}</Table.Td>
              <Table.Td>{item.phone}</Table.Td>
              <Table.Td className="department">{item.department}</Table.Td>
              <Table.Td>{renderActionButton(item.id)}</Table.Td>
            </Table.Tr>
          );
        
        case 'workassignment':
          return (
            <Table.Tr key={index}>
              <Table.Td>{item.clinicId}</Table.Td>
              <Table.Td>{item.physicianId}</Table.Td>
              <Table.Td>{item.scheduleId}</Table.Td>
              <Table.Td>{item.dateJoined}</Table.Td>
              <Table.Td className="hourly-rate">{item.hourlyRate}</Table.Td>
            </Table.Tr>
          );
        
        case 'clinic':
          return (
            <Table.Tr key={item.id}>
              <Table.Td>{item.id}</Table.Td>
              <Table.Td className="name-cell">{item.name}</Table.Td>
              <Table.Td>{item.address}</Table.Td>
            </Table.Tr>
          );
        
        default:
          return null;
      }
    });
  };

  return (
    <div className="entity-table-container">
      <Table striped highlightOnHover withTableBorder withColumnBorders className="entity-table">
        <Table.Thead>
          <Table.Tr>
            {headers.map((header) => (
              <Table.Th key={header} className="table-header">{header}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {renderTableRows()}
        </Table.Tbody>
      </Table>
    </div>
  );
}