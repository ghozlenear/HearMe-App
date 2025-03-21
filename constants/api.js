import axios from "axios";

const BASE_URL = "https://6d33-105-104-190-37.ngrok-free.app";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Test function
export const testApiConnection = async () => {
  try {
    const response = await api.get("/chat"); 
    console.log("API Response:", response.data);
  } catch (error) {
    console.error("API Error:", error);
  }
};

export default api;
