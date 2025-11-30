import React, { useEffect, useMemo, useState } from "react";
import { Box, Title, Text, Alert, Loader, TextInput, Card, Group, Button, Badge, ActionIcon, Modal } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconAlertCircle, IconX, IconCalendar, IconClock, IconMapPin, IconUser } from "@tabler/icons-react";
import { useAuth } from '../../context/AuthContext';
import "./Appointments.css";

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchText, setSearchText] = useState("");
    const [searchDate, setSearchDate] = useState(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const { user, isPhysician } = useAuth();

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

    const isPastOrTodayAppointment = (appointmentDate) => {
        if (!appointmentDate) return false;
        
        const today = new Date();
        const apptDate = new Date(appointmentDate);
        
        // Compare just the dates (ignore time)
        const todayStr = today.toDateString();
        const apptDateStr = apptDate.toDateString();
        
        return apptDateStr <= todayStr; // Past or today = uncancelable
    };

    const handleCancelClick = (appointment) => {
        // Only restrict patients from cancelling past/today appointments
        // Physicians can delete any appointment (including past ones)
        if (!isPhysician && isPastOrTodayAppointment(appointment.AppointmentDate)) {
            return; // Don't allow patients to cancel today's or past appointments
        }
        setAppointmentToCancel(appointment);
        setCancelModalOpen(true);
    };

    const handleCancelConfirm = async () => {
        if (!appointmentToCancel) return;

        setCancelling(true);
        try {
            const response = await fetch(`/api/appointments/${appointmentToCancel.AppointmentID}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setAppointments(prev => prev.filter(appt => appt.AppointmentID !== appointmentToCancel.AppointmentID));
                setCancelModalOpen(false);
                setAppointmentToCancel(null);
            } else {
                setError(data.error || 'Failed to cancel appointment');
            }
        } catch (err) {
            setError('Network error while cancelling appointment');
        } finally {
            setCancelling(false);
        }
    };

    const filteredAppointments = useMemo(() => {
        const text = searchText.trim().toLowerCase();
        const dateStr = searchDate
            ? new Date(searchDate).toISOString().split("T")[0]
            : "";

        return appointments.filter((appt) => {
            const clinicMatch = appt.clinic_name?.toLowerCase().includes(text) || false;
            const physicianMatch = appt.physician_name?.toLowerCase().includes(text) || false;
            const patientMatch = appt.patient_name?.toLowerCase().includes(text) || false;
            const textOk = text ? (clinicMatch || physicianMatch || patientMatch) : true;

            const apptDate = appt.AppointmentDate
                ? new Date(appt.AppointmentDate).toISOString().split("T")[0]
                : "";
            const dateOk = dateStr ? apptDate === dateStr : true;

            return textOk && dateOk;
        });
    }, [appointments, searchText, searchDate]);

    return (
        <Box className="appointments-container">
            <div className="appointments">
                <Title order={1} className="page-title">
                    {isPhysician ? "📅 Patient Appointments" : "📅 My Appointments"}
                </Title>
                
                <Text className="page-description">
                    {isPhysician 
                        ? "View and manage appointments for your patients." 
                        : "View and manage your scheduled medical appointments."
                    }
                </Text>

                {error && (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        color="red"
                        variant="light"
                        mb="md"
                        className="error-notification"
                    >
                        {error}
                    </Alert>
                )}

                <div className="filter-section">
                    <Group grow>
                        <TextInput
                            label={`Search by ${isPhysician ? 'patient' : 'physician'} or clinic`}
                            placeholder={isPhysician ? "e.g., John Smith or Downtown Health" : "e.g., Dr. Amy or Downtown Health"}
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
                    </Group>
                </div>

                <div className="appointments-section">
                    <Title order={2} className="section-title">
                    📋 Your Appointments ({filteredAppointments.length})
                    </Title>

                    <div className="appointments-content">
                        {loading ? (
                            <div className="loading-state">
                                <Loader size="lg" />
                                <Text>Loading your appointments...</Text>
                            </div>
                        ) : filteredAppointments.length > 0 ? (
                            filteredAppointments.map((appt) => (
                                <Card key={appt.AppointmentID} shadow="sm" padding="lg" radius="md" withBorder>
                                    <Group justify="space-between" align="flex-start">
                                        <div style={{ flex: 1 }}>
                                            <Group mb="xs">
                                                <IconUser size={16} />
                                                <Text fw={500}>
                                                    {isPhysician ? `Patient: ${appt.patient_name}` : `Physician: ${appt.physician_name}`}
                                                </Text>
                                            </Group>
                                            
                                            <Group mb="xs">
                                                <IconMapPin size={16} />
                                                <div>
                                                    <Text size="sm">{appt.clinic_name}</Text>
                                                    <Text size="xs" c="dimmed">{appt.clinic_address}</Text>
                                                </div>
                                            </Group>
                                            
                                            <Group>
                                                <Group gap="xs">
                                                    <IconCalendar size={16} />
                                                    <Text size="sm">{formatDate(appt.AppointmentDate)}</Text>
                                                </Group>
                                                <Group gap="xs">
                                                    <IconClock size={16} />
                                                    <Text size="sm">{formatTime(appt.AppointmentTime)}</Text>
                                                </Group>
                                            </Group>
                                        </div>
                                        
                                        {(!isPastOrTodayAppointment(appt.AppointmentDate) || isPhysician) ? (
                                            <ActionIcon 
                                                color="red" 
                                                variant="light" 
                                                onClick={() => handleCancelClick(appt)}
                                                title="Cancel Appointment"
                                            >
                                                <IconX size={16}/>
                                            </ActionIcon>
                                        ) : (
                                            <Badge color="gray" variant="light">
                                                {isPastOrTodayAppointment(appt.AppointmentDate) && new Date(appt.AppointmentDate) < new Date().setHours(0,0,0,0) ? 'Past' : 'Today'}
                                            </Badge>
                                        )}
                                    </Group>
                                </Card>
                            ))
                        ) : (
                            <div className="empty-state">
                                <Text className="empty-title">📅 No appointments found</Text>
                                <Text className="empty-description">
                                    No appointments match your selected criteria. Try adjusting the filter or book a new appointment.
                                </Text>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                opened={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                title="Cancel Appointment"
            >
                <Text mb="lg">
                    Are you sure you want to cancel {isPhysician ? "this" : "your"} appointment 
                    {isPhysician 
                        ? ` for ${appointmentToCancel?.patient_name}` 
                        : ` with ${appointmentToCancel?.physician_name}`
                    } on {formatDate(appointmentToCancel?.AppointmentDate)} at {formatTime(appointmentToCancel?.AppointmentTime)}?
                </Text>
                
                <Group justify="flex-end">
                    <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
                        Keep Appointment
                    </Button>
                    <Button color="red" onClick={handleCancelConfirm} loading={cancelling}>
                        Cancel Appointment
                    </Button>
                </Group>
            </Modal>
        </Box>
    );
}
