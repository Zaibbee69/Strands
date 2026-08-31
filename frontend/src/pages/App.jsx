import { useState } from "react";
import UserListWidget from "../components/UserListWidget";
function App() {
  const [tab, setTab] = useState("recent");
  // Replace with real API data
  const latestUsers = [
    { id: "1", username: "JD", displayName: "JD", isFollowing: true },
    {
      id: "2",
      username: "Max",
      displayName: "Max Paardekam",
      isFollowing: false,
    },
  ];
  const mostFollowed = [
    {
      id: "3",
      username: "Admin",
      displayName: "Legal Unicorn",
      isFollowing: false,
    },
    { id: "4", username: "tt", displayName: "tabs", isFollowing: false },
  ];

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 p-4 lg:p-6">
        {/* Middle: feed */}
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

          {/* Post cards go here, filtered by `tab` */}
        </div>

        {/* Right rail — only Home needs this */}
        <aside className="hidden xl:flex flex-col gap-6">
          <UserListWidget title="Latest users" users={latestUsers} />
          <UserListWidget title="Most followed" users={mostFollowed} />
        </aside>
      </div>
    </>
  );
}

export default App;
