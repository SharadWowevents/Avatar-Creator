import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({
  theme,
  toggleTheme,
  backendHealth,
  savedCount,
  onOpenSaved,
}) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header>
      <div className="header-top">
        <div>
          <Link to={isAuthenticated ? '/' : '/login'} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Customer Avatar Creator</h1>
          </Link>
          
        </div>

        <div className="header-actions">
          {/* AI Model indicator */}
          {/* <span
            className={`chip status-chip ${
              backendHealth.aiConfigured ? 'online' : ''
            }`}
            title={
              backendHealth.aiConfigured
                ? `Active Model: ${backendHealth.aiModel || 'GPT-6 Luna'} (OpenAI API key configured)`
                : `Target Model: ${backendHealth.aiModel || 'GPT-6 Luna'} (Add OPENAI_API_KEY to backend/.env)`
            }
          >
            🤖 {backendHealth.aiModel || 'GPT-6 Luna'}
          </span> */}

          {/* Health indicator */}
          {/* <span
            className={`chip status-chip ${
              backendHealth.mongoConnected ? 'online' : 'offline'
            }`}
            title={
              backendHealth.mongoConnected
                ? 'MongoDB Connected'
                : 'MongoDB Offline (Local / Memory Mode)'
            }
          >
            ● {backendHealth.mongoConnected ? 'MongoDB Connected' : 'Local Storage Mode'}
          </span> */}

          {/* Saved count button (Visible only when logged in) */}
          {isAuthenticated && (
            <button
              type="button"
              className="btn-subtle"
              onClick={onOpenSaved}
              title="View saved avatar dossiers"
            >
              📁 Saved ({savedCount})
            </button>
          )}

          {/* User Auth controls */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="user-badge" title={`Signed in as ${user.email} (${user.mobile})`}>
                👤 {user.name}
              </span>
              <button
                type="button"
                className="btn-subtle"
                style={{ fontSize: '12px', color: 'var(--life)' }}
                onClick={logout}
                title="Sign out of your account"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button
                  type="button"
                  className={location.pathname === '/login' ? 'primary' : 'btn-subtle'}
                  style={{ fontWeight: 600, padding: '7px 14px', fontSize: '13px' }}
                >
                  Sign In
                </button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button
                  type="button"
                  className={location.pathname === '/register' ? 'primary' : 'btn-subtle'}
                  style={{ padding: '7px 14px', fontSize: '13px', fontWeight: 600 }}
                >
                  Create Account
                </button>
              </Link>
            </div>
          )}

          {/* Theme toggle */}
          <button
            type="button"
            className="btn-subtle"
            onClick={toggleTheme}
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
        {/* Two-page Switcher Navigation (Only accessible when logged in) */}
        {isAuthenticated ? (
          <nav >
            {/* <Link
              to="/"
              className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}
            >
              1. Input Page
            </Link> */}
            {/* <Link
              to="/result"
              className={`nav-tab ${location.pathname === '/result' ? 'active' : ''}`}
            >
              2. Result Page
            </Link> */}
          </nav>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
            🔒 Please sign in to access the customer avatar creator workbench.
          </div>
        )}

        {/* Legend */}
        <div className="legend">
          <span className="chip l">Lifeboat · rescue me</span>
          <span className="chip y">Yacht · take me further</span>
        </div>
      </div>
    </header>
  );
}
