import React, { useState, useEffect } from 'react';
import { Box, Title, Text, Loader, Notification, Table, Button, Badge } from '@mantine/core';
import { IconInfoCircle, IconCheck, IconCreditCard } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import "./Billing.css";

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payingBills, setPayingBills] = useState(new Set());
  const { user } = useAuth();

  const fetchBills = async () => {
    if (!user?.reference_id) {
      setError('Please log in to view your billing information.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/billing?patient_id=${user.reference_id}`, {
        credentials: 'include'
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        setBills(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch billing information.');
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to fetch billing information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (billingId) => {
    setPayingBills(prev => new Set(prev).add(billingId));
    
    try {
      const response = await fetch('/api/billing/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ BillingID: billingId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the bill status locally
        setBills(prevBills => 
          prevBills.map(bill => 
            bill.BillingID === billingId 
              ? { ...bill, PaymentStatus: 'Paid' }
              : bill
          )
        );
      } else {
        setError(data.error || 'Failed to process payment.');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setPayingBills(prev => {
        const newSet = new Set(prev);
        newSet.delete(billingId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchBills();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box className="billing-page">
      <Title order={1} className="page-title">💳 Billing & Payments</Title>
      
      <Text className="page-description">
        View and manage your medical bills and payment history.
      </Text>

      {error && (
        <Notification 
          icon={<IconInfoCircle size={18} />} 
          color="red" 
          title="Error"
          onClose={() => setError(null)}
          className="error-notification"
        >
          {error}
        </Notification>
      )}

      {loading ? (
        <div className="loading-state">
          <Loader size="lg" />
          <Text>Loading your billing information...</Text>
        </div>
      ) : (
        <div className="billing-section">
          <Title order={2} className="section-title">
            📋 Your Bills ({bills.length})
          </Title>

          {bills.length > 0 ? (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Bill ID</Table.Th>
                  <Table.Th>Appointment ID</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Bill Date</Table.Th>
                  <Table.Th>Due Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bills.map((bill) => (
                  <Table.Tr key={bill.BillingID}>
                    <Table.Td>{bill.BillingID}</Table.Td>
                    <Table.Td>{bill.AppointmentID}</Table.Td>
                    <Table.Td>{formatCurrency(bill.TotalAmount)}</Table.Td>
                    <Table.Td>{formatDate(bill.BillingDate)}</Table.Td>
                    <Table.Td>{formatDate(bill.DueDate)}</Table.Td>
                    <Table.Td>
                      <Badge 
                        color={bill.PaymentStatus === 'Paid' ? 'green' : 'red'}
                        variant="filled"
                      >
                        {bill.PaymentStatus || 'Unpaid'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {bill.PaymentStatus !== 'Paid' && (
                        <Button 
                          size="sm" 
                          leftSection={<IconCreditCard size={16} />}
                          onClick={() => handlePayBill(bill.BillingID)}
                          loading={payingBills.has(bill.BillingID)}
                          color="blue"
                        >
                          Pay Now
                        </Button>
                      )}
                      {bill.PaymentStatus === 'Paid' && (
                        <Badge color="green" leftSection={<IconCheck size={12} />}>
                          Paid
                        </Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <div className="empty-state">
              <Text className="empty-title">💳 No bills found</Text>
              <Text className="empty-description">
                You don't have any bills at this time.
              </Text>
            </div>
          )}
        </div>
      )}
    </Box>
  );
}