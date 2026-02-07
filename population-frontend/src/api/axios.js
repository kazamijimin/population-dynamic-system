import axios from "axios";

const api = axios.create({
  baseURL: "https://coffee-grind.onrender.com/api",
  withCredentials: true,
});

export default api;