import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Header from './components/Header';
import SavedDrawer from './components/SavedDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import InputPage from './pages/InputPage';
import ResultPage from './pages/ResultPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EX_IN, EX_OUT } from './data/defaultData';
import { checkBackendHealth, fetchSavedAvatars, deleteAvatarApi } from './api/avatarApi';
import './App.css';

function MainApp() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cac-theme') || 'light';
  });

  // Inputs state - starts completely blank
  const [inputs, setInputs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cac-inputs') || 'null');
      if (saved && saved.intro && saved.intro.includes('WOW Events')) {
        localStorage.removeItem('cac-inputs');
        return EX_IN;
      }
      return saved || EX_IN;
    } catch {
      return EX_IN;
    }
  });

  // Result Dossier state - starts empty (null) until user generates
  const [data, setData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cac-output') || 'null');
      if (saved && saved.lifeboat && saved.lifeboat.characterName?.includes('Rescue Rhea')) {
        localStorage.removeItem('cac-output');
        return null;
      }
      return (saved && saved.lifeboat) ? saved : null;
    } catch {
      return null;
    }
  });

  // Health and Saved Avatars state
  const [backendHealth, setBackendHealth] = useState({
    mongoConnected: false,
    aiConfigured: false,
    aiModel: 'GPT-6 Luna',
  });
  const [savedAvatars, setSavedAvatars] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cac-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Persist input drafts
  useEffect(() => {
    try {
      localStorage.setItem('cac-inputs', JSON.stringify(inputs));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [inputs]);

  // Initial load: check health & fetch saved avatars if authenticated
  useEffect(() => {
    const init = async () => {
      const health = await checkBackendHealth();
      setBackendHealth(health);
      if (isAuthenticated) {
        loadSavedList();
      }
    };
    init();
  }, [isAuthenticated]);

  const loadSavedList = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetchSavedAvatars();
      if (res && res.data) {
        setSavedAvatars(res.data);
      }
    } catch (err) {
      console.warn('Error loading saved avatars:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleLoadAvatar = item => {
    if (item.inputs) setInputs(item.inputs);
    if (item.output) {
      setData(item.output);
      try {
        localStorage.setItem('cac-output', JSON.stringify(item.output));
      } catch {}
    }
    setIsDrawerOpen(false);
    navigate('/result');
  };

  const handleDeleteAvatar = async id => {
    try {
      await deleteAvatarApi(id);
      setSavedAvatars(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      alert('Failed to delete avatar: ' + err.message);
    }
  };

  return (
    <div className="wrap">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        backendHealth={backendHealth}
        savedCount={savedAvatars.length}
        onOpenSaved={() => setIsDrawerOpen(true)}
      />

      <Routes>
        {/* Page 1: Input Page (Protected - Login required) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <InputPage
                inputs={inputs}
                setInputs={setInputs}
                setResultData={setData}
                hasExistingResult={Boolean(data)}
              />
            </ProtectedRoute>
          }
        />

        {/* Page 2: Result Page (Protected - Login required) */}
        <Route
          path="/result"
          element={
            <ProtectedRoute>
              <ResultPage
                data={data}
                inputs={inputs}
                onRefreshSaved={loadSavedList}
              />
            </ProtectedRoute>
          }
        />

        {/* Public Authentication Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Catch-all redirect to / (which guards to /login if unauthenticated) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SavedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedAvatars={savedAvatars}
        onLoadAvatar={handleLoadAvatar}
        onDeleteAvatar={handleDeleteAvatar}
        loadingList={loadingSaved}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
