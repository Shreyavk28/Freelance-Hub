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

    const [savingId, setSavingId] = useState(null);


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

                params.search =
                    search.trim();

            }

            const response = await api.get(
                "/profiles/freelancers/",
                {
                    params,
                }
            );

            setFreelancers(
                response.data
            );

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
    // SAVE / UNSAVE FREELANCER
    // =========================================================

    const handleSaveFreelancer = async (
        freelancer
    ) => {

        try {

            setSavingId(
                freelancer.id
            );

            if (freelancer.is_saved) {

                await api.delete(
                    `/profiles/saved-freelancers/${freelancer.id}/`
                );

            } else {

                await api.post(
                    `/profiles/saved-freelancers/${freelancer.id}/`
                );

            }

            setFreelancers(
                (currentFreelancers) =>
                    currentFreelancers.map(
                        (item) =>
                            item.id === freelancer.id
                                ? {
                                    ...item,
                                    is_saved:
                                        !item.is_saved,
                                }
                                : item
                    )
            );

        } catch (error) {

            console.error(
                "Save freelancer error:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Unable to update saved freelancer."
            );

        } finally {

            setSavingId(null);

        }
    };


    // =========================================================
    // LOCATIONS
    // =========================================================

    const locations = useMemo(() => {

        const locationList =
            freelancers
                .map(
                    (freelancer) =>
                        freelancer.location?.trim()
                )
                .filter(Boolean);

        return [
            ...new Set(locationList)
        ].sort();

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

        return freelancers.filter(
            (freelancer) => {

                // ---------------------------------------------
                // SKILL
                // ---------------------------------------------

                if (
                    skillSearch.trim()
                ) {

                    const searchSkill =
                        skillSearch
                            .trim()
                            .toLowerCase();

                    const hasMatchingSkill =
                        freelancer.skills?.some(
                            (skill) =>
                                skill.name
                                    ?.toLowerCase()
                                    .includes(
                                        searchSkill
                                    )
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

                const experience =
                    Number(
                        freelancer.experience_years ||
                        0
                    );


                if (
                    selectedExperience ===
                    "0-1"
                ) {

                    if (
                        experience < 0 ||
                        experience > 1
                    ) {

                        return false;

                    }

                }


                if (
                    selectedExperience ===
                    "2-3"
                ) {

                    if (
                        experience < 2 ||
                        experience > 3
                    ) {

                        return false;

                    }

                }


                if (
                    selectedExperience ===
                    "4-5"
                ) {

                    if (
                        experience < 4 ||
                        experience > 5
                    ) {

                        return false;

                    }

                }


                if (
                    selectedExperience ===
                    "6+"
                ) {

                    if (experience < 6) {

                        return false;

                    }

                }


                // ---------------------------------------------
                // HOURLY RATE
                // ---------------------------------------------

                const rate =
                    Number(
                        freelancer.hourly_rate ||
                        0
                    );


                if (
                    selectedRate ===
                    "0-499"
                ) {

                    if (rate >= 500) {

                        return false;

                    }

                }


                if (
                    selectedRate ===
                    "500-999"
                ) {

                    if (
                        rate < 500 ||
                        rate > 999
                    ) {

                        return false;

                    }

                }


                if (
                    selectedRate ===
                    "1000-1999"
                ) {

                    if (
                        rate < 1000 ||
                        rate > 1999
                    ) {

                        return false;

                    }

                }


                if (
                    selectedRate ===
                    "2000+"
                ) {

                    if (rate < 2000) {

                        return false;

                    }

                }


                return true;

            }
        );

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

        return `₹${Number(
            rate
        ).toLocaleString(
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
                        navigate(
                            "/client/dashboard"
                        )
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
                            navigate(
                                "/projects"
                            )
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
                    SEARCH
                ================================================= */}

{/* SEARCH */}
<div className="freelancer-search-card">
    <div className="freelancer-search-main">
        <label htmlFor="freelancer-search-input">
            Search Freelancers
        </label>

        <div className="freelancer-search-row">
            <input
                id="freelancer-search-input"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, skill or expertise..."
            />

            <button
                type="button"
                className={`freelancer-filter-button ${
                    showFilters ? "active" : ""
                }`}
                onClick={() => setShowFilters((previous) => !previous)}
                aria-expanded={showFilters}
                aria-controls="freelancer-filter-panel"
            >
                <span aria-hidden="true">☰</span>
                <span>Filters</span>

                {activeFilterCount > 0 && (
                    <span className="filter-count">
                        {activeFilterCount}
                    </span>
                )}

                <span className="filter-arrow" aria-hidden="true">
                    {showFilters ? "▲" : "▼"}
                </span>
            </button>
        </div>
    </div>

    {showFilters && (
        <div
            id="freelancer-filter-panel"
            className="freelancer-filter-panel"
        >
            <div className="freelancer-filter-group">
                <label htmlFor="freelancer-skill-filter">
                    Skill
                </label>

                <input
                    id="freelancer-skill-filter"
                    type="text"
                    value={skillSearch}
                    onChange={(event) =>
                        setSkillSearch(event.target.value)
                    }
                    placeholder="Search any skill..."
                />
            </div>

            <div className="freelancer-filter-group">
                <label htmlFor="freelancer-location-filter">
                    Location
                </label>

                <select
                    id="freelancer-location-filter"
                    value={selectedLocation}
                    onChange={(event) =>
                        setSelectedLocation(event.target.value)
                    }
                >
                    <option value="">All Locations</option>

                    {locations.map((location) => (
                        <option key={location} value={location}>
                            {location}
                        </option>
                    ))}
                </select>
            </div>

            <div className="freelancer-filter-group">
                <label htmlFor="freelancer-experience-filter">
                    Experience
                </label>

                <select
                    id="freelancer-experience-filter"
                    value={selectedExperience}
                    onChange={(event) =>
                        setSelectedExperience(event.target.value)
                    }
                >
                    <option value="">Any Experience</option>
                    <option value="0-1">0–1 years</option>
                    <option value="2-3">2–3 years</option>
                    <option value="4-5">4–5 years</option>
                    <option value="6+">6+ years</option>
                </select>
            </div>

            <div className="freelancer-filter-group">
                <label htmlFor="freelancer-rate-filter">
                    Hourly Rate
                </label>

                <select
                    id="freelancer-rate-filter"
                    value={selectedRate}
                    onChange={(event) =>
                        setSelectedRate(event.target.value)
                    }
                >
                    <option value="">Any Rate</option>
                    <option value="0-499">Below ₹500</option>
                    <option value="500-999">₹500–₹999</option>
                    <option value="1000-1999">₹1,000–₹1,999</option>
                    <option value="2000+">₹2,000+</option>
                </select>
            </div>

            <div className="freelancer-filter-footer">
                <span>
                    {activeFilterCount === 0
                        ? "No filters applied"
                        : `${activeFilterCount} filter${
                              activeFilterCount === 1 ? "" : "s"
                          } applied`}
                </span>

                <button
                    type="button"
                    className="clear-filters-button"
                    onClick={clearFilters}
                >
                    Clear Filters
                </button>
            </div>
        </div>
    )}
</div>



                {/* =================================================
                    RESULTS
                ================================================= */}

                <section className="freelancer-results-section">

                    <div className="freelancer-results-header">

                        <div>

                            <h2>
                                Available Freelancers
                            </h2>

                            <p>
                                {
                                    filteredFreelancers.length
                                } freelancers found
                            </p>

                        </div>

                    </div>


                    {error && (

                        <div className="freelancer-error">
                            {error}
                        </div>

                    )}


                    {loading ? (

                        <div className="freelancer-empty-state">

                            <h3>
                                Loading freelancers...
                            </h3>

                        </div>

                    ) : filteredFreelancers.length === 0 ? (

                        <div className="freelancer-empty-state">

                            <div className="empty-icon">
                                🔍
                            </div>

                            <h3>
                                No freelancers found
                            </h3>

                            <p>
                                Try changing your search
                                or filters.
                            </p>

                        </div>

                    ) : (

                        <div className="freelancer-grid">

                            {filteredFreelancers.map(
                                (freelancer) => (

                                    <article
                                        className="freelancer-card"
                                        key={freelancer.id}
                                    >

                                        {/* =================================
                                            TOP
                                        ================================= */}

                                        <div className="freelancer-card-top">

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

                                                    freelancer.username
                                                        ?.charAt(0)
                                                        .toUpperCase()

                                                )}

                                            </div>


                                            <div className="freelancer-identity">

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


                                        {/* =================================
                                            BIO
                                        ================================= */}

                                        <p className="freelancer-bio">

                                            {
                                                freelancer.bio ||
                                                "No biography available."
                                            }

                                        </p>


                                        {/* =================================
                                            META
                                        ================================= */}

                                        <div className="freelancer-meta">

                                            <span>
                                                📍{" "}
                                                {
                                                    freelancer.location ||
                                                    "Location not specified"
                                                }
                                            </span>


                                            <span>
                                                💼{" "}
                                                {
                                                    freelancer.experience_years
                                                }{" "}
                                                year
                                                {
                                                    Number(
                                                        freelancer.experience_years
                                                    ) !== 1
                                                        ? "s"
                                                        : ""
                                                }{" "}
                                                experience
                                            </span>

                                        </div>


                                        {/* =================================
                                            RATE
                                        ================================= */}

                                        <div className="freelancer-rate">

                                            <span>
                                                Hourly Rate
                                            </span>

                                            <strong>
                                                {
                                                    formatRate(
                                                        freelancer.hourly_rate
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        {/* =================================
                                            SKILLS
                                        ================================= */}

                                        <div className="freelancer-skills">

                                            {freelancer.skills
                                                ?.slice(0, 6)
                                                .map(
                                                    (skill) => (

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


                                        {/* =================================
                                            ACTIONS
                                        ================================= */}

                                        <div className="freelancer-card-actions">

                                            <button
                                                className={
                                                    freelancer.is_saved
                                                        ? "save-freelancer-button saved"
                                                        : "save-freelancer-button"
                                                }
                                                onClick={() =>
                                                    handleSaveFreelancer(
                                                        freelancer
                                                    )
                                                }
                                                disabled={
                                                    savingId ===
                                                    freelancer.id
                                                }
                                            >

                                                {savingId ===
                                                freelancer.id
                                                    ? "Saving..."
                                                    : freelancer.is_saved
                                                        ? "♥ Saved"
                                                        : "♡ Save"}

                                            </button>


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

                                    </article>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>

    );

}


export default FindFreelancers;