import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Calendar from '@components/Calendar';
// import '@components/commons/_variables.scss';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <App />
    {/* <Calendar /> */}
  </React.StrictMode>,
);
