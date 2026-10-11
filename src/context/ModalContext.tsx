import { createContext, Dispatch, useReducer, useContext } from 'react';
import type { Restaurant, VisitWithPlace } from '@src/types';

// 일정 추가 모달이 저장에 성공하면 새 방문 일정을 넘겨 호출한다 (캘린더에 바로 반영)
type VisitAddedCallback = (visit: VisitWithPlace) => void;

type ModalAction =
  | { type: 'showModal'; payload: Restaurant; callbackFn?: VisitAddedCallback }
  | { type: 'hideModal' };

type ModalState = {
  isVisible: boolean;
  target: Restaurant | null;
  callbackFn?: VisitAddedCallback;
};

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
