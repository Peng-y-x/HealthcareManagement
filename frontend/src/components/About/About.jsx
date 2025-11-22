import ValueCard from "../ValueCard/ValueCard"
import "./About.css"

export default function About() {
    return (
        <div className="About">
            <h2 className="about-title">
                About <span className="highlight"> Us</span>
            </h2>

            <div className="about-content">
                <div className="about-content-left">
                    <h3 className="about-header">
                        Building A Brighter <br /> Today and Tomorrow
                    </h3>

                    <p className="about-description">
                        LifePath is a smart healthcare management system that connects doctors and patients seamlessly.
                        It simplifies access to medical reports, organizes doctor schedules across clinics, and ensures
                        secure, efficient data sharing — empowering better care through technology.
                    </p>

                    <button className="physician-btn">
                        Meet Our Physicians
                    </button>
                </div>

                <div className="about-content-right">
                     <ValueCard
                        icon="🤝"
                        title="Compassion"
                        desc="We understand, respect, and continually promote sincere care for clients and families."
                    />
                    <ValueCard
                        icon="🤲"
                        title="Commitment"
                        desc="We maintain a relentless dedication to guide clients through their wellness journey."
                    />
                    <ValueCard
                        icon="💡"
                        title="Knowledge"
                        desc="We rely on science and data to improve the quality of our care delivery."
                    />
                    <ValueCard
                        icon="📘"
                        title="Research"
                        desc="We pursue continuous improvement, professional development, and impactful innovation."
                    />
                </div>
            </div>
        </div>
    );
}