import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

// LE LAYOUT (Choisis UNE SEULE de ces deux lignes, efface l'autre !)
// Si tu as choisi l'Option A (dans tes packages) :
import { AdminLayout } from '@swish/ui'; 

// TES 3 PAGES
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ControlCenter } from './pages/ControlCenter/ControlCenter';
import { MatchZone } from './pages/MatchZone/MatchZone';

// ... la suite de ton code (function AppContent...)

// ------------------------------------------------------------------
// LE CHEF D'ORCHESTRE (Relie le Menu et le Routeur)
// ------------------------------------------------------------------
function AppContent({ user, logout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Déduction de l'onglet actif grâce à l'URL
  let activeTab = 'dashboard';
  if (location.pathname.includes('/control-center')) activeTab = 'control-center';
  if (location.pathname.includes('/match-zone')) activeTab = 'match-zone';

  // 2. Le dictionnaire de navigation (Sécurisé par les rôles)
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊', path: '/' },
    
    // N'apparaît que si l'utilisateur est Premium
    ...(user?.isPremium ? [
      { id: 'control-center', label: 'Centre de Contrôle', icon: '⚙️', path: '/control-center' }
    ] : []),
    
    { id: 'match-zone', label: 'Zone de Match', icon: '哨', path: '/match-zone' }
  ];

  return (
    <AdminLayout
      appName="Swish OS"
      appIcon="🏢"
      user={user}
      logout={logout}
      menuItems={menuItems}
      activeTab={activeTab}
      // Quand on clique sur le menu, on demande au Routeur de changer l'URL
      setActiveTab={(tabId) => {
        const item = menuItems.find(i => i.id === tabId);
        if (item) navigate(item.path);
      }}
    >
      {/* C'est ici que React Router décide quelle page injecter */}
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/control-center/*" element={<ControlCenter user={user} />} />
        
        {/* L'astuce du /* permet de gérer les sous-routes comme /match-zone/123 plus tard */}
        <Route path="/match-zone/*" element={<MatchZone user={user} />} />
      </Routes>
    </AdminLayout>
  );
}

// ------------------------------------------------------------------
// LE POINT D'ENTRÉE (Gère l'écran de connexion global)
// ------------------------------------------------------------------
export default function App() {
  // Remplacer par ton vrai useAuth() quand il sera prêt
  // Pour l'instant, on simule un utilisateur connecté et premium
  const mockUser = { 
    id: 'user-123', 
    email: 'admin@swishos.com', 
    isPremium: true 
  };

  const logout = () => toast.info("Déconnexion...");

  if (!mockUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Toaster richColors />
        <div className="w-full max-w-md p-6 bg-white rounded-xl text-center space-y-4">
          <div className="text-4xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold">Swish OS</h1>
          <p className="text-slate-500 text-sm">Veuillez vous connecter.</p>
          {/* Ton formulaire de login ira ici */}
        </div>
      </div>
    );
  }

  // Si on est connecté, on lance le Routeur !
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <AppContent user={mockUser} logout={logout} />
    </BrowserRouter>
  );
}