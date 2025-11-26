import { BrowserRouter, Routes, Route} from "react-router-dom"
import { AuthProvider } from "../context/AuthContext"
import NavBar from "../components/NavBar/NavBar"
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute"
import Home from "../pages/Home/Home"
import Login from "../pages/Login/Login"
import Register from "../pages/Register/Register"
import AppointmentBooking from "../pages/AppointmentBooking/AppointmentBooking"
import HealthReports from "../pages/HealthReports/HealthReports"
import DataFiltering from "../pages/DataFiltering/DataFiltering"
import Physicians from "../pages/Physicians/Physicians"
import Appointments from "../pages/Appointments/Appointments"

export default function AppRouter (){
    return (
        <BrowserRouter>
            <AuthProvider>
                <NavBar />
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/physicians" element={<Physicians/>}/>

                    {/* Protected Routes */}
                    <Route
                        path="/booking"
                        element={
                            <ProtectedRoute requirePatient>
                                <AppointmentBooking/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute requirePatient>
                                <HealthReports/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/appointments"
                        element={
                            <ProtectedRoute requirePatient>
                                <Appointments/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requirePhysician>
                                <DataFiltering/>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
