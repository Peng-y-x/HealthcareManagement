import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requirePatient, requirePhysician, allowPatientOrPhysician }) {
    const { isAuthenticated, isPatient, isPhysician, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requirePatient && !isPatient) {
        return <Navigate to="/" replace />;
    }

    if (requirePhysician && !isPhysician && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (allowPatientOrPhysician && !isPatient && !isPhysician) {
        return <Navigate to="/" replace />;
    }

    return children;
}
