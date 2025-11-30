import React, { useState, useEffect } from 'react';
import { Table, Button, Loader, Text, Group, ActionIcon, Modal } from '@mantine/core';
import { IconDownload, IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { generateHealthReportPDF } from '../../utils/pdfGenerator';
import EditWorkAssignmentModal from '../EditWorkAssignmentModal/EditWorkAssignmentModal';
import "./EntityTable.css";

export default function EntityTable({ headers, activeTab, appliedFilter, isAdmin }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedWorkAssignment, setSelectedWorkAssignment] = useState(null);
  const [workAssignmentToDelete, setWorkAssignmentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = `/api/data/${activeTab === 'healthreport' ? 'healthreports' : activeTab === 'workassignment' ? 'workassignments' : activeTab + 's'}`;
      
      if (activeTab === 'healthreport') {
        endpoint += '?include_prescription_ids=true';
      }
      
      
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
          if (attrLower === 'id') {
            return item.id && item.id.toString() === value;
          }
          if (attrLower === 'patientid' || attrLower === 'patient id') {
            return item.patientId && item.patientId.toString() === value;
          }
          if (attrLower === 'physicianid' || attrLower === 'physician id') {
            return item.physicianId && item.physicianId.toString() === value;
          }
          if (attrLower === 'patient') {
            // Search in both patient name and combined format "name (id)"
            const combinedPatient = `${item.patient} (${item.patientId})`.toLowerCase();
            return (item.patient && item.patient.toLowerCase().includes(valueLower)) ||
                   combinedPatient.includes(valueLower);
          }
          if (attrLower === 'physician') {
            // Search in both physician name and combined format "name (id)"
            const combinedPhysician = `${item.physician} (${item.physicianId})`.toLowerCase();
            return (item.physician && item.physician.toLowerCase().includes(valueLower)) ||
                   combinedPhysician.includes(valueLower);
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
        
        if (activeTab === 'prescription') {
          if (attrLower === 'id') {
            return item.id && item.id.toString() === value.toString();
          }
          if (attrLower === 'healthreportid' || attrLower === 'health report id') {
            return item.healthReportId && item.healthReportId.toString() === value.toString();
          }
          if (attrLower === 'drugname') {
            return item.drugName && item.drugName.toLowerCase().includes(valueLower);
          }
          if (attrLower === 'dosage') {
            return item.dosage && item.dosage.toLowerCase().includes(valueLower);
          }
          if (attrLower === 'frequency') {
            return item.frequency && item.frequency.toLowerCase().includes(valueLower);
          }
        }
        
        return Object.values(item).some(itemValue => 
          itemValue && itemValue.toString().toLowerCase().includes(valueLower)
        );
      });
    });
  };

  const handleDownloadPDF = async (reportId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/healthreports/${reportId}/download`, {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        await generateHealthReportPDF(result.data);
      } else {
        console.error('Failed to fetch report data:', result.error);
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
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
    
    if (activeTab === 'healthreport') {
      return (
        <ActionIcon
          size="md"
          variant="filled"
          color="blue"
          onClick={() => handleDownloadPDF(entityId)}
          title="Download PDF Report"
          className="action-button"
          data-action-icon="true"
        >
          <IconDownload size={18} />
        </ActionIcon>
      );
    }
    
    return null;
  };

  const renderWorkAssignmentActions = (item) => {
    return (
      <Group gap="xs">
        <ActionIcon
          size="sm"
          variant="filled"
          color="blue"
          onClick={() => handleEditWorkAssignment(item)}
          title="Edit Work Assignment"
          className="action-button"
          data-action-icon="true"
          disabled={!isAdmin}
        >
          <IconEdit size={16} />
        </ActionIcon>
        <ActionIcon
          size="sm"
          variant="filled"
          color="red"
          onClick={() => handleDeleteWorkAssignment(item)}
          title="Delete Work Assignment"
          className="action-button delete-button"
          data-action-icon="true"
          disabled={!isAdmin}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    );
  };

  const handleEditWorkAssignment = (item) => {
    setSelectedWorkAssignment(item);
    setEditModalOpen(true);
  };

  const handleDeleteWorkAssignment = (item) => {
    setWorkAssignmentToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workAssignmentToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/workassignment/delete?physicianId=${workAssignmentToDelete.physicianId}&clinicId=${workAssignmentToDelete.clinicId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchData();
        setDeleteModalOpen(false);
        setWorkAssignmentToDelete(null);
      } else {
        setError(result.error || 'Failed to delete work assignment');
      }
    } catch (error) {
      console.error('Error deleting work assignment:', error);
      setError('Failed to delete work assignment. Please try again.');
    } finally {
      setDeleting(false);
    }
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
              <Table.Td>{new Date(item.dob).toLocaleDateString()}</Table.Td>
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
              <Table.Td className="name-cell">{item.physician} ({item.physicianId})</Table.Td>
              <Table.Td className="name-cell">{item.patient} ({item.patientId})</Table.Td>
              <Table.Td>{item.weight}</Table.Td>
              <Table.Td>{item.height}</Table.Td>
              <Table.Td>
                {item.prescriptionIds && item.prescriptionIds.length > 0 ? (
                  item.prescriptionIds.map((id, index) => (
                    <span key={id}>
                      <Button
                        variant="subtle"
                        size="xs"
                        component="a"
                        href={`/admin?table=prescription&filter=id%2C${id}`}
                        target="_self"
                        style={{ textDecoration: 'underline', padding: '2px 4px' }}
                      >
                        {id}
                      </Button>
                      {index < item.prescriptionIds.length - 1 && ' '}
                    </span>
                  ))
                ) : (
                  'N/A'
                )}
              </Table.Td>
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
              <Table.Td>{item.workingDays}</Table.Td>
              <Table.Td>{item.dateJoined}</Table.Td>
              <Table.Td className="hourly-rate">{item.hourlyRate}</Table.Td>
              <Table.Td>{renderWorkAssignmentActions(item)}</Table.Td>
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
        
        case 'prescription':
          return (
            <Table.Tr key={item.id}>
              <Table.Td>{item.id || 'N/A'}</Table.Td>
              <Table.Td>
                {item.healthReportId ? (
                  <Button
                    variant="subtle"
                    size="xs"
                    component="a"
                    href={`/admin?table=healthreport&filter=id%2C${item.healthReportId}`}
                    target="_self"
                    style={{ textDecoration: 'underline', padding: '2px 4px' }}
                  >
                    {item.healthReportId}
                  </Button>
                ) : (
                  'N/A'
                )}
              </Table.Td>
              <Table.Td>{item.drugName || 'N/A'}</Table.Td>
              <Table.Td>{item.dosage || 'N/A'}</Table.Td>
              <Table.Td>{item.frequency || 'N/A'}</Table.Td>
              <Table.Td>{item.startDate || 'N/A'}</Table.Td>
              <Table.Td>{item.endDate || 'N/A'}</Table.Td>
              <Table.Td>{item.instructions || 'N/A'}</Table.Td>
            </Table.Tr>
          );
        
        default:
          return null;
      }
    });
  };

  return (
    <div className="entity-table-container">
      <div className="table-scroll-wrapper">
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

      <EditWorkAssignmentModal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          setEditModalOpen(false);
          fetchData();
        }}
        workAssignment={selectedWorkAssignment}
      />

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Work Assignment"
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete the work assignment for Physician {workAssignmentToDelete?.physicianId} at Clinic {workAssignmentToDelete?.clinicId}?
        </Text>
        <Text size="sm" c="dimmed" mb="lg">
          This will permanently remove both the work assignment and its associated schedule.
        </Text>
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Keep Assignment
          </Button>
          <Button color="red" onClick={handleDeleteConfirm} loading={deleting}>
            Delete Assignment
          </Button>
        </Group>
      </Modal>
    </div>
  );
}