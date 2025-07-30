import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Polyfills for browser compatibility
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)