import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { LogOut, User as UserIcon, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

export default function Settings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log out");

      setUser(null);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold p-5 border-b border-base-300">
        Settings
      </h1>

      {/* Account section */}
      <div className="p-5 border-b border-base-300">
        <h2 className="text-sm font-bold text-secondary uppercase tracking-wide mb-3">
          Account
        </h2>

        <Link
          to={`/profile/${user?.id}`}
          className="flex items-center gap-3 p-3 rounded-box hover:bg-base-200 transition-colors"
        >
          <div className="avatar avatar-placeholder shrink-0">
            <div className="bg-neutral text-neutral-content rounded-full w-11">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} />
              ) : (
                <span>{user?.username?.[0]?.toUpperCase()}</span>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{user?.username}</p>
            <p className="text-sm text-secondary">
              {user?.isGuest ? "Guest account" : "View and edit your profile"}
            </p>
          </div>
          <ChevronRight size={18} className="text-secondary shrink-0" />
        </Link>
      </div>

      {/* Guest notice */}
      {user?.isGuest && (
        <div className="p-5 border-b border-base-300">
          <div className="alert bg-base-200 border border-base-300 text-sm">
            <UserIcon size={18} className="text-secondary shrink-0" />
            <span>
              You're using a guest account. Your data isn't tied to an email or
              password — clearing cookies or logging out may make it harder to
              get back in.
            </span>
          </div>
        </div>
      )}

      {/* Session section */}
      <div className="p-5">
        <h2 className="text-sm font-bold text-secondary uppercase tracking-wide mb-3">
          Session
        </h2>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-3">
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="btn btn-outline btn-error w-full sm:w-auto gap-2"
        >
          {isLoggingOut ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <>
              <LogOut size={18} />
              Log out
            </>
          )}
        </button>
      </div>
    </div>
  );
}
