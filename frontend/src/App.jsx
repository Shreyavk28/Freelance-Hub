import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";

// =========================================
// AUTHENTICATION
// =========================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// =========================================
// DASHBOARDS
// =========================================

import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";

// =========================================
// PROJECT PAGES
// =========================================

import MyProjects from "./pages/MyProjects";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import EditProject from "./pages/EditProject";

// =========================================
// FREELANCER PAGES
// =========================================

import FreelancerProfile from "./pages/FreelancerProfile";
import BrowseProjects from "./pages/BrowseProjects";
import MyProposals from "./pages/MyProposals";
import FindFreelancers from "./pages/FindFreelancers";
import FreelancerPublicProfile from "./pages/FreelancerPublicProfile";
import FreelancerInvitations from "./pages/FreelancerInvitations";
import ProjectWorkspace from "./pages/ProjectWorkspace";


// =====================================================
// GET CURRENT USER
// =====================================================

function getStoredUser() {
    try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        return JSON.parse(storedUser);

    } catch (error) {
        console.error(
            "Unable to read stored user:",
            error
        );

        return null;
    }
}


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({
    children,
    allowedRoles = [],
}) {
    const location = useLocation();

    const accessToken =
        localStorage.getItem("accessToken");

    const user = getStoredUser();


    // ---------------------------------------------
    // NOT LOGGED IN
    // ---------------------------------------------

    if (!accessToken || !user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }


    // ---------------------------------------------
    // ROLE NOT ALLOWED
    // ---------------------------------------------

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
    ) {

        if (user.role === "CLIENT") {
            return (
                <Navigate
                    to="/client/dashboard"
                    replace
                />
            );
        }


        if (user.role === "FREELANCER") {
            return (
                <Navigate
                    to="/freelancer/dashboard"
                    replace
                />
            );
        }


        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    return children;
}


// =====================================================
// APP
// =====================================================

function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* =========================================
                    DEFAULT ROUTE
                ========================================= */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />


                {/* =========================================
                    AUTHENTICATION
                ========================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* =========================================
                    CLIENT DASHBOARD
                ========================================= */}

                <Route
                    path="/client/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CLIENT"]}
                        >
                            <ClientDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    FREELANCER DASHBOARD
                ========================================= */}

                <Route
                    path="/freelancer/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["FREELANCER"]}
                        >
                            <FreelancerDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    FREELANCER PROFILE
                ========================================= */}

                <Route
                    path="/profile/freelancer"
                    element={
                        <ProtectedRoute
                            allowedRoles={["FREELANCER"]}
                        >
                            <FreelancerProfile />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    PUBLIC FREELANCER PROFILE
                ========================================= */}

                <Route
                    path="/freelancers/:freelancerId"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CLIENT"]}
                        >
                            <FreelancerPublicProfile />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    FREELANCER - BROWSE PROJECTS
                ========================================= */}

                <Route
                    path="/browse-projects"
                    element={
                        <ProtectedRoute
                            allowedRoles={["FREELANCER"]}
                        >
                            <BrowseProjects />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    FREELANCER - MY PROPOSALS
                ========================================= */}

                <Route
                    path="/proposals"
                    element={
                        <ProtectedRoute
                            allowedRoles={["FREELANCER"]}
                        >
                            <MyProposals />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    FREELANCER - INVITATIONS
                ========================================= */}

                <Route
                    path="/invitations"
                    element={
                        <ProtectedRoute
                            allowedRoles={["FREELANCER"]}
                        >
                            <FreelancerInvitations />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    PROJECT WORKSPACE
                ========================================= */}

                <Route
                    path="/workspace/:projectId"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "CLIENT",
                                "FREELANCER",
                            ]}
                        >
                            <ProjectWorkspace />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    MY PROJECTS
                    BOTH CLIENT AND FREELANCER
                ========================================= */}

                <Route
                    path="/projects"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "CLIENT",
                                "FREELANCER",
                            ]}
                        >
                            <MyProjects />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    CREATE PROJECT
                    BOTH CLIENT AND FREELANCER
                ========================================= */}

                <Route
                    path="/projects/create"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "CLIENT",
                                "FREELANCER",
                            ]}
                        >
                            <CreateProject />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    FIND FREELANCERS
                    CLIENT ONLY
                ========================================= */}

                <Route
                    path="/find-freelancers"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CLIENT"]}
                        >
                            <FindFreelancers />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    EDIT PROJECT
                    BOTH PROJECT OWNERS
                ========================================= */}

                <Route
                    path="/projects/:projectId/edit"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "CLIENT",
                                "FREELANCER",
                            ]}
                        >
                            <EditProject />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    PROJECT DETAIL
                    BOTH CLIENT AND FREELANCER
                ========================================= */}

                <Route
                    path="/projects/:projectId"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "CLIENT",
                                "FREELANCER",
                            ]}
                        >
                            <ProjectDetail />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    UNKNOWN ROUTE
                ========================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;