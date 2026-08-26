import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 1. Perform mock authentication login action
    localStorage.setItem("user_token", "secure_session_key");

    // 2. Redirect securely to the protected feed
    navigate("/", { replace: true });
  };

  return <section>lol</section>;
}
