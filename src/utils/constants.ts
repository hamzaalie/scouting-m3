// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/auth/login/',
    REGISTER: '/users/auth/register/',
    REFRESH: '/users/auth/token/refresh/',
    LOGOUT: '/users/auth/logout/',
    ME: '/users/auth/me/',
    UPDATE_PROFILE: '/users/auth/update-profile/',
    CHANGE_PASSWORD: '/users/auth/change-password/',
    PASSWORD_RESET: '/users/auth/password-reset/',
  },
  PLAYERS: {
    LIST: '/players/',
    DETAIL: (id: number) => `/players/${id}/`,
  },
  MATCHES: {
    LIST: '/matches/',
    DETAIL: (id: number) => `/matches/${id}/`,
  },
  STATS: {
    LIST: '/stats/',
    DETAIL: (id: number) => `/stats/${id}/`,
  },
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  PLAYER: 'player',
  SCOUT: 'scout',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

