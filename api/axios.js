import axios from 'axios';
import Config from 'react-native-config';
import qs from 'qs';

const BASE_URL = 'https://joblink-server.vercel.app';

const useLocal = false;

const localAuthToken = 'bG9jYWxjbGllbnQ6bG9jYWxzZWNyZXQ=';
const devAuthToken = 'ZGV2Y2xpZW50OmRldnNlY3JldA==';
const authToken = useLocal ? localAuthToken : devAuthToken;

export const axiosAuth = axios.create({
  baseURL: BASE_URL,
});

const axiosMain = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  timeoutErrorMessage: 'Timeout',
});

axiosMain.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default axiosMain;
