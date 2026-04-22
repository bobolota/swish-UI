import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthGateway } from '@swish/identity'
import App from './App' // ✅ NOUVEAU : On importe App.jsx
import '@swish/ui/src/App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGateway appName="Swish Admin" appIcon="🏀">
      <App /> {/* ✅ NOUVEAU : C'est le routeur qui gère l'affichage */}
    </AuthGateway>
  </React.StrictMode>
)