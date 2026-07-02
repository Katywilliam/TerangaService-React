import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Support from '../components/Support';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Support />
    </div>
  );
}
