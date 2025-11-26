import { Title, TextInput, Button, Text } from "@mantine/core";
import { useState } from "react";
import EntityTable from "../../components/EntityTable/EntityTable";
import "./Appointments.css"

export default function Appointments() {
    const [filterQuery, setFilterQuery] = useState('');
    const [appliedFilter, setAppliedFilter] = useState('')
    const tableHeader = ['CLINIC ID', 'PHYSICIAN ID', 'SCHEDULE ID', 'DATE JOINED', 'HOURLY RATE'];

    const handleFilterSubmit = (event) => {
        event.preventDefault();
        setAppliedFilter(filterQuery);
    };

    const handleClearFilter = () => {
        setFilterQuery('');
        setAppliedFilter('');
    };

    return (
        <div className="appointments-page">
            <Title className="page-title"> Appointments </Title>
            <div className="filter-section">
                <form className="filter-form" onSubmit={handleFilterSubmit}>
                    <TextInput
                        placeholder="Filter by: Physician, Tom or Clinic, cl"
                        label="Filter Query"
                        description="Enter criteria as 'Attribute, Value' (e.g., 'Name, Tom') and press Enter or click search to filter results." 
                        value={filterQuery}
                        onChange={(event) => setFilterQuery(event.currentTarget.value)}
                        className="filter-input"
                    />
                    <div className="filter-buttons">
                        <Button type="submit" className="apply-buttons">
                            Apply Filter
                        </Button>
                        <Button className="clear-button" onClick={handleClearFilter}>
                            Clear Filter
                        </Button>
                    </div>
                </form>
            </div>

            <div className="filter-status">
                <Text className="filter-status-text">
                    {appliedFilter ? (
                        <>🔍 <strong>Active Filter:</strong> {appliedFilter} </>
                    ) : (
                        <>📊 <strong>Displaying all entries for:</strong> (No active filter)</>
                    )}
                </Text>
            </div>

            <div className="table-section">
                <EntityTable 
                    headers={tableHeader}
                    activeTab={'workassignment'}
                    appliedFilter={appliedFilter}
                />
            </div>
        </div>
    );
}