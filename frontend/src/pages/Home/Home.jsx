import NavBar from "../../components/NavBar/NavBar";
import Hero from "../../components/Hero/Hero";
import About from "../../components/About/About";
import ServiceSection from "../../components/ServiceSection/ServiceSection"
import "./Home.css"

export default function home() {
    return (
        <div className="container">
            <NavBar />
            <Hero />
            <About />
            <ServiceSection/>
        </div>
    );
}