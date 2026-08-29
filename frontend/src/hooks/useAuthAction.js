import { useNavigate } from "react-router";
import useSWRMutation from "swr/mutation";
import { useAuth } from "../context/AuthContext";
import { sendAuthRequest } from "../lib/authFetcher";
import { API_URL } from "../config";

export function useAuthAction() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const { trigger, isMutating, error } = useSWRMutation(
        `${API_URL}/auth`,
        sendAuthRequest,
    );

    const handleAuth = async (action, credentials) => {
        try {
            const data = await trigger({ action, credentials });
            setUser(data.user);
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Mutation failed:", err);
        }
    };

    return { handleAuth, isMutating, error };
}