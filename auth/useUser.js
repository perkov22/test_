import {useEffect} from 'react';
import useApi from '../api/useApi';

export const useUser = async () => {
  try {
    const api = useApi();
    const res = await api.get('/api/auth/user');

    return res;
  } catch (e) {
    console.log(e);
  }
};
