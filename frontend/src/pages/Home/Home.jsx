import Hero from "../../components/Hero/Hero";
import About from "../../components/About/About";
import ServiceSection from "../../components/ServiceSection/ServiceSection"
import "./Home.css"

export default function Home() {
    return (
        <div className="home-page">
            <Hero />
            <About />
            <ServiceSection/>
        </div>
    );
}