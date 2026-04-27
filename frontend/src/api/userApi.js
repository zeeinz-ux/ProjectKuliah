// frontend/src/api/userApi.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3333";

// Ambil user dari localStorage
export const getLocalUser = () => {
  const raw = localStorage.getItem("user");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

// Ambil id user lokal jika masih dibutuhkan di komponen lain
export const getLocalUserId = () => {
  const user = getLocalUser();

  return user?.id || user?.user?.id || null;
};

// Ambil token JWT
export const getLocalToken = () => {
  return localStorage.getItem("token") || null;
};

// Header auth standar
const getAuthHeaders = () => {
  const token = getLocalToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
};

// Baca response JSON dengan aman
const readJsonSafe = async (res) => {
  const text = await res.text();

  try {
    return {
      json: text ? JSON.parse(text) : {},
      raw: text,
    };
  } catch {
    return {
      json: {},
      raw: text,
    };
  }
};

// Ambil profil user yang sedang login
export const getUserProfile = async () => {
  const res = await fetch(`${API_BASE_URL}/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const { json, raw } = await readJsonSafe(res);

  if (!res.ok) {
    throw new Error(
      json.message ||
        `Gagal mengambil profil (HTTP ${res.status}): ${raw || "-"}`,
    );
  }

  return json;
};

// Update profil user yang sedang login
export const updateUserProfile = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/me`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const { json, raw } = await readJsonSafe(res);

  if (!res.ok) {
    throw new Error(
      json.message || `Gagal update profil (HTTP ${res.status}): ${raw || "-"}`,
    );
  }

  return json;
};

// Update password user yang sedang login
export const updateUserPassword = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/me/password`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const { json, raw } = await readJsonSafe(res);

  if (!res.ok) {
    throw new Error(
      json.message ||
        `Gagal update password (HTTP ${res.status}): ${raw || "-"}`,
    );
  }

  return json;
};
