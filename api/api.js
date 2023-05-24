import {useQuery} from 'react-query';

import useApi from '../api/useApi';

export default function useUser(config = {}) {
  const api = useApi();
  return useQuery(
    'user',
    () => api.get('/api/users/user').then(resp => resp[0]),
    {
      staleTime: 'Infinity',
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  );
}
