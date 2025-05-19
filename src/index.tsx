import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { MapInitProvider } from './context/MapInitContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  // <React.StrictMode>
  <MapInitProvider>
    <App />
  </MapInitProvider>,
  // </React.StrictMode>,
);
