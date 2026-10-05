// Pre-typed hooks: components import these instead of the plain react-redux hooks,
// so RootState and the thunk-aware AppDispatch are never repeated (react-redux 9.1+ `.withTypes`).
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
