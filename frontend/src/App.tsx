import React, { useEffect } from 'react';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { KeyboardShortcutProvider } from './contexts/KeyboardShortcutContext';
import { AuthProvider } from './contexts/AuthContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GlobalStateProvider } from './contexts/GlobalStateContext';
import { ThemeToggle } from './components/ThemeToggle';
import { TokenExpiryHandler } from './components/TokenExpiryHandler';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { createSkipLink, landmarkRoles } from './utils/accessibility';
import { BreadcrumbNavigation } from './components/BreadcrumbNavigation';
import AppRoutes from './routes/AppRoutes';
import { useTranslation } from './i18n/useTranslation';
import { trackPageView } from './services/analyticsService';
import './index.css';

const AppContent: React.FC = () => {
  useGlobalShortcuts();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const skipLink = createSkipLink('main-content');
    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header role={landmarkRoles.banner} className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('appTitle')}</h1>
              <p className="text-sm text-muted-foreground">{t('home.welcomeDescription')}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <nav role={landmarkRoles.navigation} aria-label="Main navigation" className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between py-3 gap-3">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <Link
                to="/"
                className={`transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/dashboard"
                className={`transition-colors hover:text-primary ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {t('nav.dashboard')}
              </Link>
              <Link
                to="/analytics"
                className={`transition-colors hover:text-primary ${isActive('/analytics') ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {t('nav.analytics')}
              </Link>
              <Link
                to="/tree"
                className={`transition-colors hover:text-primary ${isActive('/tree') ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {t('nav.tree')}
              </Link>
              <Link
                to="/faq"
                className={`transition-colors hover:text-primary ${isActive('/faq') ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {t('nav.faq')}
              </Link>
            </div>

            <div className="md:hidden">
              <select
                value={location.pathname}
                onChange={(e) => (window.location.href = e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
                aria-label="Mobile navigation"
              >
                <option value="/">{t('nav.home')}</option>
                <option value="/dashboard">{t('nav.dashboard')}</option>
                <option value="/analytics">{t('nav.analytics')}</option>
                <option value="/tree">{t('nav.tree')}</option>
                <option value="/faq">{t('nav.faq')}</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" role={landmarkRoles.main} className="container mx-auto px-4 py-8" tabIndex={-1}>
        <BreadcrumbNavigation />
        <AppRoutes />
      </main>

      <footer role={landmarkRoles.contentinfo} className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {t('appTitle')}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <KeyboardShortcutProvider>
        <GlobalStateProvider>
          <ThemeProvider>
            <AuthProvider>
              <PaymentProvider>
                <NotificationProvider>
                  <TokenExpiryHandler />
                  <AppContent />
                </NotificationProvider>
              </PaymentProvider>
            </AuthProvider>
          </ThemeProvider>
        </GlobalStateProvider>
      </KeyboardShortcutProvider>
    </BrowserRouter>
  );
};

export default App;
