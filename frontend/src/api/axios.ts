// // frontend/src/services/api.ts

// import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// const API_BASE_URL = '/api';

// const api = axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // Request interceptor
// api.interceptors.request.use(
//     (config: InternalAxiosRequestConfig) => {
//         const token = localStorage.getItem('accessToken');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // Response interceptor
// api.interceptors.response.use(
//     (response) => response,
//     async (error: AxiosError<{ error?: string; message?: string; code?: string }>) => {
//         const originalRequest = error.config as InternalAxiosRequestConfig & {
//             _retry?: boolean;
//         };

//         // Handle 401 - Token expired (but NOT for login requests)
//         if (
//             error.response?.status === 401 &&
//             !originalRequest._retry &&
//             !originalRequest.url?.includes('/auth/login') &&
//             !originalRequest.url?.includes('/auth/register')
//         ) {
//             originalRequest._retry = true;

//             const refreshToken = localStorage.getItem('refreshToken');

//             if (refreshToken) {
//                 try {
//                     const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
//                         refreshToken,
//                     });

//                     const { accessToken, refreshToken: newRefreshToken } = response.data.data;

//                     localStorage.setItem('accessToken', accessToken);
//                     localStorage.setItem('refreshToken', newRefreshToken);

//                     originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//                     return api(originalRequest);
//                 } catch (refreshError) {
//                     // Refresh failed - logout
//                     localStorage.removeItem('accessToken');
//                     localStorage.removeItem('refreshToken');
//                     localStorage.removeItem('user');
//                     window.location.href = '/login';
//                     return Promise.reject(refreshError);
//                 }
//             } else {
//                 // No refresh token - logout
//                 localStorage.removeItem('accessToken');
//                 localStorage.removeItem('refreshToken');
//                 localStorage.removeItem('user');
//                 window.location.href = '/login';
//             }
//         }

//         // Handle 403 - Force password reset
//         if (
//             error.response?.status === 403 &&
//             error.response?.data?.error === 'Password change required'
//         ) {
//             window.location.href = '/change-password-required';
//             return Promise.reject(error);
//         }

//         // DON'T show toast for login/register errors - let the component handle it
//         // This allows the Login form to display the error properly

//         return Promise.reject(error);
//     }
// );

// export default api;














import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL + '/api'; // ← production backend

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // important if using cookies
});

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ error?: string; message?: string; code?: string }>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Handle 401 - Token expired (but NOT for login/register)
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/register')
        ) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
                        { refreshToken },
                        { withCredentials: true }
                    );

                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        // Handle 403 - Force password reset
        if (
            error.response?.status === 403 &&
            error.response?.data?.error === 'Password change required'
        ) {
            window.location.href = '/change-password-required';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;
