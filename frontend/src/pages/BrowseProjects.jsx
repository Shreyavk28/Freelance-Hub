import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import FreelancerNavbar from "../components/FreelancerNavbar";
import "./BrowseProjects.css";

function BrowseProjects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [selectedSkill, setSelectedSkill] =
        useState("");

    const [skills, setSkills] = useState([]);

    useEffect(() => {
        loadProjects();
        loadSkills();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/projects/"
            );

            setProjects(response.data);

        } catch (error) {
            console.error(
                "Browse projects error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                    "Unable to load projects."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadSkills = async () => {
        try {
            const response = await api.get(
                "/skills/"
            );

            setSkills(response.data);

        } catch (error) {
            console.error(
                "Skills loading error:",
                error
            );
        }
    };


    const handleSkillChange = async (event) => {
        const skillId = event.target.value;

        setSelectedSkill(skillId);

        try {
            setLoading(true);
            setError("");

            let url = "/projects/";

            if (skillId) {
                url += `?skill=${skillId}`;
            }

            const response = await api.get(url);

            setProjects(response.data);

        } catch (error) {
            console.error(
                "Project filtering error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                    "Unable to filter projects."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(
        (project) => {
            const searchText =
                search.toLowerCase().trim();

            if (!searchText) {
                return true;
            }

            return (
                project.title
                    ?.toLowerCase()
                    .includes(searchText) ||
                project.description
                    ?.toLowerCase()
                    .includes(searchText) ||
                project.required_skill_names?.some(
                    (skill) =>
                        skill
                            .toLowerCase()
                            .includes(searchText)
                )
            );
        }
    );

    return (
        <div className="browse-page">

            <FreelancerNavbar />

            {/* =========================================
                MAIN CONTENT
            ========================================= */}

            <main className="browse-container">

                {/* Header */}

                <section className="browse-header">

                    <div>

                        <p className="browse-label">
                            FIND YOUR NEXT PROJECT
                        </p>

                        <h1>
                            Browse Projects
                        </h1>

                        <p>
                            Discover projects that match
                            your skills and expertise.
                        </p>

                    </div>

                </section>


                {/* =========================================
                    SEARCH / FILTER
                ========================================= */}

                <section className="project-filters">

                    <div className="search-box">

                        <label htmlFor="project-search">
                            Search Projects
                        </label>

                        <input
                            id="project-search"
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search by project, description or skill..."
                        />

                    </div>


                    <div className="skill-filter">

                        <label htmlFor="skill-filter">
                            Filter by Skill
                        </label>

                        <select
                            id="skill-filter"
                            value={selectedSkill}
                            onChange={
                                handleSkillChange
                            }
                        >

                            <option value="">
                                All Skills
                            </option>

                            {skills.map(
                                (skill) => (

                                    <option
                                        key={skill.id}
                                        value={skill.id}
                                    >
                                        {skill.name}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                </section>


                {/* Error */}

                {error && (

                    <div className="browse-error">
                        {error}
                    </div>

                )}


                {/* =========================================
                    PROJECT COUNT
                ========================================= */}

                <div className="browse-results-header">

                    <div>

                        <h2>
                            Available Projects
                        </h2>

                        <p>
                            {filteredProjects.length}{" "}
                            project
                            {filteredProjects.length !==
                            1
                                ? "s"
                                : ""}{" "}
                            found
                        </p>

                    </div>

                </div>


                {/* =========================================
                    LOADING
                ========================================= */}

                {loading ? (

                    <div className="browse-empty">

                        <div className="loading-icon">
                            ⏳
                        </div>

                        <h3>
                            Loading projects...
                        </h3>

                        <p>
                            Please wait while we find
                            available projects.
                        </p>

                    </div>

                ) : filteredProjects.length === 0 ? (

                    /* =====================================
                       NO PROJECTS
                    ===================================== */

                    <div className="browse-empty">

                        <div className="empty-icon">
                            🔍
                        </div>

                        <h3>
                            No projects found
                        </h3>

                        <p>
                            Try changing your search or
                            skill filter.
                        </p>

                        {(search ||
                            selectedSkill) && (

                            <button
                                className="clear-filter-button"
                                onClick={() => {
                                    setSearch("");
                                    setSelectedSkill("");
                                    loadProjects();
                                }}
                            >
                                Clear Filters
                            </button>

                        )}

                    </div>

                ) : (

                    /* =====================================
                       PROJECT LIST
                    ===================================== */

                    <div className="browse-project-list">

                        {filteredProjects.map(
                            (project) => (

                                <article
                                    className="browse-project-card"
                                    key={project.id}
                                >

                                    {/* Main */}

                                    <div className="browse-project-main">

                                        <div className="browse-project-title">

                                            <h3>
                                                {
                                                    project.title
                                                }
                                            </h3>

                                            <span className="match-badge">
                                                {
                                                    project.skill_match_percentage
                                                }
                                                % Match
                                            </span>

                                        </div>


                                        <p className="browse-description">
                                            {
                                                project.description
                                            }
                                        </p>


                                        {/* Project Meta */}

                                        <div className="browse-meta">

                                            <span>
                                                <strong>
                                                    Budget:
                                                </strong>{" "}
                                                {
                                                    project.budget_type
                                                }
                                            </span>

                                            <span>
                                                <strong>
                                                    Amount:
                                                </strong>{" "}
                                                ₹
                                                {
                                                    project.budget_amount
                                                }
                                            </span>

                                            <span>
                                                <strong>
                                                    Deadline:
                                                </strong>{" "}
                                                {
                                                    project.deadline
                                                }
                                            </span>

                                            <span>
                                                <strong>
                                                    Priority:
                                                </strong>{" "}
                                                {
                                                    project.priority
                                                }
                                            </span>

                                        </div>


                                        {/* Skills */}

                                        <div className="browse-skills">

                                            {project.required_skill_names?.map(
                                                (skill) => (

                                                    <span
                                                        key={skill}
                                                        className="browse-skill"
                                                    >
                                                        {skill}
                                                    </span>

                                                )
                                            )}

                                        </div>

                                    </div>


                                    {/* Right */}

                                    <div className="browse-project-actions">

                                        <span className="open-badge">
                                            OPEN
                                        </span>


                                        <button
                                            className="view-project-button"
                                            onClick={() =>
                                                navigate(
                                                    `/projects/${project.id}`
                                                )
                                            }
                                        >
                                            View Project
                                        </button>

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                )}

            </main>

        </div>
    );
}

export default BrowseProjects;