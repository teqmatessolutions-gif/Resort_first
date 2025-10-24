// src/services/api.js
import axios from "axios";

// Set your backend API base URL
const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? "https://www.teqmates.com" : "http://localhost:8000",
});

// Automatically add token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;

