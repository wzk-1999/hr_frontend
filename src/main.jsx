import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  // If you're running your app in development mode and have Strict Mode enabled,
  //  React will intentionally double-call certain lifecycle methods and hooks,
  //   including useEffect.
  //    This is to help catch side effects that are not properly managed.
    <App />
  // </StrictMode>,
)
