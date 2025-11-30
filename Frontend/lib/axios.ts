import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem('transitma_user');
        if (storedUser) {
            const { tokens } = JSON.parse(storedUser);
            if (tokens?.accessToken) {
                config.headers.Authorization = `Bearer ${tokens.accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const storedUser = localStorage.getItem('transitma_user');
                if (storedUser) {
                    const { tokens } = JSON.parse(storedUser);
                    if (tokens?.refreshToken) {
                        const response = await axios.post('http://localhost:8080/api/v1/auth/refresh', {
                            refreshToken: tokens.refreshToken,
                        });

                        const { accessToken, refreshToken } = response.data;

                        // Update local storage with new tokens
                        const userData = JSON.parse(storedUser);
                        userData.tokens = { accessToken, refreshToken };
                        localStorage.setItem('transitma_user', JSON.stringify(userData));

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                // If refresh fails, logout user
                localStorage.removeItem('transitma_user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
