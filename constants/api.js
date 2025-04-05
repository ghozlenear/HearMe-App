import axios from "axios";

//  Backend Configuration
const BACKEND_ENDPOINTS = [
  "http://localhost:5000",                     // Local development
  "https://6d33-105-104-190-37.ngrok-free.app", // Ngrok tunnel
  // "https://your-production-domain.com"      // Future production
];

// Backend Detection System
let apiInstance = null;

const createApiInstance = async (baseURL) => {
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "ar",
      "ngrok-skip-browser-warning": "true"
    },
    timeout: 10000
  });
};

const detectWorkingBackend = async () => {
  for (const url of BACKEND_ENDPOINTS) {
    try {
      const testApi = await createApiInstance(url);
      const response = await testApi.get('/health', { timeout: 2000 });
      if (response.status === 200) {
        console.log("Connected to backend:", url);
        return testApi;
      }
    } catch (error) {
      console.warn(`Backend ${url} unavailable:`, error.message);
    }
  }
  throw new Error("لا يمكن الاتصال بأي خادم - الرجاء التأكد من اتصال الإنترنت");
};

//Core API Methods
const initializeAPI = async () => {
  if (!apiInstance) {
    apiInstance = await detectWorkingBackend();
  }
  return apiInstance;
};

// Public API Functions
export const predictDepression = async (text) => {
  const api = await initializeAPI();
  try {
    const response = await api.post("/predict", { text });
    return {
      success: true,
      data: response.data,
      backend: api.defaults.baseURL
    };
  } catch (error) {
    console.error("Prediction error:", error);
    throw new Error(
      error.response?.data?.error || 
      "فشل في تحليل النص. يرجى المحاولة مرة أخرى"
    );
  }
};

export const logConversation = async (data) => {
  const api = await initializeAPI();
  try {
    await api.post("/log_conversation", data, { timeout: 5000 });
    return { success: true };
  } catch (error) {
    console.warn("Non-critical logging error:", error);
    return { success: false };
  }
};

// Health Monitoring
export const checkBackendHealth = async () => {
  try {
    const api = await initializeAPI();
    const response = await api.get('/health');
    return {
      status: "connected",
      backend: api.defaults.baseURL,
      details: response.data
    };
  } catch (error) {
    return {
      status: "disconnected",
      error: "لا يوجد اتصال بالخادم"
    };
  }
};

export const fullSystemCheck = async () => {
  const api = await initializeAPI();
  try {
    const response = await api.get('/deep_health');
    return {
      operational: true,
      components: response.data,
      backend: api.defaults.baseURL
    };
  } catch (error) {
    throw new Error("النظام غير متوفر بالكامل");
  }
};

// Backend Management
export const switchBackend = async (newUrl) => {
  try {
    const testApi = await createApiInstance(newUrl);
    const response = await testApi.get('/health');
    apiInstance = testApi;
    return {
      success: true,
      newBackend: newUrl
    };
  } catch (error) {
    throw new Error("الخادم الجديد غير متاح");
  }
};

// Export the API
export default {
  predictDepression,
  logConversation,
  checkBackendHealth,
  fullSystemCheck,
  switchBackend
};