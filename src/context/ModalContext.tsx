import { createContext, Dispatch, useReducer, useContext } from 'react';

interface ModalState {
  isVisible: boolean;
  target: any;
}

const initialState: ModalState = {
  isVisible: false,
  target: null,
};

function modalReducer(prevState: ModalState, action: any) {
  switch (action.type) {
    case 'showModal': {
      return { ...prevState, isVisible: true, target: action.payload };
    }

    case 'hideModal': {
      const result = {
        ...prevState,
        isVisible: false,
        target: null,
      };

      return result;
    }

    default:
      return prevState;
  }
}

const ModalStatContext = createContext<any>({
  state: initialState,
});

const ModalDispatchContext = createContext<{
  dispatch: Dispatch<any>;
}>({
  dispatch: () => {},
});

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalState, modalDispatch] = useReducer(modalReducer, initialState);
  return (
    <ModalStatContext.Provider value={modalState}>
      <ModalDispatchContext.Provider value={{ dispatch: modalDispatch }}>
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
  return context.dispatch;
};
