import axios from "axios";

const BACKEND_ENDPOINTS = [
  "http://localhost:5000",                     
  "https://d22f-41-200-197-17.ngrok-free.app", 
  // "https://your-production-domain.com"       // Future production
];

let apiInstance = null;

// Create Axios Instance
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

// Try available backends and return a working one
const detectWorkingBackend = async () => {
  for (const url of BACKEND_ENDPOINTS) {
    try {
      const testApi = await createApiInstance(url);
      const response = await testApi.get('/health', { timeout: 2000 });
      if (response.status === 200) {
        console.log(" Connected to backend:", url);
        return testApi;
      }
    } catch (error) {
      console.warn(` Backend ${url} unavailable:`, error.message);
    }
  }
  throw new Error("لا يمكن الاتصال بأي خادم  الرجاء التأكد من اتصال الإنترنت");
};

// Initialize API once
const initializeAPI = async () => {
  if (!apiInstance) {
    apiInstance = await detectWorkingBackend();
  }
  return apiInstance;
};

//
// 🔹 MAIN PUBLIC FUNCTIONS 🔹
//

// Predict depression from user message
export const predictDepression = async (text, user_id = "anonymous") => {
  const api = await initializeAPI();
  const response = await api.post("/predict", { text, user_id });
  return response.data;
};

// Generate a reply from GPT backend
export const generateArabicResponse = async (user_id, message, prediction) => {
  const api = await initializeAPI();
  const response = await api.post("/generate-arabic-response", {
    user_id,
    message,
    prediction
  });
  return response.data;
};

// Log a conversation (optional)
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

// Health Checks
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

// Manually switch to a different backend
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

// Export everything
export default {
  predictDepression,
  generateArabicResponse,
  logConversation,
  checkBackendHealth,
  fullSystemCheck,
  switchBackend
};
