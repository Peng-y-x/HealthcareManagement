import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requirePatient, requirePhysician }) {
    const { isAuthenticated, isPatient, isPhysician, loading } = useAuth();

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

    if (requirePhysician && !isPhysician) {
        return <Navigate to="/" replace />;
    }

    return children;
}
