export const sendAuthRequest = async (url, { arg }) => {
    const { action, credentials } = arg;
    const payload = action === "guest" ? {} : credentials;

    const cleanUrl = `${url.replace(/\/$/, "")}/${action}`;

    const response = await fetch(cleanUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    const trimmed = rawText.trim().toLowerCase();

    if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
        throw new Error(
            `Server returned HTML text instead of JSON. Checked Target URL: ${cleanUrl}`,
        );
    }

    const data = JSON.parse(rawText);

    if (!response.ok) {
        const error = new Error(data.message || `Auth failed on /${action}`);
        error.status = response.status;
        throw error;
    }

    return data;
};