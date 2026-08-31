import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
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

  // Dummy posts — replace with real feed data from your API
  const posts = [
    {
      id: "p1",
      author: "GuestUser",
      createdAt: "6 days ago",
      content:
        "This is Lalibela, Ethiopia. Simply call it the 8th wonder of the world",
      imageUrl: null,
      likes: 12,
      comments: 3,
      isFollowingAuthor: false,
    },
    {
      id: "p2",
      author: "Max",
      createdAt: "2 hours ago",
      content: "Just shipped a new feature — feels good.",
      imageUrl: null,
      likes: 5,
      comments: 1,
      isFollowingAuthor: true,
    },
    {
      id: "p3",
      author: "Admin",
      createdAt: "1 day ago",
      content: "Welcome to Strands. Connect the dots.",
      imageUrl: null,
      likes: 40,
      comments: 8,
      isFollowingAuthor: true,
    },
  ];

  const visiblePosts =
    tab === "following" ? posts.filter((p) => p.isFollowingAuthor) : posts;

  return (
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

        {/* Post cards */}
        <div className="flex flex-col gap-6">
          {visiblePosts.length === 0 ? (
            <p className="text-secondary text-center py-10">
              No posts to show here yet.
            </p>
          ) : (
            visiblePosts.map((post) => (
              <div
                key={post.id}
                className="bg-base-200 border border-base-300 rounded-box p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="avatar avatar-placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-9">
                      <span className="text-sm">
                        {post.author[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold">{post.author}</span>
                  <span className="text-secondary text-sm">
                    · {post.createdAt}
                  </span>
                </div>

                <p className="mb-3">{post.content}</p>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="rounded-box w-full object-cover mb-3"
                  />
                )}

                <div className="flex items-center gap-4 text-secondary text-sm">
                  <button className="flex items-center gap-1 hover:text-primary">
                    <Heart size={16} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary">
                    <MessageCircle size={16} /> {post.comments}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right rail — only App/Home needs this */}
      <aside className="hidden xl:flex flex-col gap-6">
        <UserListWidget title="Latest users" users={latestUsers} />
        <UserListWidget title="Most followed" users={mostFollowed} />
      </aside>
    </div>
  );
}

export default App;
