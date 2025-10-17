// Axios in// src/services/api.js
import axios from "axios";

// Set your backend API base URL
const API = axios.create({
  baseURL: "http://localhost:8000", // update if hosted remotely
});

// Automatically add token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;

