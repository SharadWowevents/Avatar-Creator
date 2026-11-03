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
  const { user, isAuthenticated } = useAuth();
  const currentUserId = user?._id ? String(user._id) : (user?.email || null);
  const [activeUserId, setActiveUserId] = useState(() => currentUserId);

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cac-theme') || 'light';
  });

  // Inputs state - starts completely blank
  const [inputs, setInputs] = useState(() => {
    try {
      const activeKey = currentUserId ? `cac-inputs_${currentUserId}` : 'cac-inputs';
      const saved = JSON.parse(localStorage.getItem(activeKey) || 'null');
      if (saved && saved.intro && saved.intro.includes('WOW Events')) {
        localStorage.removeItem(activeKey);
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
      const activeKey = currentUserId ? `cac-output_${currentUserId}` : 'cac-output';
      const saved = JSON.parse(localStorage.getItem(activeKey) || 'null');
      if (saved && saved.lifeboat && saved.lifeboat.characterName?.includes('Rescue Rhea')) {
        localStorage.removeItem(activeKey);
        return null;
      }
      return (saved && saved.lifeboat) ? saved : null;
    } catch {
      return null;
    }
  });

  // Track the inputs that generated the current result (for instant return if same inputs)
  const [lastGeneratedInputs, setLastGeneratedInputs] = useState(() => {
    try {
      const activeKey = currentUserId ? `cac-last-inputs_${currentUserId}` : 'cac-last-inputs';
      return JSON.parse(localStorage.getItem(activeKey) || 'null');
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

  // Sync state whenever the active user changes (login, logout, account switch)
  useEffect(() => {
    if (currentUserId !== activeUserId) {
      setActiveUserId(currentUserId);

      if (!currentUserId) {
        // User logged out: clear state and general cache
        setInputs(EX_IN);
        setData(null);
        setLastGeneratedInputs(null);
        setSavedAvatars([]);
        try {
          localStorage.removeItem('cac-inputs');
          localStorage.removeItem('cac-output');
          localStorage.removeItem('cac-last-inputs');
        } catch {}
      } else {
        // User logged in / switched account:
        // Load ONLY drafts belonging to this user (if any exist), otherwise clean blank
        let userInputs = EX_IN;
        try {
          const saved = JSON.parse(localStorage.getItem(`cac-inputs_${currentUserId}`) || 'null');
          if (saved && typeof saved === 'object' && Object.keys(saved).length > 0) {
            userInputs = saved;
          }
        } catch {}
        setInputs(userInputs);

        let userOutput = null;
        try {
          const savedOut = JSON.parse(localStorage.getItem(`cac-output_${currentUserId}`) || 'null');
          if (savedOut && savedOut.lifeboat) {
            userOutput = savedOut;
          }
        } catch {}
        setData(userOutput);

        let userLast = null;
        try {
          userLast = JSON.parse(localStorage.getItem(`cac-last-inputs_${currentUserId}`) || 'null');
        } catch {}
        setLastGeneratedInputs(userLast);

        // Fetch this user's saved avatars from backend
        loadSavedList();
      }
    }
  }, [currentUserId, activeUserId]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cac-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Persist input drafts scoped to the active user
  useEffect(() => {
    if (!currentUserId) return;
    try {
      localStorage.setItem(`cac-inputs_${currentUserId}`, JSON.stringify(inputs));
      localStorage.setItem('cac-inputs', JSON.stringify(inputs));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [inputs, currentUserId]);

  // Persist output scoped to active user
  useEffect(() => {
    if (!currentUserId) return;
    try {
      if (data) {
        localStorage.setItem(`cac-output_${currentUserId}`, JSON.stringify(data));
        localStorage.setItem('cac-output', JSON.stringify(data));
      } else {
        localStorage.removeItem(`cac-output_${currentUserId}`);
        localStorage.removeItem('cac-output');
      }
    } catch {}
  }, [data, currentUserId]);

  // Persist last generated inputs scoped to active user
  useEffect(() => {
    if (!currentUserId) return;
    try {
      if (lastGeneratedInputs) {
        localStorage.setItem(`cac-last-inputs_${currentUserId}`, JSON.stringify(lastGeneratedInputs));
        localStorage.setItem('cac-last-inputs', JSON.stringify(lastGeneratedInputs));
      } else {
        localStorage.removeItem(`cac-last-inputs_${currentUserId}`);
        localStorage.removeItem('cac-last-inputs');
      }
    } catch {}
  }, [lastGeneratedInputs, currentUserId]);

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
    if (item.inputs) {
      setInputs(item.inputs);
      setLastGeneratedInputs(item.inputs);
      try {
        if (currentUserId) {
          localStorage.setItem(`cac-inputs_${currentUserId}`, JSON.stringify(item.inputs));
          localStorage.setItem(`cac-last-inputs_${currentUserId}`, JSON.stringify(item.inputs));
        }
        localStorage.setItem('cac-inputs', JSON.stringify(item.inputs));
        localStorage.setItem('cac-last-inputs', JSON.stringify(item.inputs));
      } catch {}
    }
    if (item.output) {
      setData(item.output);
      try {
        if (currentUserId) {
          localStorage.setItem(`cac-output_${currentUserId}`, JSON.stringify(item.output));
        }
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
                resultData={data}
                setResultData={setData}
                lastGeneratedInputs={lastGeneratedInputs}
                setLastGeneratedInputs={setLastGeneratedInputs}
                savedAvatars={savedAvatars}
                onRefreshSaved={loadSavedList}
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
                setData={setData}
                setLastGeneratedInputs={setLastGeneratedInputs}
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
