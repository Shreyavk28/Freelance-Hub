import {
    createContext,
    useContext,
    useState
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    /*
     * Restore saved user when the application starts.
     */
    const [user, setUser] = useState(() => {

        const savedUser =
            localStorage.getItem("user");

        if (!savedUser) {
            return null;
        }

        try {
            return JSON.parse(savedUser);
        } catch (error) {

            console.error(
                "Unable to restore user:",
                error
            );

            localStorage.removeItem("user");

            return null;
        }
    });

    /*
     * Restore access token.
     */
    const [accessToken, setAccessToken] = useState(
        () => localStorage.getItem("accessToken")
    );

    /*
     * Login
     */
    const login = (userData, token) => {

        setUser(userData);
        setAccessToken(token);

        localStorage.setItem(
            "accessToken",
            token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );
    };

    /*
     * Logout
     */
    const logout = () => {

        setUser(null);
        setAccessToken(null);

        localStorage.removeItem(
            "accessToken"
        );

        localStorage.removeItem(
            "refreshToken"
        );

        localStorage.removeItem(
            "user"
        );
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}