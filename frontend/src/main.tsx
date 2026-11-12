import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Desregistra cualquier Service Worker viejo para evitar pantalla en blanco
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const reg of registrations) {
      reg.unregister()
    }
  })
}

const root = document.getElementById('root')
if (!root) throw new Error('No se encontró el elemento #root')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
