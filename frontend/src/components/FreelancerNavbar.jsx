import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./FreelancerNavbar.css";

function FreelancerNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => {
        if (path === "/freelancer/dashboard") {
            return location.pathname === path;
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <header className="freelancer-navbar">
            <div
                className="freelancer-navbar-logo"
                onClick={() => navigate("/freelancer/dashboard")}
            >
                FreelanceHub
            </div>

            <nav className="freelancer-navbar-nav">
                <button
                    className={isActive("/freelancer/dashboard") ? "active" : ""}
                    onClick={() => navigate("/freelancer/dashboard")}
                >
                    Dashboard
                </button>

                <button
                    className={isActive("/browse-projects") ? "active" : ""}
                    onClick={() => navigate("/browse-projects")}
                >
                    Browse Projects
                </button>

                <button
                    className={isActive("/projects/create") ? "active" : ""}
                    onClick={() => navigate("/projects/create")}
                >
                    Post Project
                </button>

                <button
                    className={isActive("/projects") ? "active" : ""}
                    onClick={() => navigate("/projects")}
                >
                    My Projects
                </button>

                <button
                    className={isActive("/proposals") ? "active" : ""}
                    onClick={() => navigate("/proposals")}
                >
                    My Proposals
                </button>

                <button
                    className={isActive("/invitations") ? "active" : ""}
                    onClick={() => navigate("/invitations")}
                >
                    Invitations
                </button>

                <button
                    className={isActive("/profile/freelancer") ? "active" : ""}
                    onClick={() => navigate("/profile/freelancer")}
                >
                    Profile
                </button>
            </nav>

            <div className="freelancer-navbar-user">
                <span>{user?.username}</span>
                <button
                    className="freelancer-navbar-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default FreelancerNavbar;
