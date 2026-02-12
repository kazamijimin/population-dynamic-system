import axios from "axios";

const api = axios.create({
  baseURL: "https://coffee-grind.onrender.com/api",
  // baseURL: "http://localhost:5173/api",
  withCredentials: true,
});

export default api;