import React from 'react';
import { EX_IN } from '../data/defaultData';

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

  const handleLoadExample = () => {
    setInputs(EX_IN);
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
            placeholder="e.g. WOW Events is an experience design agency..."
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
            placeholder="e.g. Marketing heads at ₹50 Cr+ companies..."
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
            placeholder="1. Event is 2-3 weeks away and vendor dropped the ball..."
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
            placeholder="1. Want annual flagship event to set new benchmark..."
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
            placeholder="e.g. For Lifeboats we rapid-rescue in 48 hours; for Yachts we deliver annual partnerships..."
            value={inputs.both}
            onChange={e => handleChange('both', e.target.value)}
          />
        </div>

        <div className="actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Building avatars…' : 'Create avatars'}
          </button>
          <button type="button" onClick={handleLoadExample} disabled={loading} title="Fill WOW Events preset">
            Load Example
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

