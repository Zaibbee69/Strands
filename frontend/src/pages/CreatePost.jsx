import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { ImagePlus, X } from "lucide-react";
import { API_URL } from "../config";
import { uploadImageToCloudinary } from "../lib/cloudinaryUpload";

const MAX_LENGTH = 2000;

export default function CreatePost() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState(null); // local blob preview
  const [imageFile, setImageFile] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const remaining = MAX_LENGTH - content.length;
  const isOverLimit = remaining < 0;
  const canPost =
    content.trim().length > 0 &&
    !isOverLimit &&
    !isPosting &&
    !isUploadingImage;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB.");
      return;
    }

    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // instant preview, no waiting on upload
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!canPost) return;
    setIsPosting(true);
    setError(null);

    try {
      let imageUrl = null;

      if (imageFile) {
        setIsUploadingImage(true);
        imageUrl = await uploadImageToCloudinary(imageFile);
        setIsUploadingImage(false);
      }

      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: content.trim(), imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post");

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setIsUploadingImage(false);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share whats happening.."
        rows={5}
        className="textarea w-full bg-transparent border-none text-base sm:text-lg text-base-content placeholder:text-secondary/60 focus:outline-none resize-none px-0"
      />

      {imagePreview && (
        <div className="relative mb-4">
          <img
            src={imagePreview}
            alt=""
            className="rounded-box w-full object-cover max-h-56 sm:max-h-80"
          />
          <button
            onClick={removeImage}
            disabled={isPosting}
            className="btn btn-circle btn-sm btn-neutral absolute top-2 right-2"
          >
            <X size={16} />
          </button>
          {isUploadingImage && (
            <div className="absolute inset-0 bg-black/50 rounded-box flex items-center justify-center">
              <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="alert alert-error text-sm py-2 mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-base-300 pt-4 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isPosting}
          className={`btn btn-circle btn-ghost shrink-0 ${
            imagePreview ? "text-primary" : "text-base-content"
          }`}
          title="Add an image"
        >
          <ImagePlus size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <span
            className={`text-xs sm:text-sm tabular-nums ${
              isOverLimit ? "text-error" : "text-secondary"
            }`}
          >
            {content.length}/{MAX_LENGTH}
          </span>

          <button
            onClick={handleSubmit}
            disabled={!canPost}
            className="btn btn-neutral rounded-full px-5 sm:px-6 disabled:opacity-40"
          >
            {isPosting || isUploadingImage ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
