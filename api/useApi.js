import {useEffect} from 'react';

import useRefreshToken from '../auth/useRefreshToken';
import useAuth from '../auth/useAuth';
import client from './axios';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

const isTokenExpired = status => status === 403;

const isTokenInvalid = error => error === 403;

const useApi = () => {
  const refresh = useRefreshToken();
  const {auth, clearAuth} = useAuth();

  useEffect(() => {
    const requestIntercept = client.interceptors.request.use(
      config => {
        if (!config.headers['x-access-token']) {
          config.headers['x-access-token'] = `${auth.access_token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    const responseIntercept = client.interceptors.response.use(
      response => response,
      async error => {
        const originalConfig = error;

        if (error.response || originalConfig.response.status == 500) {
          if (isTokenExpired(error.response.status) && !originalConfig._retry) {
            originalConfig._retry = true;
            const newAccessToken = await refresh();
            console.log('refresh');
            originalConfig.headers['x-access-token'] = `${newAccessToken}`;
            return client(originalConfig);
          } else if (originalConfig.response.status == 500) {
            Toast.show({
              type: 'error',
              text1: originalConfig.response.data.message,
            });
          } else {
            clearAuth('Logout!');
          }
        } else if (isTokenInvalid(403)) {
          clearAuth('Invalid access, you have been logged out access!');
        }
        console.log(originalConfig.response, 'Errrorrrrr');

        return Promise.reject(error);
      },
    );

    return () => {
      client.interceptors.request.eject(requestIntercept);
      client.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh, clearAuth]);

  return client;
};

export default useApi;
