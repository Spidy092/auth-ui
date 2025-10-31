// admin-ui/src/services/api.js
import { auth } from '@spidy092/auth-client';

// ✅ Use auth-client's built-in API instance
export default auth.api; // This already has interceptors, base URL, etc.

// Or if you need custom config:
// import axios from 'axios';
// 
// const api = axios.create({
//   baseURL: 'http://localhost:4000',
//   withCredentials: true,
// });
// 
// // Add auth interceptors
// api.interceptors.request.use((config) => {
//   const token = auth.getToken();
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
// 
// export default api;
