import { useAuthAction } from "../hooks/useAuthAction";
import SignupForm from "../components/SignupForm";
import BrandingPanel from "../components/BrandingPanel";

export default function Signup() {
  const { handleAuth, isMutating, error } = useAuthAction();

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-6">
      <div className="flex w-full max-w-5xl flex-col lg:flex-row gap-2">
        <div className="card bg-base-300 rounded-box grid min-h-[450px] grow place-items-center p-4 relative">
          {error && (
            <div className="alert alert-error absolute top-4 left-4 right-4 w-auto text-sm py-2 shadow-md">
              <span>
                {error.message ||
                  "Something went wrong. Please check your network."}
              </span>
            </div>
          )}

          <SignupForm onAuth={handleAuth} loading={isMutating} />
        </div>

        <div className="divider lg:divider-horizontal text-secondary font-bold"></div>

        <BrandingPanel />
      </div>
    </div>
  );
}
