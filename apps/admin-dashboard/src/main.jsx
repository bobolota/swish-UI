import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthGateway } from '@swish/identity'
import Dashboard from './Dashboard'
import '@swish/ui/src/App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGateway appName="Swish Admin" appIcon="🏀">
      <Dashboard />
    </AuthGateway>
  </React.StrictMode>
)