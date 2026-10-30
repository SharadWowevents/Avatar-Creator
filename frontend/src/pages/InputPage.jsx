import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EX_IN } from '../data/defaultData';
import { generateAvatarApi } from '../api/avatarApi';

export default function InputPage({ inputs, setInputs, setResultData, hasExistingResult }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('normal');

  const handleChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoadExample = () => {
    setInputs(EX_IN);
    setStatusType('success');
    setStatus('Loaded WOW Events example data.');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleClear = () => {
    setInputs({
      intro: '',
      icp: '',
      life: '',
      yacht: '',
      both: '',
    });
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
    setStatus('Thinking… crafting your personas with WOWOS AI.');

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

        {hasExistingResult && (
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
              placeholder="e.g. WOW Events Pvt. Ltd. is an events and experience design agency in India..."
              value={inputs.intro}
              onChange={e => handleChange('intro', e.target.value)}
            />
          </div>

          <div className="fld">
            <label htmlFor="icp">
              <b>2 · ICP</b> — IDEAL CUSTOMER PROFILE
            </label>
            <textarea
              id="icp"
              rows={3}
              placeholder="e.g. Marketing heads, brand managers and founders at ₹50 Cr+ companies..."
              value={inputs.icp}
              onChange={e => handleChange('icp', e.target.value)}
            />
          </div>

          <div className="fld">
            <label htmlFor="life" className="l">
              <b>3 · AS A LIFEBOAT</b> — TOP 3 ISSUES YOU SOLVE
            </label>
            <textarea
              id="life"
              rows={4}
              placeholder="1. Event is 2-3 weeks away and current vendor dropped the ball..."
              value={inputs.life}
              onChange={e => handleChange('life', e.target.value)}
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
              placeholder="1. Want annual flagship event to set new benchmark in their industry..."
              value={inputs.yacht}
              onChange={e => handleChange('yacht', e.target.value)}
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
              placeholder="For Lifeboat clients we step in fast with a rapid-rescue team... For Yacht clients we offer annual experience partnerships..."
              value={inputs.both}
              onChange={e => handleChange('both', e.target.value)}
            />
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
            <button type="button" onClick={handleLoadExample} disabled={loading}>
              Load Example
            </button>
            <button type="button" id="clear" onClick={handleClear} disabled={loading}>
              Clear
            </button>
          </div>

          {status && (
            <p
              className={`status ${
                statusType === 'error' ? 'err' : statusType === 'success' ? 'success' : ''
              }`}
              role="status"
            >
              {status}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

