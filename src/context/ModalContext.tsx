import { createContext, Dispatch, useReducer, useContext } from 'react';
import type { Restaurant } from '@src/types';

type ModalAction =
  | { type: 'showModal'; payload: Restaurant; callbackFn?: (event?: unknown) => void }
  | { type: 'hideModal' };

interface ModalState {
  isVisible: boolean;
  target: Restaurant | null;
  callbackFn?: (event?: unknown) => void;
}

const initialState: ModalState = {
  isVisible: false,
  target: null,
  callbackFn: undefined,
};

function modalReducer(prevState: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'showModal': {
      return {
        ...prevState,
        isVisible: true,
        target: action.payload,
        callbackFn: action.callbackFn,
      };
    }

    case 'hideModal': {
      return {
        ...prevState,
        isVisible: false,
        target: null,
        callbackFn: undefined,
      };
    }

    default:
      return prevState;
  }
}

const ModalStatContext = createContext<ModalState | undefined>(undefined);

const ModalDispatchContext = createContext<Dispatch<ModalAction> | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalState, modalDispatch] = useReducer(modalReducer, initialState);
  return (
    <ModalStatContext.Provider value={modalState}>
      <ModalDispatchContext.Provider value={modalDispatch}>
        {children}
      </ModalDispatchContext.Provider>
    </ModalStatContext.Provider>
  );
};

// Custom hooks to use the modal context
export const useModalState = () => {
  const context = useContext(ModalStatContext);
  if (context === undefined) {
    throw new Error('useModalState must be used within a ModalProvider');
  }
  return context;
};

export const useModalDispatch = () => {
  const context = useContext(ModalDispatchContext);
  if (context === undefined) {
    throw new Error('useModalDispatch must be used within a ModalProvider');
  }
  return context;
};
