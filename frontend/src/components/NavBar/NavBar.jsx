import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./NavBar.css"

export default function NavBar() {
    const navigate = useNavigate()
    const { user, isAuthenticated, isPatient, isPhysician, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate("/")
    }

    return (
        <nav className="navbar">
            <div className="logo">
                LIFE PATH
            </div>

            <ul className="nav-links">
                <li><NavLink to="/" className={({ isActive }) => (isActive ? "Active" : "")}>Home</NavLink></li>

                {!isAuthenticated && (
                    <>
                        <li><NavLink to="/register" className={({ isActive }) => (isActive ? "Active" : "")}>Register</NavLink></li>
                        <li><NavLink to="/login" className={({ isActive }) => (isActive ? "Active" : "")}>Login</NavLink></li>
                    </>
                )}

                <li><NavLink to="/physicians" className={({ isActive }) => (isActive ? "Active" : "")}>Physicians</NavLink></li>

                {isPatient && (
                    <>
                        <li><NavLink to="/booking" className={({ isActive }) => (isActive ? "Active" : "")}>Make Appointment</NavLink></li>
                        <li><NavLink to="/reports" className={({ isActive }) => (isActive ? "Active" : "")}>Health Reports</NavLink></li>
                        <li><NavLink to="/appointments" className={({ isActive }) => (isActive ? "Active" : "")}>Appointments</NavLink></li>
                    </>
                )}

                {isPhysician && (
                    <li><NavLink to="/admin" className={({ isActive }) => (isActive ? "Active" : "")}>Admin</NavLink></li>
                )}
            </ul>

            {isAuthenticated ? (
                <div className="auth-section">
                    <span className="user-info">
                        {user?.email} ({user?.user_type})
                    </span>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <button className="appointment-btn" onClick={() => navigate("/login")}>Login</button>
            )}
        </nav>
    )
}
