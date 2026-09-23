import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./FindFreelancers.css";

function FindFreelancers() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [freelancers, setFreelancers] = useState([]);
    const [search, setSearch] = useState("");
    const [skillSearch, setSkillSearch] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedExperience, setSelectedExperience] = useState("");
    const [selectedRate, setSelectedRate] = useState("");

    const [showFilters, setShowFilters] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // LOAD FREELANCERS
    // =========================================================

    useEffect(() => {
        loadFreelancers();
    }, [search]);

    const loadFreelancers = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await api.get(
                "/profiles/freelancers/",
                {
                    params,
                }
            );

            setFreelancers(response.data);
        } catch (error) {
            console.error(
                "Freelancers loading error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                    "Unable to load freelancers."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOCATIONS
    // =========================================================

    const locations = useMemo(() => {
        const locationList = freelancers
            .map((freelancer) =>
                freelancer.location?.trim()
            )
            .filter(Boolean);

        return [...new Set(locationList)].sort();
    }, [freelancers]);

    // =========================================================
    // FILTER COUNT
    // =========================================================

    const activeFilterCount = [
        skillSearch,
        selectedLocation,
        selectedExperience,
        selectedRate,
    ].filter(Boolean).length;

    // =========================================================
    // CLIENT-SIDE FILTERING
    // =========================================================

    const filteredFreelancers = useMemo(() => {
        return freelancers.filter((freelancer) => {
            // ---------------------------------------------
            // MANUAL SKILL SEARCH
            // ---------------------------------------------

            if (skillSearch.trim()) {
                const searchSkill =
                    skillSearch.trim().toLowerCase();

                const hasMatchingSkill =
                    freelancer.skills?.some((skill) =>
                        skill.name
                            ?.toLowerCase()
                            .includes(searchSkill)
                    );

                if (!hasMatchingSkill) {
                    return false;
                }
            }

            // ---------------------------------------------
            // LOCATION
            // ---------------------------------------------

            if (selectedLocation) {
                const freelancerLocation =
                    freelancer.location
                        ?.trim()
                        .toLowerCase();

                if (
                    freelancerLocation !==
                    selectedLocation.toLowerCase()
                ) {
                    return false;
                }
            }

            // ---------------------------------------------
            // EXPERIENCE
            // ---------------------------------------------

            const experience = Number(
                freelancer.experience_years || 0
            );

            if (selectedExperience === "0-1") {
                if (experience < 0 || experience > 1) {
                    return false;
                }
            }

            if (selectedExperience === "2-3") {
                if (experience < 2 || experience > 3) {
                    return false;
                }
            }

            if (selectedExperience === "4-5") {
                if (experience < 4 || experience > 5) {
                    return false;
                }
            }

            if (selectedExperience === "6+") {
                if (experience < 6) {
                    return false;
                }
            }

            // ---------------------------------------------
            // HOURLY RATE
            // ---------------------------------------------

            const rate = Number(
                freelancer.hourly_rate || 0
            );

            if (selectedRate === "0-499") {
                if (rate >= 500) {
                    return false;
                }
            }

            if (selectedRate === "500-999") {
                if (rate < 500 || rate > 999) {
                    return false;
                }
            }

            if (selectedRate === "1000-1999") {
                if (rate < 1000 || rate > 1999) {
                    return false;
                }
            }

            if (selectedRate === "2000+") {
                if (rate < 2000) {
                    return false;
                }
            }

            return true;
        });
    }, [
        freelancers,
        skillSearch,
        selectedLocation,
        selectedExperience,
        selectedRate,
    ]);

    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const clearFilters = () => {
        setSkillSearch("");
        setSelectedLocation("");
        setSelectedExperience("");
        setSelectedRate("");
        setSearch("");
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // =========================================================
    // FORMAT RATE
    // =========================================================

    const formatRate = (rate) => {
        if (
            rate === null ||
            rate === undefined ||
            rate === ""
        ) {
            return "Not specified";
        }

        return `₹${Number(rate).toLocaleString(
            "en-IN"
        )}/hr`;
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="find-freelancers-page">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="find-freelancers-navbar">

                <div
                    className="find-freelancers-logo"
                    onClick={() =>
                        navigate("/client/dashboard")
                    }
                >
                    FreelanceHub
                </div>

                <nav className="find-freelancers-nav">

                    <button
                        onClick={() =>
                            navigate(
                                "/client/dashboard"
                            )
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate("/projects")
                        }
                    >
                        My Projects
                    </button>

                    <button className="active">
                        Find Freelancers
                    </button>

                </nav>

                <div className="find-freelancers-user">

                    <span>
                        {user?.username}
                    </span>

                    <button
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="find-freelancers-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="find-freelancers-header">

                    <div>

                        <div className="find-freelancers-label">
                            DISCOVER TALENT
                        </div>

                        <h1>
                            Find Freelancers
                        </h1>

                        <p>
                            Search for skilled freelancers
                            who can help you complete your
                            projects.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    SEARCH + FILTER BUTTON
                ================================================= */}

                <div className="freelancer-search-card">

                    <div className="freelancer-search-main">

                        <label>
                            Search Freelancers
                        </label>

                        <div className="freelancer-search-row">

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by name, skill or expertise..."
                            />

                            <button
                                type="button"
                                className={`freelancer-filter-button ${
                                    showFilters
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setShowFilters(
                                        !showFilters
                                    )
                                }
                            >
                                <span>☰</span>

                                Filters

                                {activeFilterCount > 0 && (
                                    <span className="filter-count">
                                        {activeFilterCount}
                                    </span>
                                )}

                                <span className="filter-arrow">
                                    {showFilters
                                        ? "▲"
                                        : "▼"}
                                </span>
                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        COLLAPSIBLE FILTERS
                    ================================================= */}

                    {showFilters && (

                        <div className="freelancer-filter-panel">

                            {/* SKILL */}

                            <div className="freelancer-filter-group">

                                <label>
                                    Skill
                                </label>

                                <input
                                    type="text"
                                    value={skillSearch}
                                    onChange={(event) =>
                                        setSkillSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search any skill..."
                                />

                            </div>


                            {/* LOCATION */}

                            <div className="freelancer-filter-group">

                                <label>
                                    Location
                                </label>

                                <select
                                    value={
                                        selectedLocation
                                    }
                                    onChange={(event) =>
                                        setSelectedLocation(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Locations
                                    </option>

                                    {locations.map(
                                        (location) => (
                                            <option
                                                key={
                                                    location
                                                }
                                                value={
                                                    location
                                                }
                                            >
                                                {location}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* EXPERIENCE */}

                            <div className="freelancer-filter-group">

                                <label>
                                    Experience
                                </label>

                                <select
                                    value={
                                        selectedExperience
                                    }
                                    onChange={(event) =>
                                        setSelectedExperience(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Any Experience
                                    </option>

                                    <option value="0-1">
                                        0 - 1 years
                                    </option>

                                    <option value="2-3">
                                        2 - 3 years
                                    </option>

                                    <option value="4-5">
                                        4 - 5 years
                                    </option>

                                    <option value="6+">
                                        6+ years
                                    </option>

                                </select>

                            </div>


                            {/* HOURLY RATE */}

                            <div className="freelancer-filter-group">

                                <label>
                                    Hourly Rate
                                </label>

                                <select
                                    value={
                                        selectedRate
                                    }
                                    onChange={(event) =>
                                        setSelectedRate(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Any Rate
                                    </option>

                                    <option value="0-499">
                                        Below ₹500/hr
                                    </option>

                                    <option value="500-999">
                                        ₹500 - ₹999/hr
                                    </option>

                                    <option value="1000-1999">
                                        ₹1,000 - ₹1,999/hr
                                    </option>

                                    <option value="2000+">
                                        ₹2,000+/hr
                                    </option>

                                </select>

                            </div>


                            {/* FILTER ACTIONS */}

                            <div className="freelancer-filter-actions">

                                <span>
                                    {activeFilterCount > 0
                                        ? `${activeFilterCount} filter${
                                              activeFilterCount !==
                                              1
                                                  ? "s"
                                                  : ""
                                          } applied`
                                        : "No filters selected"}
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        clearFilters
                                    }
                                    disabled={
                                        activeFilterCount ===
                                            0 &&
                                        !search
                                    }
                                >
                                    Clear Filters
                                </button>

                            </div>

                        </div>

                    )}

                </div>


                {/* =================================================
                    RESULTS HEADER
                ================================================= */}

                <div className="freelancer-results-header">

                    <div>

                        <h2>
                            Available Freelancers
                        </h2>

                        {!loading && (
                            <p>
                                {
                                    filteredFreelancers.length
                                }{" "}
                                freelancer
                                {filteredFreelancers.length !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                found
                            </p>
                        )}

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="freelancer-error">
                        {error}
                    </div>

                )}


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (

                    <div className="freelancer-loading">
                        Loading freelancers...
                    </div>

                ) : filteredFreelancers.length ===
                  0 ? (

                    <div className="freelancer-empty">

                        <div className="freelancer-empty-icon">
                            👤
                        </div>

                        <h2>
                            No freelancers found
                        </h2>

                        <p>
                            Try changing your search
                            or filters.
                        </p>

                        <button
                            type="button"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>

                    </div>

                ) : (

                    <div className="freelancer-grid">

                        {filteredFreelancers.map(
                            (freelancer) => (

                                <div
                                    className="freelancer-card"
                                    key={
                                        freelancer.id
                                    }
                                >

                                    {/* PROFILE HEADER */}

                                    <div className="freelancer-card-header">

                                        <div className="freelancer-avatar">

                                            {freelancer.profile_picture ? (

                                                <img
                                                    src={
                                                        freelancer.profile_picture
                                                    }
                                                    alt={
                                                        freelancer.username
                                                    }
                                                />

                                            ) : (

                                                <span>
                                                    {freelancer.username
                                                        ?.charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </span>

                                            )}

                                        </div>


                                        <div className="freelancer-card-identity">

                                            <h3>
                                                {
                                                    freelancer.username
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    freelancer.headline ||
                                                    "Freelancer"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    {/* BIO */}

                                    <p className="freelancer-bio">

                                        {freelancer.bio
                                            ? freelancer.bio
                                            : "No bio added yet."}

                                    </p>


                                    {/* LOCATION + EXPERIENCE */}

                                    <div className="freelancer-meta">

                                        <span>
                                            📍{" "}
                                            {freelancer.location ||
                                                "Location not specified"}
                                        </span>

                                        <span>
                                            💼{" "}
                                            {
                                                freelancer.experience_years
                                            }{" "}
                                            year
                                            {Number(
                                                freelancer.experience_years
                                            ) !== 1
                                                ? "s"
                                                : ""}{" "}
                                            experience
                                        </span>

                                    </div>


                                    {/* RATE */}

                                    <div className="freelancer-rate">

                                        <span>
                                            Hourly Rate
                                        </span>

                                        <strong>
                                            {formatRate(
                                                freelancer.hourly_rate
                                            )}
                                        </strong>

                                    </div>


                                    {/* SKILLS */}

                                    <div className="freelancer-skills">

                                        {freelancer.skills
                                            ?.slice(0, 6)
                                            .map(
                                                (
                                                    skill
                                                ) => (

                                                    <span
                                                        key={
                                                            skill.id
                                                        }
                                                    >
                                                        {
                                                            skill.name
                                                        }
                                                    </span>

                                                )
                                            )}

                                    </div>


                                    {/* VIEW PROFILE */}

                                    <button
                                        className="view-freelancer-button"
                                        onClick={() =>
                                            navigate(
                                                `/freelancers/${freelancer.id}`
                                            )
                                        }
                                    >
                                        View Profile
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}

            </main>

        </div>
    );
}

export default FindFreelancers;