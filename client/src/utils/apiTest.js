// Utility để test API connection
import api from "../config/api";

export const testAPIConnection = async () => {
  try {
    console.log("Testing API connection...");
    const response = await api.get("/auth/status");
    console.log("✅ API connection successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ API connection failed:", error.message);
    return { success: false, error: error.message };
  }
};

export const testAuthEndpoints = async () => {
  const endpoints = [
    { method: "GET", url: "/auth/status", name: "Auth Status" },
    { method: "GET", url: "/api/cv", name: "CV List" },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const response = await api[endpoint.method.toLowerCase()](endpoint.url);
      results.push({
        endpoint: endpoint.name,
        status: "success",
        data: response.data,
      });
    } catch (error) {
      results.push({
        endpoint: endpoint.name,
        status: "error",
        error: error.response?.data?.message || error.message,
      });
    }
  }

  return results;
};

// Auto test khi import (chỉ trong development)
if (process.env.NODE_ENV === "development") {
  // Delay để tránh test ngay khi app khởi động
  setTimeout(() => {
    testAPIConnection();
  }, 2000);
}
