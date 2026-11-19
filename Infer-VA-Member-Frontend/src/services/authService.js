const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api";
const AUTH_API_URL = API_BASE_URL.replace(/\/$/, "");

export async function login({ email, password }) {
  const response = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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

export async function requestPasswordReset(email) {
  const response = await fetch(`${AUTH_API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Could not request a password reset.");
  }
}

export async function acceptInvitation({ token, name, password }) {
  const response = await fetch(`${AUTH_API_URL}/auth/accept-invitation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, name, password }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data?.accessToken || !payload?.data?.user) {
    throw new Error(payload?.error?.message || "Could not accept this invitation.");
  }
  return payload.data;
}

export async function resetPassword({ token, password }) {
  const response = await fetch(`${AUTH_API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, password }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Could not reset the password.");
  }
}

export async function fetchWithSession(url, options = {}) {
  const send = () => {
    const headers = new Headers(options.headers || {});
    const token = localStorage.getItem("accessToken");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...options, headers, credentials: "include" });
  };

  let response = await send();
  if (response.status !== 401 || url.includes("/auth/")) return response;

  const refreshResponse = await fetch(`${AUTH_API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  const refreshed = await refreshResponse.json().catch(() => null);
  if (refreshResponse.ok && refreshed?.data?.accessToken) {
    localStorage.setItem("accessToken", refreshed.data.accessToken);
    response = await send();
    return response;
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  window.location.href = "/";
  return response;
}

export async function logout() {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Could not revoke the server session.");
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
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
