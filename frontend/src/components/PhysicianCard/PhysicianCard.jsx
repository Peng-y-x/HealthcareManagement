import "./PhysicianCard.css"
import { useNavigate } from "react-router-dom";

export default function PhysicianCard({name, dept, clinic, cl_address}) {
    const navigate = useNavigate();
    return (
        <div className="physician-card">
            <label className="physician-name">{name}</label>
            <div className="physician-info">
                <label className="physician-dept">{dept}</label>
                <label className="clinic">{clinic}</label>
                <label className="clinic-address">{cl_address}</label>
            </div>
            <button className="book-btn" onClick={() => navigate("/booking")}>book</button>
        </div>
    );
}