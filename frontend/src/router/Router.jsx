import { BrowserRouter, Routes, Route} from "react-router-dom"
import NavBar from "../components/NavBar/NavBar"
import Home from "../pages/Home/Home"
import AppointmentBooking from "../pages/AppointmentBooking/AppointmentBooking"
import HealthReports from "../pages/HealthReports/HealthReports"
import DataFiltering from "../pages/DataFiltering/DataFiltering"
import Register from "../pages/Register/Register"

export default function AppRouter (){
    return (
        <BrowserRouter>
            <NavBar />
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/appointments" element={<AppointmentBooking/>}/>
                <Route path="/reports" element={<HealthReports/>}/>
                <Route path="/physicians" element={<DataFiltering/>}/>
                <Route path="/admin" element={<DataFiltering/>}/>
                <Route path="/register" element={<Register/>}/>
            </Routes>
        </BrowserRouter>
    );
}