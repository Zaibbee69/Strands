import { API_URL } from "../config";

export async function uploadImageToCloudinary(file) {
    const sigRes = await fetch(`${API_URL}/uploads/signature`, {
        credentials: "include",
    });
    if (!sigRes.ok) throw new Error("Could not get upload signature");
    const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
    );

    if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error?.message || "Image upload failed");
    }

    const data = await uploadRes.json();
    return data.secure_url;
}