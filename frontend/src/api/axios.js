// src/api/axios.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true, // 👈 Critical for sending cookies
});

export default apiClient;