import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Title, 
    Stepper, 
    Button, 
    Group, 
    Select, 
    TextInput, 
    NumberInput,
    Textarea,
    Card,
    Text,
    Table,
    ActionIcon,
    Alert
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconTrash, IconPlus, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import "./CreateHealthReport.css";

export default function CreateHealthReport() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Stepper state
    const [active, setActive] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Step 1: Health Report Data
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [reportDate, setReportDate] = useState(new Date());
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    // Step 2: Prescriptions
    const [prescriptions, setPrescriptions] = useState([]);
    const [currentPrescription, setCurrentPrescription] = useState({
        dosage: '',
        frequency: '',
        startDate: new Date(),
        endDate: new Date(),
        instructions: ''
    });

    // Fetch patients on component mount
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await fetch('/api/physician/patients', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setPatients(data.data.map(p => ({
                    value: p.PatientID.toString(),
                    label: p.PatientName
                })));
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setActive((current) => (current < 3 ? current + 1 : current));
        }
    };

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const validateCurrentStep = () => {
        if (active === 0) {
            if (!selectedPatient || !weight || !height) {
                setError('Please fill in all required fields');
                return false;
            }
        }
        setError(null);
        return true;
    };

    const addPrescription = () => {
        // Validate required fields
        if (!currentPrescription.dosage || !currentPrescription.frequency || !currentPrescription.instructions) {
            setError('Please fill in dosage, frequency, and instructions');
            return;
        }
        
        // Validate end date >= start date
        const startDate = new Date(currentPrescription.startDate);
        const endDate = new Date(currentPrescription.endDate);
        
        if (endDate < startDate) {
            setError('End date must be greater than or equal to start date');
            return;
        }
        
        // Clear any existing errors
        setError(null);
        
        setPrescriptions([...prescriptions, { ...currentPrescription, id: Date.now() }]);
        setCurrentPrescription({
            dosage: '',
            frequency: '',
            startDate: new Date(),
            endDate: new Date(),
            instructions: ''
        });
    };

    const removePrescription = (id) => {
        setPrescriptions(prescriptions.filter(p => p.id !== id));
    };

    const submitHealthReport = async () => {
        setLoading(true);
        try {
            const healthReportData = {
                patientId: selectedPatient,
                reportDate: new Date(reportDate).toISOString().split('T')[0],
                weight: parseFloat(weight),
                height: parseFloat(height),
                prescriptions: prescriptions.map(p => ({
                    dosage: p.dosage,
                    frequency: p.frequency,
                    startDate: new Date(p.startDate).toISOString().split('T')[0],
                    endDate: new Date(p.endDate).toISOString().split('T')[0],
                    instructions: p.instructions
                }))
            };

            console.log('Submitting health report data:', healthReportData);

            const response = await fetch('/api/healthreports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(healthReportData)
            });

            const result = await response.json();
            
            if (result.success) {
                navigate('/reports');
            } else {
                setError(result.error || 'Failed to create health report');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setError(`Network error while creating health report: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getSelectedPatientName = () => {
        const patient = patients.find(p => p.value === selectedPatient);
        return patient ? patient.label : '';
    };

    return (
        <Box className="create-health-report-container">
            <div className="create-health-report">
                <Title order={1} className="page-title">📋 Create Health Report</Title>
                
                <Text className="page-description">
                    Create a comprehensive health report for your patient in 3 simple steps.
                </Text>

                <Stepper active={active} breakpoint="sm" className="stepper">
                    <Stepper.Step label="Health Report" description="Patient details and vitals">
                        <Card shadow="sm" padding="lg" className="step-card">
                            <Title order={3} mb="md">Patient Selection & Vital Information</Title>
                            
                            <Select
                                label="Select Patient"
                                placeholder="Choose a patient"
                                data={patients}
                                value={selectedPatient}
                                onChange={setSelectedPatient}
                                searchable
                                required
                                mb="md"
                            />

                            <DateInput
                                label="Report Date"
                                value={reportDate}
                                onChange={setReportDate}
                                required
                                mb="md"
                            />

                            <Group grow mb="md">
                                <NumberInput
                                    label="Weight (kg)"
                                    placeholder="Enter weight"
                                    value={weight}
                                    onChange={setWeight}
                                    min={0}
                                    max={500}
                                    decimalScale={1}
                                    required
                                />
                                <NumberInput
                                    label="Height (cm)"
                                    placeholder="Enter height"
                                    value={height}
                                    onChange={setHeight}
                                    min={0}
                                    max={300}
                                    decimalScale={1}
                                    required
                                />
                            </Group>
                        </Card>
                    </Stepper.Step>

                    <Stepper.Step label="Prescriptions" description="Add medications (optional)">
                        <Card shadow="sm" padding="lg" className="step-card">
                            <Title order={3} mb="md">Prescription Management</Title>
                            
                            <Text mb="md" c="dimmed">
                                Add prescriptions for this patient (optional). You can add multiple prescriptions.
                            </Text>

                            <Card withBorder padding="md" mb="md" className="prescription-form">
                                <Title order={4} mb="md">Add New Prescription</Title>
                                
                                <Group grow mb="md">
                                    <TextInput
                                        label="Dosage"
                                        placeholder="e.g., 250mg"
                                        value={currentPrescription.dosage}
                                        onChange={(e) => setCurrentPrescription({
                                            ...currentPrescription,
                                            dosage: e.target.value
                                        })}
                                    />
                                    <TextInput
                                        label="Frequency"
                                        placeholder="e.g., 2/day"
                                        value={currentPrescription.frequency}
                                        onChange={(e) => setCurrentPrescription({
                                            ...currentPrescription,
                                            frequency: e.target.value
                                        })}
                                    />
                                </Group>

                                <Group grow mb="md">
                                    <DateInput
                                        label="Start Date"
                                        value={currentPrescription.startDate}
                                        onChange={(date) => setCurrentPrescription({
                                            ...currentPrescription,
                                            startDate: date
                                        })}
                                    />
                                    <DateInput
                                        label="End Date"
                                        value={currentPrescription.endDate}
                                        onChange={(date) => setCurrentPrescription({
                                            ...currentPrescription,
                                            endDate: date
                                        })}
                                    />
                                </Group>

                                <Textarea
                                    label="Instructions"
                                    placeholder="Special instructions for the patient"
                                    value={currentPrescription.instructions}
                                    onChange={(e) => setCurrentPrescription({
                                        ...currentPrescription,
                                        instructions: e.target.value
                                    })}
                                    mb="md"
                                />

                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    onClick={addPrescription}
                                    disabled={!currentPrescription.dosage || !currentPrescription.frequency || !currentPrescription.instructions}
                                >
                                    Add Prescription
                                </Button>
                            </Card>

                            {prescriptions.length > 0 && (
                                <Card withBorder padding="md" className="prescriptions-list">
                                    <Title order={4} mb="md">Added Prescriptions ({prescriptions.length})</Title>
                                    <Table striped highlightOnHover>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Dosage</Table.Th>
                                                <Table.Th>Frequency</Table.Th>
                                                <Table.Th>Duration</Table.Th>
                                                <Table.Th>Instructions</Table.Th>
                                                <Table.Th>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {prescriptions.map((prescription) => (
                                                <Table.Tr key={prescription.id}>
                                                    <Table.Td>{prescription.dosage}</Table.Td>
                                                    <Table.Td>{prescription.frequency}</Table.Td>
                                                    <Table.Td>
                                                        {prescription.startDate ? new Date(prescription.startDate).toLocaleDateString() : 'N/A'} - {prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'N/A'}
                                                    </Table.Td>
                                                    <Table.Td>{prescription.instructions}</Table.Td>
                                                    <Table.Td>
                                                        <ActionIcon
                                                            color="red"
                                                            onClick={() => removePrescription(prescription.id)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Card>
                            )}
                        </Card>
                    </Stepper.Step>

                    <Stepper.Step label="Review" description="Confirm and submit">
                        <Card shadow="sm" padding="lg" className="step-card">
                            <Title order={3} mb="md">Review Health Report</Title>
                            
                            <Text mb="md" c="dimmed">
                                Please review all the information below before submitting the health report.
                            </Text>

                            <Card withBorder padding="md" mb="md">
                                <Title order={4} mb="md">Patient Information</Title>
                                <Group>
                                    <Text><strong>Patient:</strong> {getSelectedPatientName()}</Text>
                                    <Text><strong>Report Date:</strong> {reportDate ? new Date(reportDate).toLocaleDateString() : 'N/A'}</Text>
                                </Group>
                            </Card>

                            <Card withBorder padding="md" mb="md">
                                <Title order={4} mb="md">Vital Signs</Title>
                                <Group>
                                    <Text><strong>Weight:</strong> {weight} kg</Text>
                                    <Text><strong>Height:</strong> {height} cm</Text>
                                    <Text><strong>BMI:</strong> {weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(1) : 'N/A'}</Text>
                                </Group>
                            </Card>

                            <Card withBorder padding="md" mb="md">
                                <Title order={4} mb="md">Prescriptions ({prescriptions.length})</Title>
                                {prescriptions.length > 0 ? (
                                    <Table>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Dosage</Table.Th>
                                                <Table.Th>Frequency</Table.Th>
                                                <Table.Th>Duration</Table.Th>
                                                <Table.Th>Instructions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {prescriptions.map((prescription) => (
                                                <Table.Tr key={prescription.id}>
                                                    <Table.Td>{prescription.dosage}</Table.Td>
                                                    <Table.Td>{prescription.frequency}</Table.Td>
                                                    <Table.Td>
                                                        {prescription.startDate ? new Date(prescription.startDate).toLocaleDateString() : 'N/A'} - {prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'N/A'}
                                                    </Table.Td>
                                                    <Table.Td>{prescription.instructions}</Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                ) : (
                                    <Text c="dimmed">No prescriptions added</Text>
                                )}
                            </Card>
                        </Card>
                    </Stepper.Step>
                </Stepper>

                {error && (
                    <Alert color="red" mt="md">
                        {error}
                    </Alert>
                )}

                <Group justify="space-between" mt="xl">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={active === 0}
                        leftSection={<IconArrowLeft size={16} />}
                    >
                        Previous
                    </Button>

                    {active === 2 ? (
                        <Button
                            onClick={submitHealthReport}
                            loading={loading}
                            leftSection={<IconCheck size={16} />}
                        >
                            Create Health Report
                        </Button>
                    ) : (
                        <Button onClick={nextStep}>
                            Next
                        </Button>
                    )}
                </Group>
            </div>
        </Box>
    );
}