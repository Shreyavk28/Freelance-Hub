import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import FreelancerNavbar from "../components/FreelancerNavbar";
import "./FreelancerProfile.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function FreelancerProfile() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        username: "",
        bio: "",
        headline: "",
        location: "",
        experience_years: 0,
        hourly_rate: 0,
        profile_picture: "",
    });

    const [mySkills, setMySkills] = useState([]);

    const [newSkill, setNewSkill] = useState("");

    const [selectedPhoto, setSelectedPhoto] =
        useState(null);

    const [photoPreview, setPhotoPreview] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [addingSkill, setAddingSkill] =
        useState(false);
    const [removingPhoto, setRemovingPhoto] =
        useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    /*
    ==================================================
    LOAD PROFILE
    ==================================================
    */

    useEffect(() => {
        loadProfile();

        return () => {
            if (photoPreview) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, []);


    /*
    ==================================================
    PROFILE IMAGE URL
    ==================================================
    */

    const getProfileImageUrl = (imagePath) => {
        if (!imagePath) {
            return "";
        }

        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
        ) {
            return imagePath;
        }

        return `${API_BASE_URL}${imagePath}`;
    };


    /*
    ==================================================
    LOAD PROFILE DATA
    ==================================================
    */

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                profileResponse,
                skillsResponse,
            ] = await Promise.all([
                api.get("/profiles/freelancer/"),
                api.get("/skills/freelancer/"),
            ]);

            const data = profileResponse.data;

            setProfile({
                username:
                    data.username ||
                    user?.username ||
                    "Freelancer",

                bio: data.bio || "",

                headline:
                    data.headline || "",

                location:
                    data.location || "",

                experience_years:
                    data.experience_years ?? 0,

                hourly_rate:
                    data.hourly_rate ?? 0,

                profile_picture:
                    data.profile_picture || "",
            });

            setMySkills(skillsResponse.data);

        } catch (error) {
            console.error(
                "Error loading freelancer profile:",
                error
            );

            setError(
                error.response?.data?.detail ||
                    "Unable to load your profile."
            );
        } finally {
            setLoading(false);
        }
    };


    /*
    ==================================================
    INPUT CHANGE
    ==================================================
    */

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    /*
    ==================================================
    PHOTO CHANGE
    ==================================================
    */

    const handlePhotoChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid image file."
            );

            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(
                "Profile photo must be less than 5 MB."
            );

            event.target.value = "";
            return;
        }

        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }

        const previewUrl =
            URL.createObjectURL(file);

        setSelectedPhoto(file);
        setPhotoPreview(previewUrl);

        setMessage("");
        setError("");

        event.target.value = "";
    };


    /*
    ==================================================
    REMOVE PHOTO
    ==================================================
    */

    const handleRemovePhoto = async () => {
        if (!profile.profile_picture) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to remove your profile photo?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setRemovingPhoto(true);
            setMessage("");
            setError("");

            await api.delete(
                "/profiles/freelancer/photo/"
            );

            setProfile((previous) => ({
                ...previous,
                profile_picture: "",
            }));

            if (photoPreview) {
                URL.revokeObjectURL(photoPreview);
                setPhotoPreview("");
            }

            setSelectedPhoto(null);

            setMessage(
                "Profile photo removed successfully."
            );

        } catch (error) {
            console.error(
                "Error removing profile photo:",
                error
            );

            setError(
                error.response?.data?.detail ||
                    "Unable to remove profile photo."
            );

        } finally {
            setRemovingPhoto(false);
        }
    };


    /*
    ==================================================
    SAVE PROFILE
    ==================================================
    */

    const handleSaveProfile = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setMessage("");
            setError("");

            const formData = new FormData();

            formData.append(
                "bio",
                profile.bio
            );

            formData.append(
                "headline",
                profile.headline
            );

            formData.append(
                "location",
                profile.location
            );

            formData.append(
                "experience_years",
                Number(
                    profile.experience_years
                )
            );

            formData.append(
                "hourly_rate",
                Number(
                    profile.hourly_rate
                )
            );

            if (selectedPhoto) {
                formData.append(
                    "profile_picture",
                    selectedPhoto
                );
            }

            const response = await api.put(
                "/profiles/freelancer/",
                formData
            );

            const data = response.data;

            setProfile({
                username:
                    data.username ||
                    profile.username ||
                    user?.username ||
                    "Freelancer",

                bio: data.bio || "",

                headline:
                    data.headline || "",

                location:
                    data.location || "",

                experience_years:
                    data.experience_years ?? 0,

                hourly_rate:
                    data.hourly_rate ?? 0,

                profile_picture:
                    data.profile_picture || "",
            });

            if (photoPreview) {
                URL.revokeObjectURL(photoPreview);
                setPhotoPreview("");
            }

            setSelectedPhoto(null);

            setIsEditing(false);

            setMessage(
                "Profile updated successfully."
            );

        } catch (error) {
            console.error(
                "Error saving profile:",
                error
            );

            setError(
                error.response?.data?.detail ||
                    "Unable to update profile."
            );

        } finally {
            setSaving(false);
        }
    };


    /*
    ==================================================
    ADD SKILL
    ==================================================
    */

    const handleAddSkill = async () => {
        const skillName =
            newSkill.trim();

        if (!skillName) {
            return;
        }

        try {
            setAddingSkill(true);
            setMessage("");
            setError("");

            const response = await api.post(
                "/skills/freelancer/",
                {
                    new_skill_name:
                        skillName,
                }
            );

            setMySkills((previous) => [
                ...previous,
                response.data,
            ]);

            setNewSkill("");

            setMessage(
                `${skillName} added successfully.`
            );

        } catch (error) {
            console.error(
                "Error adding skill:",
                error
            );

            setError(
                error.response?.data?.detail ||
                    "Unable to add skill."
            );

        } finally {
            setAddingSkill(false);
        }
    };


    /*
    ==================================================
    REMOVE SKILL
    ==================================================
    */

    const handleRemoveSkill = async (
        skillId
    ) => {
        try {
            setMessage("");
            setError("");

            await api.delete(
                `/skills/freelancer/${skillId}/`
            );

            setMySkills((previous) =>
                previous.filter(
                    (item) =>
                        item.skill !== skillId
                )
            );

            setMessage(
                "Skill removed successfully."
            );

        } catch (error) {
            console.error(
                "Error removing skill:",
                error
            );

            setError(
                error.response?.data?.detail ||
                    "Unable to remove skill."
            );
        }
    };


    /*
    ==================================================
    CANCEL EDIT
    ==================================================
    */

    const handleCancelEdit = () => {
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
            setPhotoPreview("");
        }

        setSelectedPhoto(null);
        setNewSkill("");

        setIsEditing(false);
        setMessage("");
        setError("");

        loadProfile();
    };


    /*
    ==================================================
    LOGOUT
    ==================================================
    */


    /*
    ==================================================
    BACK
    ==================================================
    */


    /*
    ==================================================
    LOADING
    ==================================================
    */

    if (loading) {
        return (
            <div className="profile-page">

                <FreelancerNavbar />

                <div className="profile-loading">
                    Loading profile...
                </div>

            </div>
        );
    }


    /*
    ==================================================
    DISPLAY VALUES
    ==================================================
    */

    const username =
        profile.username ||
        user?.username ||
        "Freelancer";

    const displayedPhoto =
        photoPreview ||
        getProfileImageUrl(
            profile.profile_picture
        );


    /*
    ==================================================
    RETURN
    ==================================================
    */

    return (
        <div className="profile-page">

            {/* =========================================
                NAVBAR
            ========================================= */}
            <FreelancerNavbar />
{/* =========================================
                MAIN
            ========================================= */}

            <main className="profile-container">

                {/* Heading */}

                <div className="profile-heading">

                    <div>

                        <p className="profile-label">
                            FREELANCER PROFILE
                        </p>

                        <h1>
                            {username}'s Profile
                        </h1>

                        <p>
                            {isEditing
                                ? "Update your professional information, photo and skills."
                                : "View your professional information and skills."}
                        </p>

                    </div>


                    {!isEditing && (

                        <button
                            className="edit-profile-button"
                            onClick={() => {
                                setMessage("");
                                setError("");
                                setIsEditing(true);
                            }}
                        >
                            Edit Profile
                        </button>

                    )}

                </div>


                {/* Messages */}

                {message && (
                    <div className="profile-success">
                        {message}
                    </div>
                )}


                {error && (
                    <div className="profile-error">
                        {error}
                    </div>
                )}


                {/* =========================================
                    VIEW PROFILE
                ========================================= */}

                {!isEditing ? (

                    <div className="profile-view-grid">

                        {/* Profile Information */}

                        <section className="profile-card">

                            <div className="profile-user-preview">

                                <div className="profile-photo-wrapper view-photo">

                                    {displayedPhoto ? (

                                        <img
                                            src={
                                                displayedPhoto
                                            }
                                            alt={`${username} profile`}
                                            className="profile-photo"
                                        />

                                    ) : (

                                        <div className="profile-avatar">
                                            {username
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                    )}

                                </div>


                                <div>

                                    <h3>
                                        {username}
                                    </h3>

                                    <span>
                                        Freelancer
                                    </span>

                                </div>

                            </div>


                            <div className="profile-detail">

                                <span>
                                    Professional Headline
                                </span>

                                <strong>
                                    {profile.headline ||
                                        "Not added yet"}
                                </strong>

                            </div>


                            <div className="profile-detail">

                                <span>
                                    About Me
                                </span>

                                <p>
                                    {profile.bio ||
                                        "No bio added yet."}
                                </p>

                            </div>


                            <div className="profile-info-grid">

                                <div className="profile-detail">

                                    <span>
                                        Location
                                    </span>

                                    <strong>
                                        {profile.location ||
                                            "Not added"}
                                    </strong>

                                </div>


                                <div className="profile-detail">

                                    <span>
                                        Experience
                                    </span>

                                    <strong>

                                        {
                                            profile.experience_years
                                        }{" "}

                                        {Number(
                                            profile.experience_years
                                        ) === 1
                                            ? "year"
                                            : "years"}

                                    </strong>

                                </div>


                                <div className="profile-detail">

                                    <span>
                                        Hourly Rate
                                    </span>

                                    <strong>
                                        ₹
                                        {Number(
                                            profile.hourly_rate
                                        ).toFixed(2)}
                                        /hr
                                    </strong>

                                </div>

                            </div>

                        </section>


                        {/* Skills */}

                        <section className="profile-card">

                            <div className="card-header">

                                <h2>
                                    Skills
                                </h2>

                                <p>
                                    Skills shown on your
                                    professional profile.
                                </p>

                            </div>


                            <div className="profile-view-skills">

                                {mySkills.length === 0 ? (

                                    <div className="no-skills">
                                        No skills added yet.
                                    </div>

                                ) : (

                                    mySkills.map(
                                        (item) => (

                                            <span
                                                className="view-skill"
                                                key={item.id}
                                            >
                                                {
                                                    item.skill_name
                                                }
                                            </span>

                                        )
                                    )

                                )}

                            </div>

                        </section>

                    </div>

                ) : (

                    /* =====================================
                       EDIT PROFILE
                    ===================================== */

                    <div className="profile-grid">

                        {/* Professional Information */}

                        <section className="profile-card">

                            <div className="card-header">

                                <h2>
                                    Professional Information
                                </h2>

                                <p>
                                    Update your profile
                                    information and photo.
                                </p>

                            </div>


                            <form
                                onSubmit={
                                    handleSaveProfile
                                }
                            >

                                {/* Profile Photo */}

                                <div className="profile-photo-editor">

                                    <div className="profile-photo-wrapper">

                                        {displayedPhoto ? (

                                            <img
                                                src={
                                                    displayedPhoto
                                                }
                                                alt={`${username} profile`}
                                                className="profile-photo"
                                            />

                                        ) : (

                                            <div className="profile-avatar">
                                                {username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                        )}

                                    </div>


                                    <div className="photo-actions">

                                        <h3>
                                            {username}
                                        </h3>

                                        <p>
                                            Add a professional
                                            profile photo.
                                        </p>


                                        <div className="photo-button-row">

                                            <label
                                                htmlFor="profile-picture"
                                                className="photo-upload-button"
                                            >
                                                {displayedPhoto
                                                    ? "Change Photo"
                                                    : "Add Photo"}
                                            </label>


                                            <input
                                                id="profile-picture"
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={
                                                    handlePhotoChange
                                                }
                                                hidden
                                            />


                                            {profile.profile_picture &&
                                                !photoPreview && (

                                                    <button
                                                        type="button"
                                                        className="photo-remove-button"
                                                        onClick={
                                                            handleRemovePhoto
                                                        }
                                                        disabled={
                                                            removingPhoto
                                                        }
                                                    >
                                                        {removingPhoto
                                                            ? "Removing..."
                                                            : "Remove Photo"}
                                                    </button>

                                                )}

                                        </div>


                                        <small>
                                            JPG, PNG or WEBP.
                                            Maximum 5 MB.
                                        </small>

                                    </div>

                                </div>


                                {/* Headline */}

                                <div className="form-group">

                                    <label htmlFor="headline">
                                        Professional Headline
                                    </label>

                                    <input
                                        id="headline"
                                        type="text"
                                        name="headline"
                                        value={
                                            profile.headline
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Python Full Stack Developer"
                                    />

                                </div>


                                {/* Bio */}

                                <div className="form-group">

                                    <label htmlFor="bio">
                                        About Me
                                    </label>

                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={
                                            profile.bio
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="6"
                                        placeholder="Tell clients about your experience and expertise..."
                                    />

                                </div>


                                {/* Location + Experience */}

                                <div className="form-row">

                                    <div className="form-group">

                                        <label htmlFor="location">
                                            Location
                                        </label>

                                        <input
                                            id="location"
                                            type="text"
                                            name="location"
                                            value={
                                                profile.location
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. Bangalore"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label htmlFor="experience_years">
                                            Experience
                                        </label>

                                        <input
                                            id="experience_years"
                                            type="number"
                                            name="experience_years"
                                            min="0"
                                            value={
                                                profile.experience_years
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        <small>
                                            Years
                                        </small>

                                    </div>

                                </div>


                                {/* Hourly Rate */}

                                <div className="form-group">

                                    <label htmlFor="hourly_rate">
                                        Hourly Rate
                                    </label>

                                    <div className="rate-input">

                                        <span>
                                            ₹
                                        </span>

                                        <input
                                            id="hourly_rate"
                                            type="number"
                                            name="hourly_rate"
                                            min="0"
                                            step="0.01"
                                            value={
                                                profile.hourly_rate
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="500"
                                        />

                                    </div>

                                </div>


                                {/* Buttons */}

                                <div className="edit-buttons">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={
                                            handleCancelEdit
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="save-profile-button"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                </div>

                            </form>

                        </section>


                        {/* Skills */}

                        <section className="profile-card">

                            <div className="card-header">

                                <h2>
                                    My Skills
                                </h2>

                                <p>
                                    Add any skills you have.
                                    You don't need to select
                                    from a predefined list.
                                </p>

                            </div>


                            {/* Current Skills */}

                            <div className="current-skills">

                                {mySkills.length === 0 ? (

                                    <div className="no-skills">
                                        No skills added yet.
                                    </div>

                                ) : (

                                    mySkills.map(
                                        (item) => (

                                            <div
                                                className="skill-item"
                                                key={item.id}
                                            >

                                                <span>
                                                    {
                                                        item.skill_name
                                                    }
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveSkill(
                                                            item.skill
                                                        )
                                                    }
                                                    title="Remove skill"
                                                >
                                                    ×
                                                </button>

                                            </div>

                                        )
                                    )

                                )}

                            </div>


                            {/* Add Skill */}

                            <div className="add-skill-section">

                                <label htmlFor="new-skill">
                                    Add a Skill
                                </label>


                                <div className="add-skill-row">

                                    <input
                                        id="new-skill"
                                        type="text"
                                        className="skill-text-input"
                                        value={newSkill}
                                        onChange={(event) =>
                                            setNewSkill(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={(event) => {

                                            if (
                                                event.key ===
                                                "Enter"
                                            ) {
                                                event.preventDefault();
                                                handleAddSkill();
                                            }

                                        }}
                                        placeholder="e.g. Docker, AWS, Kubernetes..."
                                    />


                                    <button
                                        type="button"
                                        className="add-skill-button"
                                        onClick={
                                            handleAddSkill
                                        }
                                        disabled={
                                            !newSkill.trim() ||
                                            addingSkill
                                        }
                                    >
                                        {addingSkill
                                            ? "Adding..."
                                            : "Add"}
                                    </button>

                                </div>

                            </div>


                            {/* Skill Matching Information */}

                            <div className="skill-info-box">

                                <div className="skill-info-icon">
                                    %
                                </div>

                                <div>

                                    <h3>
                                        Skill matching
                                    </h3>

                                    <p>
                                        Your skills are used
                                        to calculate how well
                                        you match client
                                        projects.
                                    </p>

                                </div>

                            </div>

                        </section>

                    </div>

                )}

            </main>

        </div>
    );
}

export default FreelancerProfile;