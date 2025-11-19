import HeroImg from "../../assets/hero.jpg";
import "./Hero.css"

export default function Hero() {
    return (
        <div className="hero">
            <img src={HeroImg} alt="doctor" className="hero-img"/>
            <p className="hero-text">
                We provide health care services in facilities across US.
            </p>

            <button className="service-btn">Our services</button>

        </div>
    );
}