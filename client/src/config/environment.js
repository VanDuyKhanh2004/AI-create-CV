// Environment configuration
export const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};

export default config;
