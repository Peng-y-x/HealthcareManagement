import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Alert } from "@mantine/core"
import { IconAlertCircle, IconCheck } from "@tabler/icons-react"
import { useAuth } from "../../context/AuthContext"
import "./Register.css"

export default function Register() {
    const [userType, setUserType] = useState("patient");
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone_number: "",
        password: "",
        confirm: "",
        dob: "",
        address: "",
        blood_type: "",
        department: "",
        clinic_name: "",
        clinic_address: ""
    })
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { registerPatient, registerPhysician } = useAuth();

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({ ...prev, [name]: value}));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if(form.password !== form.confirm){
            setError("Two passwords are inconsistent!");
            return;
        }

        if(form.password.length < 8){
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            let result;
            if (userType === "patient") {
                result = await registerPatient({
                    name: form.name,
                    email: form.email,
                    phone_number: form.phone_number,
                    password: form.password,
                    dob: form.dob,
                    blood_type: form.blood_type,
                    address: form.address,
                });
            } else {
                result = await registerPhysician({
                    name: form.name,
                    email: form.email,
                    phone_number: form.phone_number,
                    password: form.password,
                    department: form.department,
                    clinic_name: form.clinic_name,
                    clinic_address: form.clinic_address
                });
            }

            if (result.success) {
                setSuccess("Registration successful! You can now login.");
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(result.error);
            }
        } catch(err){
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h2 className="register-title">Register</h2>

                <div className="user-type-selector">
                    <button
                        type="button"
                        className={`type-btn ${userType === 'patient' ? 'active' : ''}`}
                        onClick={() => setUserType('patient')}
                    >
                        Patient
                    </button>
                    <button
                        type="button"
                        className={`type-btn ${userType === 'physician' ? 'active' : ''}`}
                        onClick={() => setUserType('physician')}
                    >
                        Physician
                    </button>
                </div>

                <form className="register-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email"
                            type="email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            name="phone_number"
                            value={form.phone_number}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            type="tel"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Password (min 8 characters)"
                            type="password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            name="confirm"
                            value={form.confirm}
                            onChange={handleChange}
                            type="password"
                            placeholder="Confirm Password"
                            required
                        />
                    </div>

                    {userType === 'patient' ? (
                        <>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    name="dob"
                                    value={form.dob}
                                    onChange={handleChange}
                                    type="date"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Address"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Blood Type</label>
                                <select
                                    name="blood_type"
                                    value={form.blood_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Blood Type</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Department</label>
                                <input
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    placeholder="Department (e.g., Cardiology)"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Clinic Name</label>
                                <input 
                                    name="clinic_name" 
                                    value={form.clinic_name}
                                    onChange={handleChange}
                                    placeholder="clinic name"/>
                            </div>
                            <div className="form-group">
                                <label>Clinic Address</label>
                                <input
                                    name="clinic_address"
                                    value={form.clinic_address}
                                    onChange={handleChange}
                                    placeholder="clinic address"/>
                            </div>
                        </>
                    )}

                    {success && (
                        <Alert
                            icon={<IconCheck size={16} />}
                            color="green"
                            variant="light"
                            mb="sm"
                        >
                            {success}
                        </Alert>
                    )}

                    {error && (
                        <Alert
                            icon={<IconAlertCircle size={16} />}
                            color="red"
                            variant="light"
                            mb="sm"
                        >
                            {error}
                        </Alert>
                    )}

                    <div className="button-row">
                        <button className="btn register-btn" type="submit" disabled={loading}>
                            {loading ? "Registering..." : "Register"}
                        </button>
                        <Link to="/login">
                            <button className="btn login-btn" type="button">Login</button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
