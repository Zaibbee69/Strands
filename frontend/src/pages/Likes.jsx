import PostSection from "../components/PostSection";

export default function Likes() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold p-5 border-b border-base-300">
        Liked Posts
      </h1>
      <PostSection liked />
    </div>
  );
}
