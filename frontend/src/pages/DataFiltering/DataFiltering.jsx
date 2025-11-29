import React, { useState, useEffect } from 'react';
import { Tabs, TextInput, Button, Box, Title, Text, Switch, Group } from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import EntityTable from '../../components/EntityTable/EntityTable';
import WorkAssignmentModal from '../../components/WorkAssignmentModal/WorkAssignmentModal';
import CreateClinicModal from '../../components/CreateClinicModal/CreateClinicModal';
import "./DataFiltering.css";

export default function DataFiltering() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [activeTab, setActiveTab] = useState('patient');
    const [filterQuery, setFilterQuery] = useState('');
    const [appliedFilter, setAppliedFilter] = useState('');
    const [showPrescriptions, setShowPrescriptions] = useState(false);
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
                const baseHeaders = ['#', 'REPORT DATE', 'PHYSICIAN', 'PHYSICIAN ID', 'PATIENT', 'PATIENT ID', 'ACTIONS', 'WEIGHT', 'HEIGHT'];
                const prescriptionHeaders = ['PRESCRIPTION ID', 'DOSAGE', 'FREQUENCY', 'START DATE', 'END DATE', 'INSTRUCTIONS'];
                return showPrescriptions ? [...baseHeaders.slice(0, 9), ...prescriptionHeaders] : baseHeaders;
            case 'physician':
                return ['#', 'NAME', 'EMAIL', 'PHONE NUMBER', 'DEPARTMENT', 'ACTIONS'];
            case 'workassignment':
                return ['CLINIC ID', 'PHYSICIAN ID', 'SCHEDULE ID', 'WORKING DAYS', 'DATE JOINED', 'HOURLY RATE', 'ACTIONS'];
            case 'clinic':
                return ['#', 'NAME', 'ADDRESS'];
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
                        </Tabs.List>
                    </Tabs>
                </div>

                {activeTab === 'workassignment' && (
                    <Group mb="md" justify="flex-end">
                        <Button 
                            leftSection={<IconPlus size={16} />}
                            onClick={() => setWorkAssignmentModalOpen(true)}
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

                {activeTab === 'healthreport' && (
                    <Group mb="md" justify="flex-end">
                        <Switch
                            label="Show Prescriptions"
                            checked={showPrescriptions}
                            onChange={(event) => setShowPrescriptions(event.currentTarget.checked)}
                        />
                    </Group>
                )}

                <div className="table-section">
                    <Title order={2} className="table-title">
                        {activeTab === 'patient' && '👥 Patient Records'}
                        {activeTab === 'healthreport' && '📋 Health Reports'}
                        {activeTab === 'physician' && '👨‍⚕️ Physician Directory'}
                        {activeTab === 'workassignment' && '📝 Work Assignments'}
                        {activeTab === 'clinic' && '🏢 Clinic Locations'}
                    </Title>
                    
                    <EntityTable 
                        key={tableKey}
                        headers={getTableHeaders(activeTab)} 
                        activeTab={activeTab} 
                        appliedFilter={appliedFilter}
                        showPrescriptions={showPrescriptions}
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