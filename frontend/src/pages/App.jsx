import { useState } from "react";
import useSWR from "swr";
import UserListWidget from "../components/UserListWidget";
import PostSection from "../components/PostSection";
import { API_URL } from "../config";

const fetcher = (url) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  });

function App() {
  const [tab, setTab] = useState("recent");

  const {
    data: latest,
    isLoading: latestLoading,
    mutate: mutateLatest,
  } = useSWR(`${API_URL}/users/latest`, fetcher);

  const {
    data: popular,
    isLoading: popularLoading,
    mutate: mutatePopular,
  } = useSWR(`${API_URL}/users/most-followed`, fetcher);

  // A person can appear in both lists, so after any follow action refetch both
  // to keep their buttons consistent.
  const refreshWidgets = () => {
    mutateLatest();
    mutatePopular();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 p-4 lg:p-6">
      <div>
        <div className="flex justify-center gap-6 border-b border-base-300 mb-6">
          <button
            onClick={() => setTab("recent")}
            className={`pb-3 font-bold ${
              tab === "recent"
                ? "text-base-content border-b-2 border-primary"
                : "text-secondary"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setTab("following")}
            className={`pb-3 font-bold ${
              tab === "following"
                ? "text-base-content border-b-2 border-primary"
                : "text-secondary"
            }`}
          >
            Following
          </button>
        </div>

        <PostSection feedType={tab} />
      </div>

      <aside className="hidden xl:flex flex-col gap-6">
        <UserListWidget
          title="Latest users"
          users={latest?.users}
          isLoading={latestLoading}
          onFollowChange={refreshWidgets}
        />
        <UserListWidget
          title="Most followed"
          users={popular?.users}
          isLoading={popularLoading}
          onFollowChange={refreshWidgets}
        />
      </aside>
    </div>
  );
}

export default App;
