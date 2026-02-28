import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accreditai_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and token refresh
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) prom.resolve(token);
        else prom.reject(error);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't try to refresh for auth endpoints or if already retried
        const isAuthEndpoint = originalRequest.url?.includes('/auth/');
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                // Queue this request until the token is refreshed
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject: (err: unknown) => reject(err),
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('accreditai_refresh_token');
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken,
                });

                // Backend wraps: { success, data: { accessToken, refreshToken } }
                const payload = data.data || data;
                const newAccessToken = payload.accessToken || payload.token;
                const newRefreshToken = payload.refreshToken;

                localStorage.setItem('accreditai_token', newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem('accreditai_refresh_token', newRefreshToken);
                }

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('accreditai_token');
                localStorage.removeItem('accreditai_refresh_token');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle 403 — onboarding required
        if (error.response?.status === 403) {
            const msg = error.response.data?.message || '';
            if (msg.toLowerCase().includes('onboarding') && typeof window !== 'undefined') {
                // Only redirect once, don't fire for every parallel request
                if (!window.location.pathname.includes('/onboarding')) {
                    window.location.href = '/onboarding';
                }
                return new Promise(() => { }); // Swallow the error to prevent toast spam
            }
        }

        return Promise.reject(error);
    }
);

export default api;
