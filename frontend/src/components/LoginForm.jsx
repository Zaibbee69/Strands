import { useState } from "react";
import CandyWorm from "../assets/candy-worm.svg";
import { API_URL } from "../config";
import { User, KeyRound, LineSquiggle } from "lucide-react";

export default function LoginForm({ onAuth, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e, action) => {
    e.preventDefault();
    onAuth(action, { username, password });
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/auth/github`;
  };

  return (
    <div className="card-body w-full max-w-md gap-4 justify-center">
      <div className="text-center flex flex-col items-center">
        {/* Your Custom Imported SVG */}
        <div className="mb-4">
          <img
            src={CandyWorm}
            alt="Candy Worm Logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        <h1 className="text-xl md:text-3xl font-bold text-base-content">
          Welcome Back
        </h1>
        <p className="text-sm text-secondary mt-1">
          Let’s get you back into your account.
        </p>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-3"
      >
        <label className="input">
          <User className="h-[1em] opacity-50" />

          <input
            type="text"
            placeholder="Username"
            value={username}
            disabled={loading}
            onChange={(e) => setUsername(e.target.value)}
            className="input input-bordered bg-base-100 border-base-300 text-base-content focus:border-primary focus:outline-none w-full"
          />
        </label>

        <label className="input">
          <KeyRound className="h-[1em] opacity-50" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered bg-base-100 border-base-300 text-base-content focus:border-primary focus:outline-none w-full"
          />
        </label>

        <div className="flex flex-col gap-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            onClick={(e) => handleSubmit(e, "login")}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Login"
            )}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleGithubLogin}
            className="btn btn-outline border-base-300 hover:bg-base-content hover:text-base-100 text-base-content w-full flex items-center justify-center gap-3 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                {/* Authentic GitHub SVG Logo Layer */}
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 fill-current transition-transform duration-200 group-hover:scale-110"
                >
                  <title>GitHub</title>
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span>Continue with GitHub</span>
              </>
            )}
          </button>

          {/* daisyUI Aura Container configured as an interactive state listener */}
          <div className="aura aura-gold w-full select-none group">
            <button
              type="submit"
              disabled={loading}
              onClick={(e) => handleSubmit(e, "guest")}
              className="btn btn-neutral w-full cursor-pointer transition-all duration-300 ease-in-out font-medium flex items-center justify-center gap-2
               group-hover:bg-[#E6B800] group-hover:border-[#E6B800] group-hover:text-black group-hover:shadow-[0_0_25px_rgba(230,184,0,0.4)]"
            >
              {/* Lucide LineSquiggle Icon Layer */}
              <LineSquiggle
                size={18}
                strokeWidth={2}
                className="text-secondary/80 transition-all duration-300 ease-in-out 
                 group-hover:text-black group-hover:scale-95 group-hover:stroke-[2.5]"
              />
              <span>Continue as Guest</span>
            </button>
          </div>
        </div>
      </form>

      <div className="text-center text-sm text-secondary mt-2">
        Don't have an account?{" "}
        <button
          type="button"
          disabled={loading}
          onClick={(e) => handleSubmit(e, "signup")}
          className="text-primary font-semibold hover:underline bg-transparent border-none p-0 inline align-baseline cursor-pointer"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
