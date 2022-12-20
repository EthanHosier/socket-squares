import axios from 'axios';
const BASE_URL = 'http://localhost:3500'

export default axios.create({
    baseURL: BASE_URL
});

//private so we can add interceptors (to attach refresh token to it + request when failure request due to timed-out token)
export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: {'Content-Type': 'application/json'},
    withCredentials: true,
});