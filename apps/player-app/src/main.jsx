import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthGateway } from '@swish/identity'
import App from './App.jsx' 
import '@swish/ui/src/App.css' // 👈 Ton fameux fichier CSS global partagé !

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* On adapte le portail de connexion pour les joueurs */}
    <AuthGateway appName="Swish App" appIcon="🔥">
      <App /> 
    </AuthGateway>
  </React.StrictMode>
)