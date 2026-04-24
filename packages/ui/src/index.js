import './app.css'; // Ou './App.css' selon la majuscule de ton fichier

// Les Atomes simples (on peut garder les accolades)
export { Button } from './components/button';
export { Badge } from './components/badge';
export { Input } from './components/input';
export { Label } from './components/label';
export { Switch } from './components/switch';
export { Textarea } from './components/textarea';
export { Skeleton } from './components/skeleton';
export { AdminLayout } from './components/AdminLayout';
export { KanbanBoard } from "./components/KanbanBoard";

// Les Composants Complexes (on met des étoiles pour exporter toutes leurs sous-pièces d'un coup !)
export * from './components/avatar';
export * from './components/card';
export * from './components/dialog';
export * from './components/select';
export * from './components/table';
export * from './components/tabs';
export * from './components/dropdown-menu';
export * from './components/checkbox';
export * from './components/NextMatchWidget';
export * from './components/popover';
export * from './components/PremiumStatsWidget';
export * from './components/Sidebar';
export * from './components/Topbar';
export * from './components/TournamentCard';
export * from './components/PaymentStatusToggle';
export { TeamRosterPanel } from './components/TeamRosterPanel';

// Le cas particulier
export { Calendar } from './components/calendar';
export { Toaster } from './components/sonner';