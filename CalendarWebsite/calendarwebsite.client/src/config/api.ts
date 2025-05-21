const isDevelopment = process.env.NODE_ENV === 'development';

export const API_URL = isDevelopment 
    ? 'https://localhost:44356'  // Development
    : 'https://staffcalendarserver-may.onrender.com';  // Production

export const CLIENT_URL = isDevelopment
    ? 'https://localhost:50857'  // Development
    : 'https://staff-calendar-5efr.vercel.app';  // Production

export const getApiUrl = (endpoint: string) => `${API_URL}${endpoint}`; 