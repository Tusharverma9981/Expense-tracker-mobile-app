import axios from 'axios';

const api = axios.create({
  baseURL: 'https://expense-tracker-1-m5kv.onrender.com/api',
  withCredentials: true,
});

export default api;
