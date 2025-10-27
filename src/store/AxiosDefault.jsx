import axios from "axios";
import { toast } from "react-toastify";
import { baseURL } from "../utils/service";

// Create the instance once, not per request!
const AxiosDefault = axios.create({
  baseURL: baseURL,
});

// Add a request interceptor
AxiosDefault.interceptors.request.use(
  function (config) {
    try {
      // If your token is just stored as a string in sessionStorage:
      const token = sessionStorage.getItem("!2v@1A~1");
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
    } catch (err) {
      toast.error("Something went wrong getting token.");
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor (optional)
AxiosDefault.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // Optionally show toast on error
    // toast.error("API Error"); // Uncomment if you want
    return Promise.reject(error);
  }
);

// Utility function for API calls
const apiRequest = async ({ method, data, url, contentType, ...rest }) => {
  try {
    const response = await AxiosDefault({
      method,
      url,
      data,
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...rest.headers, // Merge in any extra headers passed
      },
      ...rest,
    });
    return response;
  } catch (error) {
    // Optionally handle errors globally here
    throw error;
  }
};

export default apiRequest;
