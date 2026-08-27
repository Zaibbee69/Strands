import { useNavigate } from "react-router";
import useSWRMutation from "swr/mutation";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";

// 1. Define a global fetcher function tailored for POST requests
const sendAuthRequest = async (url, { arg }) => {
  const { action, credentials } = arg;
  const payload = action === "guest" ? {} : credentials;

  // Append a strict slash check to completely prevent double slashes '//'
  const cleanUrl = `${url.replace(/\/$/, "")}/${action}`;

  console.log(`📡 SWR Dispatching Outbound Payload to Target URL: ${cleanUrl}`);

  const response = await fetch(cleanUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Required for passport cookies/sessions
    body: JSON.stringify(payload),
  });

  // Read the response purely as a raw text string first before parsing anything
  const rawText = await response.text();

  // If it starts with HTML tags, abort and output the response text directly
  if (
    rawText.trim().startsWith("<!DOCTYPE") ||
    rawText.trim().startsWith("<html")
  ) {
    console.error(
      "🚨 HTML Leak Detected! Your app hit a 404 or fallback page.",
    );
    console.error("====== Server Response Text ======");
    console.log(rawText.slice(0, 500)); // Prints the first 500 characters of the HTML page
    console.error("==================================");
    throw new Error(
      `Server returned HTML text instead of JSON. Checked Target URL: ${cleanUrl}`,
    );
  }

  // Safe to parse once validated
  const data = JSON.parse(rawText);

  if (!response.ok) {
    const error = new Error(data.message || `Auth failed on /${action}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // <-- pull setUser from context

  // 2. Set up the SWR mutation hook pointing to your base auth endpoint
  const { trigger, isMutating, error } = useSWRMutation(
    "http://localhost:3000/auth",
    sendAuthRequest,
  );

  // 3. Unified action trigger called by the child LoginForm
  const handleAuth = async (action, credentials) => {
    try {
      // SWR trigger passes parameters cleanly down into the fetcher argument
      const data = await trigger({ action, credentials });
      setUser(data.user); // <-- tell context you're logged in
      navigate("/", { replace: true }); // now ProtectedRoute sees a real user

      // Secure client-side redirect
      navigate("/", { replace: true });
    } catch (err) {
      // Errors are caught here and automatically managed via SWR's 'error' object
      console.error("Mutation failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-6">
      <div className="flex w-full max-w-5xl flex-col lg:flex-row gap-2">
        {/* Left Side: Login Box */}
        <div className="card bg-base-300 rounded-box grid min-h-[450px] grow place-items-center p-4 relative">
          {/* Optional: Render global network errors natively */}
          {error && (
            <div className="alert alert-error absolute top-4 left-4 right-4 w-auto text-sm py-2 shadow-md">
              <span>
                {error.message ||
                  "Something went wrong. Please check your network."}
              </span>
            </div>
          )}

          {/* Pass SWR state down to look after disable statuses automatically */}
          <LoginForm onAuth={handleAuth} loading={isMutating} />
        </div>

        {/* Divider */}
        <div className="divider lg:divider-horizontal text-secondary font-bold">
          OR
        </div>

        {/* Right Side: Alternative Card */}
        <div className="card bg-base-300 rounded-box grid min-h-[450px] grow place-items-center p-4 text-base-content">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Explore the Platform</h2>
            <p className="text-sm text-secondary">
              Discover trending feeds and curated global vectors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
