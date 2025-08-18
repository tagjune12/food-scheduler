import React from 'react';
import ReactDOM from 'react-dom/client';
import '@src/index.css';
import App from '@src/App';
import { MapInitProvider } from '@src/context/MapInitContext';

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
