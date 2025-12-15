const API_BASE = import.meta.env.VITE_BACKEND_URL;

export const apiFetch = (path, options = {}) => {
  return fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
};
