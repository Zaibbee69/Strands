import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { ArrowLeft, Pencil, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

const fetcher = (url) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

const updateProfile = async (url, { arg }) => {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(arg),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Update failed");
  return data.user;
};

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const {
    data: profileUser,
    error,
    isLoading,
    mutate,
  } = useSWR(`${API_URL}/users/${id}`, fetcher);

  const { trigger, isMutating } = useSWRMutation(
    `${API_URL}/users/${id}`,
    updateProfile,
  );

  const [editingBio, setEditingBio] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [avatarDraft, setAvatarDraft] = useState("");

  if (isLoading)
    return <span className="loading loading-spinner loading-lg m-6"></span>;
  if (error || !profileUser) return <p className="p-6">User not found.</p>;

  const isOwnProfile = currentUser?.id === profileUser.id;

  const startEditBio = () => {
    setBioDraft(profileUser.bio || "");
    setEditingBio(true);
  };

  const startEditAvatar = () => {
    setAvatarDraft(profileUser.avatarUrl || "");
    setEditingAvatar(true);
  };

  const saveField = async (field, value) => {
    try {
      const updated = await trigger({ [field]: value });
      mutate({ ...profileUser, ...updated }, false);
      setEditingBio(false);
      setEditingAvatar(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-base-300">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-circle btn-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Profile</h1>
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="avatar avatar-placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-28 ring ring-primary ring-offset-4 ring-offset-base-100">
                {profileUser.avatarUrl ? (
                  <img src={profileUser.avatarUrl} alt={profileUser.username} />
                ) : (
                  <span className="text-3xl font-bold">
                    {profileUser.username[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <button
                onClick={startEditAvatar}
                className="btn btn-circle btn-sm btn-neutral absolute bottom-0 right-0"
                title="Edit avatar"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>

          {/* Name + stats */}
          <div className="flex-1">
            <h2 className="text-2xl font-black">
              {profileUser.username}
              {profileUser.isGuest && (
                <span className="badge badge-neutral badge-sm ml-2 align-middle">
                  Guest
                </span>
              )}
            </h2>

            <div className="flex gap-8 mt-4">
              <div className="text-center">
                <p className="text-xl font-bold">
                  {profileUser._count.followers}
                </p>
                <p className="text-sm text-secondary">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">
                  {profileUser._count.following}
                </p>
                <p className="text-sm text-secondary">Following</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{profileUser._count.posts}</p>
                <p className="text-sm text-secondary">Posts</p>
              </div>
            </div>

            {!isOwnProfile && (
              <button className="btn btn-primary btn-sm mt-4">Follow</button>
            )}
          </div>
        </div>

        {/* Bio row */}
        <div className="mt-8 max-w-lg flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {editingBio ? (
              <>
                <input
                  autoFocus
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  disabled={isMutating}
                  placeholder="Write a short bio..."
                  className="input input-bordered input-sm bg-base-200 flex-1"
                />
                <button
                  onClick={() => saveField("bio", bioDraft)}
                  disabled={isMutating}
                  className="btn btn-circle btn-sm btn-success"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditingBio(false)}
                  disabled={isMutating}
                  className="btn btn-circle btn-sm btn-ghost"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <span className="text-base-content">
                  {profileUser.bio || (
                    <span className="text-secondary italic">No bio yet</span>
                  )}
                </span>
                {isOwnProfile && (
                  <button
                    onClick={startEditBio}
                    className="text-secondary hover:text-primary"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Save banner while editing avatar */}
        {editingAvatar && (
          <div className="mt-6 max-w-lg flex flex-col gap-2 bg-base-200 border border-base-300 rounded-box p-4">
            <label className="text-sm text-secondary">Avatar URL</label>
            <input
              autoFocus
              value={avatarDraft}
              onChange={(e) => setAvatarDraft(e.target.value)}
              disabled={isMutating}
              placeholder="https://..."
              className="input input-bordered input-sm bg-base-100"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => saveField("avatarUrl", avatarDraft)}
                disabled={isMutating}
                className="btn btn-primary btn-sm"
              >
                {isMutating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Save"
                )}
              </button>
              <button
                onClick={() => setEditingAvatar(false)}
                disabled={isMutating}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
