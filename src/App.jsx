import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/public/Home';
import Services from './pages/public/Services';
import Tarifs from './pages/public/Tarifs';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Prestataires from './pages/public/Prestataires';
import PrestataireProfile from './pages/public/PrestataireProfile';
import DashboardClient from './pages/client/DashboardClient';
import DashboardPrestataire from './pages/prestataire/DashboardPrestataire';
import AdminDashboard from './pages/admin/AdminDashboard';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Reservation from './pages/Reservation';
import { NotFound, Legal, Privacy, Terms } from './pages/public/Misc';

function Page({ children, noLayout = false }) {
  if (noLayout) return children;
  return <MainLayout>{children}</MainLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Page><Home /></Page>} />
        <Route path="/services" element={<Page><Services /></Page>} />
        <Route path="/tarifs" element={<Page><Tarifs /></Page>} />
        <Route path="/a-propos" element={<Page><About /></Page>} />
        <Route path="/contact" element={<Page><Contact /></Page>} />
        <Route path="/prestataires" element={<Page><Prestataires /></Page>} />
        <Route path="/prestataires/:id" element={<Page><PrestataireProfile /></Page>} />
        <Route path="/connexion" element={<Page noLayout><Login /></Page>} />
        <Route path="/inscription" element={<Page noLayout><Register /></Page>} />
        <Route path="/mentions-legales" element={<Page><Legal /></Page>} />
        <Route path="/confidentialite" element={<Page><Privacy /></Page>} />
        <Route path="/cgu" element={<Page><Terms /></Page>} />

        {/* Routes protégées — tous les utilisateurs connectés */}
        <Route path="/notifications" element={<Page><PrivateRoute><Notifications /></PrivateRoute></Page>} />
        <Route path="/messages" element={<Page><PrivateRoute><Messages /></PrivateRoute></Page>} />
        <Route path="/reserver" element={<Page><PrivateRoute><Reservation /></PrivateRoute></Page>} />

        {/* Routes protégées — client */}
        <Route path="/dashboard/client" element={<Page noLayout><PrivateRoute roles={['client']}><DashboardClient /></PrivateRoute></Page>} />

        {/* Routes protégées — prestataire */}
        <Route path="/dashboard/prestataire" element={<Page noLayout><PrivateRoute roles={['prestataire']}><DashboardPrestataire /></PrivateRoute></Page>} />

        {/* Routes protégées — admin */}
        <Route path="/admin/dashboard" element={<Page noLayout><PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute></Page>} />

        <Route path="*" element={<Page><NotFound /></Page>} />
      </Routes>
    </BrowserRouter>
  );
}