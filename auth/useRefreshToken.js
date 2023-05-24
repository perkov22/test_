import AsyncStorage from '@react-native-async-storage/async-storage';

import {axiosAuth} from '../api/axios';
import useAuth from './useAuth';

const REFRESH_ERROR = 'Invalid Refresh Token';
// temp global variable used to prevent multiple API calls in case the interceptor is called multiple times in a row
let isRefreshing = false;

const useRefreshToken = () => {
  const {setAuth, auth, clearAuth} = useAuth();

  const refresh = async () => {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const response = await axiosAuth.get('/api/users/token', {
          headers: {
            'x-access-token': auth.refresh_token,
            'Content-Type': 'application/json',
          },
        });
        console.log('token sended');
        console.log(response.data);
        await setAuth({...response.data});
        return response.data.access_token;
      } catch (error) {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          clearAuth(REFRESH_ERROR);
        }
        // throw so that useApi does not repeat faild call
        throw error;
      } finally {
        isRefreshing = false;
      }
    }
  };

  return refresh;
};

export default useRefreshToken;
