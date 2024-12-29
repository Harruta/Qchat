import axios from "axios";

export const axiosInstance = axios.created({
    baseURL: "http://localhost:5001/api",
    withCredentials: true,
});