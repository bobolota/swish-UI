import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthGateway } from '@swish/identity'
import App from './App' // <-- On importe App au lieu de Dashboard
import '@swish/ui/src/App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGateway appName="Swish Admin" appIcon="🏀">
      <App /> {/* <-- App gère maintenant l'affichage des pages */}
    </AuthGateway>
  </React.StrictMode>
)