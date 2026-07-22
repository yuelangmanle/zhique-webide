import { useEffect, useState } from 'react';
import { appStore } from '../store/appStore';
import { type AppState } from '../types';

export const useStore = (): AppState => {
  const [state, setState] = useState<AppState>(appStore.getState());

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setState(appStore.getState());
    });
    return unsubscribe;
  }, []);

  return state;
};