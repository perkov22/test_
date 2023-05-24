import AsyncStorage from '@react-native-async-storage/async-storage';
import {createContext, useState, useCallback, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Center, Spinner} from 'native-base';
import Toast from 'react-native-toast-message';

const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
  const [loading, setLoading] = useState(true);
  const [auth, _setAuth] = useState();

  // user finished onboarding, movr to separate context e.g. UserSettings?
  const [finishedOnboarding, _setFinishedOnboarding] = useState(false);

  const setAuth = useCallback(
    async ({access_token, refresh_token, roleId, isFirstLogin = false}) => {
      await AsyncStorage.multiSet([
        ['access_token', access_token],
        ['refresh_token', refresh_token],
        ['roleId', JSON.stringify(roleId)],
      ]);

      _setAuth({access_token, refresh_token, roleId, isFirstLogin});
    },
    [],
  );

  const setFinishedOnboarding = useCallback(
    async finished => {
      await AsyncStorage.setItem(
        'finishedOnboarding',
        finished ? 'true' : 'false',
      );
      _setFinishedOnboarding(finished);
    },
    [_setFinishedOnboarding],
  );

  const setAuthKey = useCallback(async (key, value) => {
    await AsyncStorage.setItem(key, value);
    _setAuth(prev => ({...prev, [key]: value}));
    return value;
  }, []);

  const clearAuth = useCallback(async alert => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'roleId']);
    _setAuth();
    if (alert) {
      Toast.show({
        type: 'error',
        text1: 'Auth message',
        text2: alert,
      });
    }
  }, []);

  const loadAuth = useCallback(async () => {
    try {
      const isFinishedOnboarding = await AsyncStorage.getItem(
        'finishedOnboarding',
      );
      _setFinishedOnboarding(isFinishedOnboarding === 'true' ? true : false);

      const access_token = await AsyncStorage.getItem('access_token');
      const refresh_token = await AsyncStorage.getItem('refresh_token');
      const roleId = await AsyncStorage.getItem('roleId');

      if (!access_token || !refresh_token || !roleId) {
        throw 'No auth data';
      }

      _setAuth({access_token, refresh_token, roleId});
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('AUTH: error loading auth from async storage');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        setAuthKey,
        clearAuth,
        finishedOnboarding,
        setFinishedOnboarding,
        loading,
      }}>
      {loading ? (
        // TODO: FIX ME, use splash
        <Center flex="1" bg="white">
          <Spinner size="lg" color="orange.400" />
        </Center>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
