import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Services from './pages/Services';
import Tarifs from './pages/Tarifs';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Prestataires from './pages/Prestataires';
import PrestataireProfile from './pages/PrestataireProfile';
import DashboardClient from './pages/DashboardClient';
import DashboardPrestataire from './pages/DashboardPrestataire';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Reservation from './pages/Reservation';
import { NotFound, Legal, Privacy, Terms } from './pages/Misc';

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
        <Route path="/dashboard/client" element={<Page><PrivateRoute roles={['client']}><DashboardClient /></PrivateRoute></Page>} />

        {/* Routes protégées — prestataire */}
        <Route path="/dashboard/prestataire" element={<Page><PrivateRoute roles={['prestataire']}><DashboardPrestataire /></PrivateRoute></Page>} />

        {/* Routes protégées — admin */}
        <Route path="/admin/dashboard" element={<Page><PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute></Page>} />

        <Route path="*" element={<Page><NotFound /></Page>} />
      </Routes>
    </BrowserRouter>
  );
}
