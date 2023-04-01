import MainPage from '@pages/MainPage';
import { useEffect } from 'react';
import { getAuth } from '@api/calendar_api';

const App = () => {
  useEffect(() => {
    getAuth();
  });

  return (
    <>
      <header></header>
      <MainPage />
      <footer></footer>
    </>
  );
};

export default App;
