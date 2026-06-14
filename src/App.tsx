import { type ReactNode } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, ShieldCheck, Sparkles } from 'lucide-react';
import Navbar, { Header } from './components/Navigation';
import PublicOpportunitiesList from './components/PublicOpportunitiesList';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ResetPassword from './pages/ResetPassword';
import AdminOpportunityAutomationPage from './pages/AdminOpportunityAutomationPage';
import Auth from './pages/Auth';
import { useAuth } from './contexts/AuthContext';

function PublicShell({ children, title }: { children: ReactNode; title: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname === '/opportunities' ? 'opportunities' : 'home';

  return (
    <div className="min-h-screen bg-surface pb-24 pt-20">
      <Header title={title} />
      <main>{children}</main>
      <Navbar activeTab={activeTab} setActiveTab={(tab) => navigate(tab === 'opportunities' ? '/opportunities' : '/')} />
    </div>
  );
}

function PublicHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-purple-50">
      <section className="mx-auto max-w-5xl px-4 pb-8 pt-8 text-center sm:px-6" dir="rtl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary text-secondary shadow-xl shadow-primary/20">
          <Sparkles size={30} />
        </div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-primary">Jamiaati Public Beta</p>
        <h1 className="text-4xl font-black leading-tight text-secondary sm:text-5xl">فرص الطلاب في مكان واحد</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-7 text-slate-500">
          تصفح فرص العمل، التدريب، المنح، الفعاليات، والإعلانات المعتمدة من رافد بدون تسجيل دخول.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/opportunities" className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-black text-white transition hover:bg-primary hover:text-secondary">
            عرض كل الفرص <ArrowLeft size={16} />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-4">
        <PublicOpportunitiesList compact />
      </section>
    </div>
  );
}

function AdminGate({ children }: { children: ReactNode }) {
  const { profile, isLoading } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Auth adminOnly />;
  }

  return <>{children}</>;
}

function AdminUnavailable() {
  return (
    <AdminGate>
      <div className="flex min-h-screen items-center justify-center bg-surface p-6 text-center" dir="rtl">
        <div className="max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
          <ShieldCheck className="mx-auto mb-4 text-primary" size={42} />
          <h1 className="text-2xl font-black text-secondary">هذه الصفحة مخفية في النسخة العامة</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-500">
            إدارة الحملات والتواصل غير متاحة من واجهة المستخدم العامة.
          </p>
        </div>
      </div>
    </AdminGate>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Auth adminOnly />} />
      <Route path="/admin/outreach" element={<AdminUnavailable />} />
      <Route path="/admin/opportunity-automation" element={<AdminUnavailable />} />
      <Route path="/opportunities" element={<PublicShell title="الفرص"><OpportunitiesPage /></PublicShell>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<PublicShell title="جامعتي"><PublicHome /></PublicShell>} />
    </Routes>
  );
}
