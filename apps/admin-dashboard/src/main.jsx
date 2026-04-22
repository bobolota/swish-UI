import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthGateway } from '@swish/identity'
import Dashboard from './Dashboard'
import '@swish/ui/src/app.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGateway appName="Swish Admin" appIcon="🏀">
      <Dashboard />
    </AuthGateway>
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* L'AuthGateway orchestre tout : 
      - Login/Register si pas de session
      - ProfileForm si session mais profil incomplet
      - Affiche les 'children' (ton app) si tout est OK
    */}
    <AuthGateway appName="Swish Admin" appIcon="🏀">
      <DashboardPlaceholder />
    </AuthGateway>
  </React.StrictMode>
)