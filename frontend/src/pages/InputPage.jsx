import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAvatarApi } from '../api/avatarApi';

export default function InputPage({ inputs, setInputs, setResultData, hasExistingResult }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('normal');

  // Timer to track elapsed seconds and show estimated remaining time
  useEffect(() => {
    let timer;
    if (loading) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClear = () => {
    setInputs({
      intro: '',
      icp: '',
      life: '',
      yacht: '',
      both: '',
    });
    localStorage.removeItem('cac-inputs');
    setStatus('');
    setStatusType('normal');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!inputs.intro.trim() || !inputs.icp.trim() || !inputs.life.trim() || !inputs.yacht.trim()) {
      setStatusType('error');
      setStatus('Fill in the intro, ICP, Lifeboat, and Yacht fields to create avatars.');
      return;
    }

    setLoading(true);
    setStatusType('normal');
    setStatus('');

    try {
      const result = await generateAvatarApi(inputs);
      setResultData(result);
      try {
        localStorage.setItem('cac-output', JSON.stringify(result));
      } catch {}

      // Navigate to Page 2 (Result Page)
      navigate('/result');
    } catch (err) {
      console.error('Generation error:', err);
      setStatusType('error');
      setStatus(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-page-container">
      <div className="page-header-row">
        <div>
          <span className="step-badge">Step 1 of 2</span>
          <h2 className="page-title">Define Your Business & Buyer Situations</h2>
          <p className="page-sub">
            Fill in your business overview and the two key situations your clients arrive in.
            We will craft two vivid animal-character avatars and a roadmap to serve both.
          </p>
        </div>

        {hasExistingResult && !loading && (
          <button
            type="button"
            className="btn-subtle"
            style={{ fontWeight: 600 }}
            onClick={() => navigate('/result')}
          >
            View Current Result →
          </button>
        )}
      </div>

      <div className="input-card panel">
        <form onSubmit={handleSubmit} id="f">
          <div className="fld">
            <label htmlFor="intro">
              <b>1 · WOW INTRO</b> — WHO YOU ARE
            </label>
            <textarea
              id="intro"
              rows={3}
              placeholder="Describe who you are, what your business does, and the services or products you deliver..."
              value={inputs.intro}
              onChange={e => handleChange('intro', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="fld">
            <label htmlFor="icp">
              <b>2 · ICP</b> — IDEAL CUSTOMER PROFILE
            </label>
            <textarea
              id="icp"
              rows={3}
              placeholder="Describe your ideal customer profile: target roles, company size, industry, and what they are evaluated on..."
              value={inputs.icp}
              onChange={e => handleChange('icp', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="fld">
            <label htmlFor="life" className="l">
              <b>3 · AS A LIFEBOAT</b> — TOP 3 ISSUES YOU SOLVE
            </label>
            <textarea
              id="life"
              rows={4}
              placeholder="1. Urgent deadline or crisis scenario they face right now...&#10;2. High-friction pain point that puts their credibility on the line...&#10;3. Critical risk or budget limitation they cannot afford to compromise..."
              value={inputs.life}
              onChange={e => handleChange('life', e.target.value)}
              disabled={loading}
            />
            <p className="hint">When they're sinking: urgent, painful, needs rescue now.</p>
          </div>

          <div className="fld">
            <label htmlFor="yacht" className="y">
              <b>4 · AS A YACHT</b> — TOP 3 ISSUES YOU SOLVE
            </label>
            <textarea
              id="yacht"
              rows={4}
              placeholder="1. High-level ambition, status, or market benchmark they want to reach...&#10;2. Streamlined partnership or scaling goal to replace fragmented efforts...&#10;3. Transformational outcome that creates long-term value and prestige..."
              value={inputs.yacht}
              onChange={e => handleChange('yacht', e.target.value)}
              disabled={loading}
            />
            <p className="hint">When they're doing well: ambition, status, the next level.</p>
          </div>

          <div className="fld">
            <label htmlFor="both">
              <b>5 · HOW YOU HELP BOTH</b>
            </label>
            <textarea
              id="both"
              rows={3}
              placeholder="How your business uniquely serves both emergency rescues and strategic partnerships..."
              value={inputs.both}
              onChange={e => handleChange('both', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="actions">
            <button type="submit" className="primary" id="go" disabled={loading}>
              {loading ? (
                <>
                  <span className="dot" style={{ width: 6, height: 6 }} />
                  Creating avatars… ({elapsedSeconds}s)
                </>
              ) : (
                'Create avatars'
              )}
            </button>
            <button type="button" id="clear" onClick={handleClear} disabled={loading}>
              Clear
            </button>
          </div>

          {/* Real-time Estimated Time & Progress feedback */}
          {loading && (
            <div className="estimate-box">
              <div className="estimate-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="dot" />
                  <span className="dot" />
                  <strong style={{ color: 'var(--ink)' }}>Building your customer avatars…</strong>
                </div>
                <span className="estimate-time-badge">
                  ⏱️ Estimated time: ~15–30s ({elapsedSeconds}s elapsed)
                </span>
              </div>

              <div className="estimate-progress-bar">
                <div
                  className="estimate-progress-fill"
                  style={{
                    width: `${Math.min(96, Math.max(8, (elapsedSeconds / 24) * 100))}%`,
                  }}
                />
              </div>

              <p className="estimate-stage-text">
                {elapsedSeconds < 6 && '🔍 Analyzing company profile & ICP distress signals…'}
                {elapsedSeconds >= 6 && elapsedSeconds < 13 && '🐇 Crafting Lifeboat urgent emergency persona & pain points…'}
                {elapsedSeconds >= 13 && elapsedSeconds < 21 && '🦅 Synthesizing Yacht transformative ambition & altitude…'}
                {elapsedSeconds >= 21 && '🌉 Assembling Lifeboat → Yacht bridge journey roadmap…'}
              </p>
            </div>
          )}

          {status && (
            <p
              className={`status ${
                statusType === 'error' ? 'err' : statusType === 'success' ? 'success' : ''
              }`}
              role="status"
              style={{ marginTop: '8px' }}
            >
              {status}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
