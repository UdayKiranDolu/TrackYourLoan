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

// ✅ Safe API URL with fallback
const getApiBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_API_URL;

    if (!envUrl) {
        console.warn('VITE_API_URL is not defined, using default');
        // Fallback for development
        if (import.meta.env.DEV) {
            return 'http://localhost:4000/api';
        }
        throw new Error('VITE_API_URL must be defined in production');
    }

    // Remove trailing slash if present, then add /api
    return `${envUrl.replace(/\/$/, '')}/api`;
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL); // Debug log (remove in production)

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000, // ✅ Add timeout (10 seconds)
});

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // ✅ Debug log for development
        if (import.meta.env.DEV) {
            console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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

        // ✅ Handle network errors
        if (!error.response) {
            console.error('Network Error:', error.message);
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        // Handle 401 - Token expired
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
                        `${API_BASE_URL}/auth/refresh`, // ✅ Use API_BASE_URL constant
                        { refreshToken },
                        { withCredentials: true }
                    );

                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    clearAuthAndRedirect();
                    return Promise.reject(refreshError);
                }
            } else {
                clearAuthAndRedirect();
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

// ✅ Helper function to avoid code duplication
const clearAuthAndRedirect = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export default api;
export { API_BASE_URL }; // ✅ Export for use elsewhere if needed
