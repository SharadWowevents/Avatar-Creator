import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAvatarApi, sendAvatarEmailApi } from '../api/avatarApi';
import { useAuth } from '../context/AuthContext';

// Helper to check if two sets of inputs are identical
function areInputsIdentical(a, b) {
  if (!a || !b) return false;
  const norm = str => (str || '').toString().trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
  return (
    norm(a.intro) === norm(b.intro) &&
    norm(a.icp) === norm(b.icp) &&
    norm(a.life) === norm(b.life) &&
    norm(a.yacht) === norm(b.yacht) &&
    norm(a.both) === norm(b.both)
  );
}

export default function InputPage({
  inputs,
  setInputs,
  resultData,
  setResultData,
  lastGeneratedInputs,
  setLastGeneratedInputs,
  savedAvatars,
  onRefreshSaved,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('normal');

  // Track validation errors for all 5 mandatory fields
  const [errors, setErrors] = useState({
    intro: false,
    icp: false,
    life: false,
    yacht: false,
    both: false,
  });

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

    // If field previously had an error and user starts typing, immediately remove red highlight
    if (errors[field] && value.trim()) {
      setErrors(prev => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  const handleClear = () => {
    setInputs({
      intro: '',
      icp: '',
      life: '',
      yacht: '',
      both: '',
    });
    setErrors({
      intro: false,
      icp: false,
      life: false,
      yacht: false,
      both: false,
    });
    localStorage.removeItem('cac-inputs');
    if (user?._id) {
      localStorage.removeItem(`cac-inputs_${user._id}`);
    }
    setStatus('');
    setStatusType('normal');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate all 5 mandatory fields
    const newErrors = {
      intro: !inputs.intro || !inputs.intro.trim(),
      icp: !inputs.icp || !inputs.icp.trim(),
      life: !inputs.life || !inputs.life.trim(),
      yacht: !inputs.yacht || !inputs.yacht.trim(),
      both: !inputs.both || !inputs.both.trim(),
    };

    setErrors(newErrors);

    const hasBlankField = Object.values(newErrors).some(Boolean);
    if (hasBlankField) {
      setStatusType('error');
      setStatus('All 5 fields are mandatory. Please fill in the required fields highlighted in red.');

      // Automatically focus and scroll to the first blank field
      const firstBlankField = Object.keys(newErrors).find(key => newErrors[key]);
      if (firstBlankField) {
        const el = document.getElementById(firstBlankField);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // 1. If user previously generated avatar and clicks "Create avatars" with the exact same inputs:
    if (resultData && areInputsIdentical(inputs, lastGeneratedInputs)) {
      navigate('/result');
      return;
    }

    // 2. If any existing saved avatar in the user's history has the exact same inputs:
    const matchingSaved = (savedAvatars || []).find(item => areInputsIdentical(inputs, item.inputs));
    if (matchingSaved && matchingSaved.output) {
      setResultData(matchingSaved.output);
      if (setLastGeneratedInputs) {
        setLastGeneratedInputs(matchingSaved.inputs);
      }
      try {
        localStorage.setItem('cac-output', JSON.stringify(matchingSaved.output));
        localStorage.setItem('cac-last-inputs', JSON.stringify(matchingSaved.inputs));
      } catch {}
      navigate('/result');
      return;
    }

    setLoading(true);
    setStatusType('normal');
    setStatus('');

    try {
      const result = await generateAvatarApi(inputs);
      setResultData(result);
      if (setLastGeneratedInputs) {
        setLastGeneratedInputs(inputs);
      }
      try {
        localStorage.setItem('cac-output', JSON.stringify(result));
        localStorage.setItem('cac-last-inputs', JSON.stringify(inputs));
      } catch {}

      // Refresh saved avatars list (since result is automatically saved)
      if (onRefreshSaved) {
        onRefreshSaved();
      }

      // If not already dispatched by the server, dispatch background email with full PDF dossier
      if (!result._emailSent && user?.email) {
        sendAvatarEmailApi({
          output: result,
          toEmail: user.email,
          recipientName: user.name,
        }).then(() => {
          console.log('[Email] Avatar dossier successfully emailed to user & BCC.');
        }).catch(err => {
          console.warn('[Email Warning] Background email delivery:', err.message);
        });
      }

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
      </div>

      <div className="input-card panel">
        <form onSubmit={handleSubmit} id="f" noValidate>
          {/* Field 1 */}
          <div className="fld">
            <label htmlFor="intro">
              <b>1 · WOW INTRO</b> — WHO YOU ARE <span className="req-star">*</span>
            </label>
            <textarea
              id="intro"
              rows={3}
              className={errors.intro ? 'field-error' : ''}
              placeholder="I help [ One Person - Designation/Role ] achieve [ Tangible Outcome ] by [ Your Solution - Product / Service ] through [ Your Method/Framework Name ]"
              value={inputs.intro}
              onChange={e => handleChange('intro', e.target.value)}
              disabled={loading}
            />
            {errors.intro && (
              <span className="field-error-msg">⚠️ This field is required. Please provide your WOW Intro.</span>
            )}
          </div>

          {/* Field 2 */}
          <div className="fld">
            <label htmlFor="icp">
              <b>2 · ICP</b> — IDEAL CUSTOMER PROFILE <span className="req-star">*</span>
            </label>
            <textarea
              id="icp"
              rows={3}
              className={errors.icp ? 'field-error' : ''}
              placeholder="Target Role/Designation, Company Size, Industry, Location, KRA, KPI, Age, Education, Interest, Hobbies, Lifestyle, Life Goals Etc"
              value={inputs.icp}
              onChange={e => handleChange('icp', e.target.value)}
              disabled={loading}
            />
            {errors.icp && (
              <span className="field-error-msg">⚠️ This field is required. Please provide your Ideal Customer Profile.</span>
            )}
          </div>

          {/* Field 3 */}
          <div className="fld">
            <label htmlFor="life" className="l">
              <b>3 · AS A LIFEBOAT</b> — TOP 3 ISSUES YOU SOLVE <span className="req-star">*</span>
            </label>
            <textarea
              id="life"
              rows={4}
              className={errors.life ? 'field-error' : ''}
              placeholder="1. &#10;2. &#10;3. "
              value={inputs.life}
              onChange={e => handleChange('life', e.target.value)}
              disabled={loading}
            />
            <p className="hint">When they're sinking: urgent, painful, needs rescue now.</p>
            {errors.life && (
              <span className="field-error-msg">⚠️ This field is required. Please list the top 3 Lifeboat issues you solve.</span>
            )}
          </div>

          {/* Field 4 */}
          <div className="fld">
            <label htmlFor="yacht" className="y">
              <b>4 · AS A YACHT</b> — TOP 3 ISSUES YOU SOLVE <span className="req-star">*</span>
            </label>
            <textarea
              id="yacht"
              rows={4}
              className={errors.yacht ? 'field-error' : ''}
              placeholder="1. &#10;2. &#10;3. "
              value={inputs.yacht}
              onChange={e => handleChange('yacht', e.target.value)}
              disabled={loading}
            />
            <p className="hint">When they're doing well: ambition, status, the next level.</p>
            {errors.yacht && (
              <span className="field-error-msg">⚠️ This field is required. Please list the top 3 Yacht issues you solve.</span>
            )}
          </div>

          {/* Field 5 */}
          <div className="fld">
            <label htmlFor="both">
              <b>5 · HOW YOU HELP BOTH</b> <span className="req-star">*</span>
            </label>
            <textarea
              id="both"
              rows={3}
              className={errors.both ? 'field-error' : ''}
              placeholder="Explain your method in 3 steps&#10;1. &#10;2. &#10;3. "
              value={inputs.both}
              onChange={e => handleChange('both', e.target.value)}
              disabled={loading}
              style={{ height: '125px' }}
            />
            {errors.both && (
              <span className="field-error-msg">⚠️ This field is required. Please explain how you help both buyer types.</span>
            )}
          </div>

          <div className="actions">
            <button type="submit" className="primary" id="go" disabled={loading}>
              {loading ? (
                <>
                  <span className="dot" style={{ width: 6, height: 6 }} />
                  Creating avatars…
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
