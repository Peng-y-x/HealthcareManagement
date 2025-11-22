import React, { useState } from 'react';
import { Tabs, TextInput, Button, Box, Title, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import EntityTable from '../../components/EntityTable/EntityTable';
import "./DataFiltering.css";

export default function DataFiltering() {
    // State to track the active Category Tab (e.g., 'patient', 'physician')
    const [activeTab, setActiveTab] = useState('patient');
    // State to hold the filter input value (e.g., 'Name, Tom')
    const [filterQuery, setFilterQuery] = useState('');
    // State to hold the applied filter for table display
    const [appliedFilter, setAppliedFilter] = useState('');

    const handleFilterSubmit = (event) => {
        event.preventDefault();
        setAppliedFilter(filterQuery);
    };

    const handleClearFilter = () => {
        setFilterQuery('');
        setAppliedFilter('');
    };

    // --- Dynamically determine table headers based on the active tab ---
    const getTableHeaders = (tab) => {
        switch (tab) {
            case 'patient':
                return ['#', 'NAME', 'EMAIL', 'DOB', 'BLOOD TYPE', 'PHONE NUMBER', 'ADDRESS', 'Actions'];
            case 'healthreport':
                return ['#', 'REPORT DATE', 'PHYSICIAN', 'PATIENT', 'WEIGHT', 'HEIGHT', 'Actions'];
            case 'physician':
                return ['#', 'NAME', 'EMAIL', 'PHONE NUMBER', 'DEPARTMENT', 'Actions'];
            case 'workassignment':
                return ['CLINIC ID', 'PHYSICIAN ID', 'SCHEDULE ID', 'DATE JOINED', 'HOURLY RATE'];
            case 'clinic':
                return ['#', 'NAME', 'ADDRESS'];
            default:
                return [];
        }
    };

    const getFilterPlaceholder = (tab) => {
        switch (tab) {
            case 'patient':
                return 'Filter by: Name, Tom or Email, example@email.com';
            case 'physician':
                return 'Filter by: Name, Dr. Smith or Department, Cardiology';
            case 'healthreport':
                return 'Filter by: Patient, Tom or Physician, Dr. Smith';
            case 'clinic':
                return 'Filter by: Name, Downtown or Address, Medical Plaza';
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

                {/* --- Category Tabs --- */}
                <div className="tabs-container">
                    <Tabs value={activeTab} onChange={setActiveTab} className="entity-tabs">
                        <Tabs.List>
                            <Tabs.Tab value="patient">👥 Patients</Tabs.Tab>
                            <Tabs.Tab value="healthreport">📋 Health Reports</Tabs.Tab>
                            <Tabs.Tab value="physician">👨‍⚕️ Physicians</Tabs.Tab>
                            <Tabs.Tab value="workassignment">📝 Work Assignments</Tabs.Tab>
                            <Tabs.Tab value="clinic">🏢 Clinics</Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                </div>

                {/* --- Filter Bar --- */}
                <div className="filter-section">
                    <form onSubmit={handleFilterSubmit} className="filter-form">
                        <TextInput
                            placeholder={getFilterPlaceholder(activeTab)}
                            label="🔍 Search & Filter"
                            description="Enter criteria as 'Attribute, Value' (e.g., 'Name, Tom') and press Enter or click search to filter results."
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

                {/* --- Table of Entities --- */}
                <div className="table-section">
                    <Title order={2} className="table-title">
                        {activeTab === 'patient' && '👥 Patient Records'}
                        {activeTab === 'healthreport' && '📋 Health Reports'}
                        {activeTab === 'physician' && '👨‍⚕️ Physician Directory'}
                        {activeTab === 'workassignment' && '📝 Work Assignments'}
                        {activeTab === 'clinic' && '🏢 Clinic Locations'}
                    </Title>
                    
                    <EntityTable 
                        headers={getTableHeaders(activeTab)} 
                        activeTab={activeTab} 
                        appliedFilter={appliedFilter}
                    />
                </div>
            </div>
        </Box>
    );
}