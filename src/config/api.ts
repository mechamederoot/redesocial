// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper function to make API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  return response;
};
