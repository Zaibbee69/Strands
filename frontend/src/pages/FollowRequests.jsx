import { useEffect, useState } from "react";
import FollowRequestCard from "../components/FollowRequestCard";
import { API_URL } from "../config";

export default function FollowRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/follow-requests`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setRequests(data.requests))
      .finally(() => setIsLoading(false));
  }, []);

  const handleResolved = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  if (isLoading) {
    return <span className="loading loading-spinner loading-lg m-6"></span>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold p-5 border-b border-base-300">
        Follow Requests
      </h1>
      {requests.length === 0 ? (
        <p className="text-center text-secondary py-10">
          No pending follow requests.
        </p>
      ) : (
        requests.map((r) => (
          <FollowRequestCard
            key={r.id}
            request={r}
            onResolved={handleResolved}
          />
        ))
      )}
    </div>
  );
}
