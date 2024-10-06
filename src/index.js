import React from 'react';
import ReactDOM from 'react-dom/client'; // using 'react-dom/client' for React 18
import App from './App'; // ensure this path is correct

// create a root for rendering the app
const root = ReactDOM.createRoot(document.getElementById('root'));

// render the App component within StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
