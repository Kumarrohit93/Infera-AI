const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api";

export async function login({ email, password }) {
  const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The authentication service returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        payload?.message ||
        "Email or password is incorrect. Please try again."
    );
  }

  if (!payload?.data?.accessToken || !payload?.data?.user) {
    throw new Error("The authentication service returned incomplete login data.");
  }

  return payload.data;
}

export function getStoredUser() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Could not read the signed-in member profile.", error);
    return null;
  }
}

export function getUserInitials(name) {
  return String(name || "Member")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "M";
}
