import { useState } from "react";

export default function LoginForm({ onAuth, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e, action) => {
    e.preventDefault();
    onAuth(action, { username, password });
  };

  return (
    <div className="card-body w-full max-w-md gap-4 justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-base-content">Welcome Back</h1>
        <p className="text-sm text-secondary mt-1">
          Let’s get you back into your account.
        </p>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-3"
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          disabled={loading}
          onChange={(e) => setUsername(e.target.value)}
          className="input input-bordered bg-base-100 border-base-300 text-base-content focus:border-primary focus:outline-none w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered bg-base-100 border-base-300 text-base-content focus:border-primary focus:outline-none w-full"
        />

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
            type="submit"
            disabled={loading}
            onClick={(e) => handleSubmit(e, "guest")}
            className="btn btn-neutral w-full"
          >
            Continue as Guest
          </button>
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
