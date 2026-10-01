import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./PlatformOverview.css";

function PlatformOverview() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState({
        total_clients: 0,
        total_freelancers: 0,
        total_projects: 0,
        open_projects: 0,
        completed_projects: 0,
        total_skills: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/auth/overview/"
                );

                setStats(response.data);

            } catch (error) {
                console.error(
                    "Unable to load platform overview:",
                    error
                );

                setError(
                    "Unable to load platform statistics."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    const handleContinue = () => {
        if (user?.role === "CLIENT") {
            navigate("/client/dashboard");
            return;
        }

        if (user?.role === "FREELANCER") {
            navigate("/freelancer/dashboard");
            return;
        }

        navigate("/login");
    };

    const statistics = [
        {
            key: "total_clients",
            icon: "👥",
            value: stats.total_clients,
            title: "Total Clients",
            description: "People looking for talent",
            className: "blue",
        },
        {
            key: "total_freelancers",
            icon: "💻",
            value: stats.total_freelancers,
            title: "Total Freelancers",
            description: "Professionals ready to work",
            className: "purple",
        },
        {
            key: "total_projects",
            icon: "📁",
            value: stats.total_projects,
            title: "Total Projects",
            description: "Projects on the platform",
            className: "orange",
        },
        {
            key: "open_projects",
            icon: "🎯",
            value: stats.open_projects,
            title: "Open Projects",
            description: "Currently accepting proposals",
            className: "green",
        },
        {
            key: "completed_projects",
            icon: "✓",
            value: stats.completed_projects,
            title: "Completed Projects",
            description: "Successfully completed",
            className: "pink",
        },
        {
            key: "total_skills",
            icon: "🛠",
            value: stats.total_skills,
            title: "Total Skills",
            description: "Skills available on the platform",
            className: "cyan",
        },
    ];

    return (
        <div className="overview-page">

            {/* Decorative background elements */}

            <div className="overview-shape overview-shape-one" />
            <div className="overview-shape overview-shape-two" />
            <div className="overview-shape overview-shape-three" />

            <div className="overview-wrapper">

                {/* ================================
                    TOP BAR
                ================================= */}

                <header className="overview-topbar">

                    <div className="overview-brand">

                        <div className="brand-mark">
                            FH
                        </div>

                        <div>
                            <div className="brand-name">
                                Freelance<span>Hub</span>
                            </div>

                            <div className="brand-tagline">
                                BUILD • CONNECT • GROW
                            </div>
                        </div>

                    </div>

                    <div className="overview-slogan">
                        <span>Great ideas</span>
                        <strong>happen together.</strong>
                    </div>

                </header>


                {/* ================================
                    HERO
                ================================= */}

                <section className="overview-hero">

                    <div className="hero-label">
                        <span />
                        PLATFORM OVERVIEW
                        <span />
                    </div>

                    <h1>
                        Welcome to{" "}
                        <span>FreelanceHub</span>
                    </h1>

                    <p>
                        Connect with talented professionals,
                        discover opportunities, and collaborate
                        on projects that turn ideas into reality.
                    </p>

                    <div className="hero-pills">

                        <div>
                            <span>✦</span>
                            Find Talent
                        </div>

                        <div>
                            <span>✦</span>
                            Find Projects
                        </div>

                        <div>
                            <span>✦</span>
                            Collaborate
                        </div>

                    </div>

                </section>


                {/* ================================
                    MAIN CONTENT
                ================================= */}

                <section className="overview-main">

                    {/* Left decorative panel */}

                    <div className="side-visual left-visual">

                        <div className="visual-text">
                            <strong>
                                For Clients
                            </strong>

                            <span>
                                Turn your ideas
                                into reality.
                            </span>
                        </div>

                        <div className="client-illustration">

                            <div className="person-head">
                                🙂
                            </div>

                            <div className="person-body client-body">
                                👨‍💻
                            </div>

                            <div className="laptop">
                                💻
                            </div>

                        </div>

                    </div>


                    {/* Statistics */}

                    <div className="statistics-section">

                        {loading ? (

                            <div className="overview-loading">
                                <div className="loading-spinner" />
                                <span>
                                    Loading platform statistics...
                                </span>
                            </div>

                        ) : error ? (

                            <div className="overview-error">
                                {error}
                            </div>

                        ) : (

                            <div className="statistics-grid">

                                {statistics.map((stat) => (

                                    <div
                                        key={stat.key}
                                        className={`stat-card ${stat.className}`}
                                    >

                                        <div className="stat-card-top">

                                            <div className="stat-icon">
                                                {stat.icon}
                                            </div>

                                            <div className="stat-content">

                                                <div className="stat-number">
                                                    {stat.value}
                                                </div>

                                                <div className="stat-title">
                                                    {stat.title}
                                                </div>

                                            </div>

                                        </div>

                                        <div className="stat-description">
                                            {stat.description}
                                        </div>

                                        <div className="stat-line" />

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>


                    {/* Right decorative panel */}

                    <div className="side-visual right-visual">

                        <div className="visual-text">
                            <strong>
                                For Freelancers
                            </strong>

                            <span>
                                Show your skills.
                                Find opportunities.
                            </span>
                        </div>

                        <div className="freelancer-illustration">

                            <div className="person-head">
                                😊
                            </div>

                            <div className="person-body freelancer-body">
                                👩‍💻
                            </div>

                            <div className="laptop">
                                💻
                            </div>

                        </div>

                    </div>

                </section>


                {/* ================================
                    QUOTE
                ================================= */}

                <div className="overview-quote">
                    “Connecting talent with opportunity,
                    one project at a time.”
                </div>


                {/* ================================
                    CONTINUE
                ================================= */}

                <section className="continue-section">

                    <button
                        className="continue-button"
                        onClick={handleContinue}
                        disabled={loading}
                    >

                        <span>
                            Continue
                        </span>

                        <span className="continue-arrow">
                            →
                        </span>

                    </button>

                    <p>
                        Let's get you to your dashboard
                    </p>

                </section>


                {/* ================================
                    BOTTOM FEATURES
                ================================= */}

                <section className="overview-features">

                    <div className="feature-item">

                        <div className="feature-icon">
                            🛡
                        </div>

                        <div>
                            <strong>
                                Safe & Secure
                            </strong>

                            <span>
                                Your data is protected
                            </span>
                        </div>

                    </div>


                    <div className="feature-divider" />


                    <div className="feature-item">

                        <div className="feature-icon">
                            👥
                        </div>

                        <div>
                            <strong>
                                Growing Community
                            </strong>

                            <span>
                                Clients and freelancers
                            </span>
                        </div>

                    </div>


                    <div className="feature-divider" />


                    <div className="feature-item">

                        <div className="feature-icon">
                            ⚡
                        </div>

                        <div>
                            <strong>
                                Real Opportunities
                            </strong>

                            <span>
                                Turn ideas into success
                            </span>
                        </div>

                    </div>


                    <div className="feature-divider" />


                    <div className="feature-item">

                        <div className="feature-icon">
                            ♥
                        </div>

                        <div>
                            <strong>
                                Built for Professionals
                            </strong>

                            <span>
                                Work, collaborate, grow
                            </span>
                        </div>

                    </div>

                </section>

            </div>
        </div>
    );
}

export default PlatformOverview;