import { createContext, useReducer } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from '@pages/MainPage';
import LoginPage from '@pages/LoginPage';
import PrivacyPage from '@pages/PrivacyPage';
import { HistoryType, StringKeyObj } from '@src/types';
import { ModalProvider } from '@src/context/ModalContext';
import { BookmarkProvider } from '@src/context/BookMarkContext';
import { AuthProvider } from '@src/context/AuthContext';
import '@src/App.scss';

export const UseDispatch = createContext<Function>(() => { });

const AuthenticatedApp = () => {
  const initialState = {
    histories: {},
  };
  const reducer = (prevState: typeof initialState, action: StringKeyObj) => {
    switch (action.type) {
      case 'setHistory': {
        return {
          ...prevState,
          histories: { ...(action.payload as HistoryType) },
        };
      }

      default:
        return prevState;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <UseDispatch.Provider value={dispatch}>
      <BookmarkProvider>
        <ModalProvider>
          <MainPage state={state} />
        </ModalProvider>
      </BookmarkProvider>
    </UseDispatch.Provider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthenticatedApp />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
