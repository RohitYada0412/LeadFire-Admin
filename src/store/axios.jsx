import axios from "axios";
import { toast } from "react-toastify";
import { baseURL } from "../utils/service";

const APIENDPOINT = baseURL;

const instance = axios.create({
  baseURL: APIENDPOINT,
});

instance.interceptors.request.use((request) => {
  request.headers.Authorization = `${process.env.REACT_APP_TOKEN}`;
  return request;
});

instance.interceptors.response.use(
  (results) => {
    return results.data;
  },
  (error) => {
    if (error.response.status === 401) {
      // localStorage.clear()
      window.location.href = "/login";
    } else if (error.response.status) {
      toast.error(error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

export default instance;
