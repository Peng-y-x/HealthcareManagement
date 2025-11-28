import { useEffect, useMemo, useState } from "react";
import { Title, Table, Alert, Loader, Text, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconAlertCircle } from "@tabler/icons-react";
import "./Appointments.css";

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchText, setSearchText] = useState("");
    const [searchDate, setSearchDate] = useState(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch("/api/appointments", {
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    setError(data.error || "Failed to load appointments.");
                    setAppointments([]);
                    return;
                }

                setAppointments(data.data || []);
            } catch (err) {
                setError(err.message || "Network error while loading appointments.");
                setAppointments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString();
    };

    const formatTime = (value) => (value ? value.slice(0, 5) : "-");

    const filteredAppointments = useMemo(() => {
        const text = searchText.trim().toLowerCase();
        const dateStr = searchDate
            ? new Date(searchDate).toISOString().split("T")[0]
            : "";

        return appointments.filter((appt) => {
            const clinicMatch = appt.clinic_name?.toLowerCase().includes(text) || false;
            const physicianMatch = appt.physician_name?.toLowerCase().includes(text) || false;
            const textOk = text ? (clinicMatch || physicianMatch) : true;

            const apptDate = appt.AppointmentDate
                ? new Date(appt.AppointmentDate).toISOString().split("T")[0]
                : "";
            const dateOk = dateStr ? apptDate === dateStr : true;

            return textOk && dateOk;
        });
    }, [appointments, searchText, searchDate]);

    return (
        <div className="appointments-page">
            <Title className="page-title"> Appointments </Title>
            {error && (
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    color="red"
                    variant="light"
                    mb="md"
                >
                    {error}
                </Alert>
            )}
            

            {loading ? (
                <div className="appointments-loading">
                    <Loader size="lg" />
                    <Text c="dimmed" mt="sm">Loading your appointments...</Text>
                </div>
            ) : (
                <div className="table-section">
                    <div className="table-filter">
                        <TextInput
                            label="Search by physician or clinic"
                            placeholder="e.g., Dr. Amy or Downtown Health"
                            value={searchText}
                            onChange={(e) => setSearchText(e.currentTarget.value)}
                        />
                        <DateInput
                            label="Filter by date"
                            placeholder="Pick a date"
                            value={searchDate}
                            onChange={setSearchDate}
                            clearable
                        />
                    </div>
                    <Table striped highlightOnHover withTableBorder withColumnBorders className="entity-table">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Clinic Name</Table.Th>
                                <Table.Th>Physician Name</Table.Th>
                                <Table.Th>Appointment Date</Table.Th>
                                <Table.Th>Appointment Time</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredAppointments.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={4} className="no-data">
                                        No appointments found for your criteria.
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                filteredAppointments.map((appt) => (
                                    <Table.Tr key={appt.AppointmentID}>
                                        <Table.Td>{appt.clinic_name}</Table.Td>
                                        <Table.Td>{appt.physician_name}</Table.Td>
                                        <Table.Td>{formatDate(appt.AppointmentDate)}</Table.Td>
                                        <Table.Td>{formatTime(appt.AppointmentTime)}</Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </div>
            )}
        </div>
    );
}
