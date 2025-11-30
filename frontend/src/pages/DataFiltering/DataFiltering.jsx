import React, { useState, useEffect } from 'react';
import { Tabs, TextInput, Button, Box, Title, Text, Group } from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EntityTable from '../../components/EntityTable/EntityTable';
import WorkAssignmentModal from '../../components/WorkAssignmentModal/WorkAssignmentModal';
import CreateClinicModal from '../../components/CreateClinicModal/CreateClinicModal';
import "./DataFiltering.css";

export default function DataFiltering() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAdmin } = useAuth();
    
    const [activeTab, setActiveTab] = useState('patient');
    const [filterQuery, setFilterQuery] = useState('');
    const [appliedFilter, setAppliedFilter] = useState('');
    const [workAssignmentModalOpen, setWorkAssignmentModalOpen] = useState(false);
    const [createClinicModalOpen, setCreateClinicModalOpen] = useState(false);
    const [tableKey, setTableKey] = useState(0);

    useEffect(() => {
        const table = searchParams.get('table');
        const filter = searchParams.get('filter');
        
        if (table) {
            setActiveTab(table);
        }
        
        if (filter) {
            const decodedFilter = decodeURIComponent(filter);
            setFilterQuery(decodedFilter);
            setAppliedFilter(decodedFilter);
        }
    }, [searchParams]);

    const updateURL = (newTable, newFilter) => {
        const params = new URLSearchParams();
        if (newTable) {
            params.set('table', newTable);
        }
        if (newFilter) {
            params.set('filter', newFilter);
        }
        setSearchParams(params);
    };

    const handleFilterSubmit = (event) => {
        event.preventDefault();
        setAppliedFilter(filterQuery);
        updateURL(activeTab, filterQuery);
    };

    const handleClearFilter = () => {
        setFilterQuery('');
        setAppliedFilter('');
        updateURL(activeTab, '');
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setFilterQuery('');
        setAppliedFilter('');
        updateURL(newTab, '');
    };

    const getTableHeaders = (tab) => {
        switch (tab) {
            case 'patient':
                return ['#', 'NAME', 'EMAIL', 'DOB', 'BLOOD TYPE', 'PHONE NUMBER', 'ADDRESS', 'ACTIONS'];
            case 'healthreport':
                return ['#', 'REPORT DATE', 'PHYSICIAN (ID)', 'PATIENT (ID)', 'WEIGHT', 'HEIGHT', 'PRESCRIPTIONS', 'ACTIONS'];
            case 'physician':
                return ['#', 'NAME', 'EMAIL', 'PHONE NUMBER', 'DEPARTMENT', 'ACTIONS'];
            case 'workassignment':
                return ['CLINIC ID', 'PHYSICIAN ID', 'SCHEDULE ID', 'WORKING DAYS', 'DATE JOINED', 'HOURLY RATE', 'ACTIONS'];
            case 'clinic':
                return ['#', 'NAME', 'ADDRESS'];
            case 'prescription':
                return ['#', 'HEALTH REPORT ID', 'DRUG NAME', 'DOSAGE', 'FREQUENCY', 'START DATE', 'END DATE', 'INSTRUCTIONS'];
            default:
                return [];
        }
    };

    const getFilterPlaceholder = (tab) => {
        switch (tab) {
            case 'patient':
                return 'Filter by: name, Tom; email, gmail OR name, Smith';
            case 'physician':
                return 'Filter by: name, Dr. Smith; department, Cardiology OR department, Neuro';
            case 'healthreport':
                return 'Filter by: patient, Tom H; physician, Dr. G OR patientId, 123 OR physicianId, 456';
            case 'clinic':
                return 'Filter by: name, Downtown; address, Medical OR name, Center';
            case 'workassignment':
                return 'Filter by: any field value';
            case 'prescription':
                return 'Filter by: id, 123; healthReportId, 456 OR drugName, Aspirin OR dosage, 250mg';
            default:
                return 'Enter filter criteria';
        }
    };

    return (
        <Box className="data-filtering-container">
            <div className="data-filtering">
                <Title order={1} className="page-title">🏥 Healthcare Data Management</Title>
                
                <Text className="page-description">
                    Search and filter healthcare data across different entity types. Use the tabs to switch between data categories and apply filters to find specific records.
                </Text>

                <div className="tabs-container">
                    <Tabs value={activeTab} onChange={handleTabChange} className="entity-tabs">
                        <Tabs.List>
                            <Tabs.Tab value="patient">👥 Patients</Tabs.Tab>
                            <Tabs.Tab value="healthreport">📋 Health Reports</Tabs.Tab>
                            <Tabs.Tab value="physician">👨‍⚕️ Physicians</Tabs.Tab>
                            <Tabs.Tab value="workassignment">📝 Work Assignments</Tabs.Tab>
                            <Tabs.Tab value="clinic">🏢 Clinics</Tabs.Tab>
                            <Tabs.Tab value="prescription">💊 Prescriptions</Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                </div>

                {activeTab === 'workassignment' && (
                    <Group mb="md" justify="flex-end">
                        <Button 
                            leftSection={<IconPlus size={16} />}
                            onClick={() => setWorkAssignmentModalOpen(true)}
                            disabled={!isAdmin}
                        >
                            Create Work Assignment
                        </Button>
                    </Group>
                )}

                {activeTab === 'clinic' && (
                    <Group mb="md" justify="flex-end">
                        <Button 
                            leftSection={<IconPlus size={16} />}
                            onClick={() => setCreateClinicModalOpen(true)}
                            disabled={!isAdmin}
                        >
                            Create Clinic
                        </Button>
                    </Group>
                )}

                <div className="filter-section">
                    <form onSubmit={handleFilterSubmit} className="filter-form">
                        <TextInput
                            placeholder={getFilterPlaceholder(activeTab)}
                            label="🔍 Search & Filter"
                            value={filterQuery}
                            onChange={(event) => setFilterQuery(event.currentTarget.value)}
                            rightSection={
                                <Button type="submit" size="sm" variant="subtle" className="search-button">
                                    <IconSearch size={16} />
                                </Button>
                            }
                            className="filter-input"
                            data-autofocus
                        />
                        
                        <div className="filter-buttons">
                            <Button type="submit" className="apply-filter-btn">
                                Apply Filter
                            </Button>
                            <Button variant="outline" onClick={handleClearFilter} className="clear-filter-btn">
                                Clear Filter
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="filter-status">
                    <Text className="filter-status-text">
                        {appliedFilter ? (
                            <>🔍 <strong>Active Filter:</strong> {appliedFilter} (in {activeTab})</>
                        ) : (
                            <>📊 <strong>Displaying all entries for:</strong> {activeTab} (No active filter)</>
                        )}
                    </Text>
                </div>


                <div className="table-section">
                    <Title order={2} className="table-title">
                        {activeTab === 'patient' && '👥 Patient Records'}
                        {activeTab === 'healthreport' && '📋 Health Reports'}
                        {activeTab === 'physician' && '👨‍⚕️ Physician Directory'}
                        {activeTab === 'workassignment' && '📝 Work Assignments'}
                        {activeTab === 'clinic' && '🏢 Clinic Locations'}
                        {activeTab === 'prescription' && '💊 Prescription Records'}
                    </Title>
                    
                    <EntityTable 
                        key={tableKey}
                        headers={getTableHeaders(activeTab)} 
                        activeTab={activeTab} 
                        appliedFilter={appliedFilter}
                        isAdmin={isAdmin}
                    />
                </div>
            </div>

            <WorkAssignmentModal
                opened={workAssignmentModalOpen}
                onClose={() => setWorkAssignmentModalOpen(false)}
                onSuccess={() => {
                    setTableKey(prev => prev + 1);
                    setWorkAssignmentModalOpen(false);
                }}
            />

            <CreateClinicModal
                opened={createClinicModalOpen}
                onClose={() => setCreateClinicModalOpen(false)}
                onSuccess={() => {
                    setTableKey(prev => prev + 1);
                    setCreateClinicModalOpen(false);
                }}
            />
        </Box>
    );
}