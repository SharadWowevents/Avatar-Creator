import React from 'react';

export default function AvatarForm({
  inputs,
  setInputs,
  onSubmit,
  onClear,
  loading,
  status,
  statusType,
}) {
  const handleChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <section className="panel" aria-label="Your inputs">
      <form onSubmit={onSubmit}>
        <div className="fld">
          <label htmlFor="intro">
            <b>1 · WOW Intro</b> — who you are
          </label>
          <textarea
            id="intro"
            rows={3}
            placeholder="Describe who you are, what your business does, and the services or products you deliver..."
            value={inputs.intro}
            onChange={e => handleChange('intro', e.target.value)}
          />
        </div>

        <div className="fld">
          <label htmlFor="icp">
            <b>2 · ICP</b> — ideal customer profile
          </label>
          <textarea
            id="icp"
            rows={3}
            placeholder="Describe your ideal customer profile: target roles, company size, industry, and what they are evaluated on..."
            value={inputs.icp}
            onChange={e => handleChange('icp', e.target.value)}
          />
        </div>

        <div className="fld">
          <label htmlFor="life" className="l">
            <b>3 · As a Lifeboat</b> — top 3 issues you solve
          </label>
          <textarea
            id="life"
            rows={4}
            placeholder="1. Urgent deadline or crisis scenario they face right now...&#10;2. High-friction pain point that puts their credibility on the line...&#10;3. Critical risk or budget limitation they cannot afford to compromise..."
            value={inputs.life}
            onChange={e => handleChange('life', e.target.value)}
          />
          <p className="hint">When they're sinking: urgent, painful, needs rescue now.</p>
        </div>

        <div className="fld">
          <label htmlFor="yacht" className="y">
            <b>4 · As a Yacht</b> — top 3 issues you solve
          </label>
          <textarea
            id="yacht"
            rows={4}
            placeholder="1. High-level ambition, status, or market benchmark they want to reach...&#10;2. Streamlined partnership or scaling goal to replace fragmented efforts...&#10;3. Transformational outcome that creates long-term value and prestige..."
            value={inputs.yacht}
            onChange={e => handleChange('yacht', e.target.value)}
          />
          <p className="hint">When they're doing well: ambition, status, the next level.</p>
        </div>

        <div className="fld">
          <label htmlFor="both">
            <b>5 · How you help both</b>
          </label>
          <textarea
            id="both"
            rows={3}
            placeholder="How your business uniquely serves both emergency rescues and strategic partnerships..."
            value={inputs.both}
            onChange={e => handleChange('both', e.target.value)}
          />
        </div>

        <div className="actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Building avatars…' : 'Create avatars'}
          </button>
          <button type="button" onClick={onClear} disabled={loading}>
            Clear
          </button>
        </div>

        <p
          className={`status ${
            statusType === 'error' ? 'err' : statusType === 'success' ? 'success' : ''
          }`}
          role="status"
        >
          {status}
        </p>
      </form>
    </section>
  );
}
