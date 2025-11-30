import { useState, useEffect, useRef } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./NavBar.css"

export default function NavBar() {
    const navigate = useNavigate()
    const { user, isAuthenticated, isPatient, isPhysician, isAdmin, logout } = useAuth()
    const [activeDropdown, setActiveDropdown] = useState(null)
    const navRef = useRef(null)

    const toggleDropdown = (dropdownName) => {
        setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName)
    }

    const closeDropdowns = () => {
        setActiveDropdown(null)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setActiveDropdown(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = async () => {
        await logout()
        navigate("/")
    }

    return (
        <nav className="navbar" ref={navRef}>
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

                {/*<li><NavLink to="/physicians" className={({ isActive }) => (isActive ? "Active" : "")}>Physicians</NavLink></li>*/}

                {isPatient && (
                    <>
                        <li className="dropdown">
                            <span 
                                className={`dropdown-btn ${activeDropdown === 'appointments' ? 'active' : ''}`}
                                onClick={() => toggleDropdown('appointments')}
                            >
                                Appointments ▼
                            </span>
                            {activeDropdown === 'appointments' && (
                                <div className="dropdown-menu">
                                    <NavLink to="/appointments" onClick={closeDropdowns}>View Appointments</NavLink>
                                    <NavLink to="/booking" onClick={closeDropdowns}>Make Appointment</NavLink>
                                </div>
                            )}
                        </li>

                        <li className="dropdown">
                            <span 
                                className={`dropdown-btn ${activeDropdown === 'medical' ? 'active' : ''}`}
                                onClick={() => toggleDropdown('medical')}
                            >
                                Medical Records ▼
                            </span>
                            {activeDropdown === 'medical' && (
                                <div className="dropdown-menu">
                                    <NavLink to="/reports" onClick={closeDropdowns}>Health Reports</NavLink>
                                    <NavLink to="/prescriptions" onClick={closeDropdowns}>Prescriptions</NavLink>
                                    <NavLink to="/billing" onClick={closeDropdowns}>Billing</NavLink>
                                    <NavLink to="/medical-history" onClick={closeDropdowns}>Medical History</NavLink>
                                </div>
                            )}
                        </li>
                    </>
                )}

                {(isPhysician || isAdmin) && (
                    <> 
                        <li><NavLink to="/admin" className={({ isActive }) => (isActive ? "Active" : "")}>Admin</NavLink></li>
                        {isPhysician && (<li className="dropdown">
                            <span 
                                className={`dropdown-btn ${activeDropdown === 'workspace' ? 'active' : ''}`}
                                onClick={() => toggleDropdown('workspace')}
                            >
                                Workspace ▼
                            </span>
                            {activeDropdown === 'workspace' && (
                                <div className="dropdown-menu">
                                    <NavLink to="/appointments" onClick={closeDropdowns}>Appointments</NavLink>
                                    <NavLink to="/reports" onClick={closeDropdowns}>Health Reports</NavLink>
                                </div>
                            )}
                        </li>)}
                    </>
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
