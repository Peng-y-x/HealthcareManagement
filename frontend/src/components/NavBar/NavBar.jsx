// Navigator component
import { NavLink } from "react-router-dom"
import "./NavBar.css"

export default function NavBar() {
    return (
        <nav className="navbar">
            <div className="logo">
                LIFE PATH
            </div>

            <ul className="nav-links">
                <li><NavLink to="/" className={({ isActive }) => (isActive ? "Active" : "")}>Home</NavLink></li>
                <li><NavLink to="/register" className={({ isActive }) => (isActive ? "Active" : "")}>Register</NavLink></li>
                <li><NavLink to="/physicians" className={({ isActive }) => (isActive ? "Active" : "")}>Physicians</NavLink></li>
                <li><NavLink to="/appointments" className={({ isActive }) => (isActive ? "Active" : "")}>Make Appointment</NavLink></li>
                <li><NavLink to="/reports" className={({ isActive }) => (isActive ? "Active" : "")}>Health Reports</NavLink></li>
            </ul>

            <button className="appointment-btn">Appointments</button>
        </nav>
    )
}