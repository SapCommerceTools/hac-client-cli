import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

// GitHub Pages SPA redirect: restore path from ?p= query param
const params = new URLSearchParams(window.location.search)
const redirectPath = params.get('p')
if (redirectPath) {
  // Replace the URL to the actual path (no reload, just history)
  window.history.replaceState(null, '', '/hac-client-cli' + redirectPath)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/hac-client-cli">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
