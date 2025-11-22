import React from 'react';
import { Box, Title, Text } from '@mantine/core';

export default function Register() {
    return (
        <Box p="xl" style={{ textAlign: 'center', minHeight: '400px' }}>
            <Title order={1} mb="lg">Patient Registration</Title>
            <Text size="lg" c="dimmed">
                Registration functionality coming soon...
            </Text>
            <Text mt="md">
                Please contact the hospital directly to register as a new patient.
            </Text>
        </Box>
    );
}