import React, { useState, useEffect } from 'react';
import { Table, Button, Loader, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import "./EntityTable.css";

export default function EntityTable({ headers, activeTab, appliedFilter }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = `/api/data/${activeTab === 'healthreport' ? 'healthreports' : activeTab === 'workassignment' ? 'workassignments' : activeTab + 's'}`;
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const filterData = (data, filter) => {
    if (!filter) return data;
    
    return data.filter(item => {
      const queries = filter.split(';').map(q => q.trim());
      
      return queries.every(query => {
        if (!query.includes(',')) {
          return Object.values(item).some(value => 
            value && value.toString().toLowerCase().includes(query.toLowerCase())
          );
        }
        
        const [attr, value] = query.split(',').map(s => s.trim());
        const attrLower = attr.toLowerCase();
        const valueLower = value.toLowerCase();
        
        if (activeTab === 'healthreport') {
          if (attrLower === 'patientid' || attrLower === 'patient id') {
            return item.patientId && item.patientId.toString() === value;
          }
          if (attrLower === 'physicianid' || attrLower === 'physician id') {
            return item.physicianId && item.physicianId.toString() === value;
          }
          if (attrLower === 'patient') {
            return item.patient && item.patient.toLowerCase().includes(valueLower);
          }
          if (attrLower === 'physician') {
            return item.physician && item.physician.toLowerCase().includes(valueLower);
          }
        }
        
        if (activeTab === 'patient') {
          if (attrLower === 'name') {
            return item.name && item.name.toLowerCase().includes(valueLower);
          }
          if (attrLower === 'email') {
            return item.email && item.email.toLowerCase().includes(valueLower);
          }
        }
        
        if (activeTab === 'physician') {
          if (attrLower === 'name') {
            return item.name && item.name.toLowerCase().includes(valueLower);
          }
          if (attrLower === 'department') {
            return item.department && item.department.toLowerCase().includes(valueLower);
          }
        }
        
        if (activeTab === 'clinic') {
          if (attrLower === 'name') {
            return item.name && item.name.toLowerCase().includes(valueLower);
          }
          if (attrLower === 'address') {
            return item.address && item.address.toLowerCase().includes(valueLower);
          }
        }
        
        return Object.values(item).some(itemValue => 
          itemValue && itemValue.toString().toLowerCase().includes(valueLower)
        );
      });
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
            const filterParam = `${activeTab}Id,${entityId}`;
            navigate(`/admin?table=healthreport&filter=${encodeURIComponent(filterParam)}`);
          }}
        >
          View Health Reports
        </Button>
      );
    }
    return null;
  };
  const renderTableRows = () => {
    if (loading) {
      return (
        <Table.Tr>
          <Table.Td colSpan={headers.length} style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader size="sm" />
            <Text mt="sm">Loading {activeTab} data...</Text>
          </Table.Td>
        </Table.Tr>
      );
    }

    if (error) {
      return (
        <Table.Tr>
          <Table.Td colSpan={headers.length} style={{ textAlign: 'center', padding: '2rem' }}>
            <Text color="red">Error: {error}</Text>
          </Table.Td>
        </Table.Tr>
      );
    }

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
              <Table.Td>{item.physicianId}</Table.Td>
              <Table.Td className="name-cell">{item.patient}</Table.Td>
              <Table.Td>{item.patientId}</Table.Td>
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