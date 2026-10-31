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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verify all 5 fields have actual non-empty text
    const requiredKeys = ['intro', 'icp', 'life', 'yacht', 'both'];
    const hasEmptyField = requiredKeys.some(
      (key) => !inputs[key] || inputs[key].trim() === ''
    );

    if (hasEmptyField) {
      alert('Please fill out all fields before submitting.');
      return;
    }

    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <section className="panel" aria-label="Your inputs">
      <form onSubmit={handleSubmit}>
        <div className="fld">
          <label htmlFor="intro">
            <b>1 · WOW Intro</b> — who you are
          </label>
          <textarea
            id="intro"
            rows={3}
            placeholder="I help [ One Person - Designation/Role ] achieve [ Tangible Outcome ] by [ Your Solution - Product / Service ] through [ Your Method/Framework Name ]"
            value={inputs.intro || ''}
            onChange={e => handleChange('intro', e.target.value)}
            required
          />
        </div>

        <div className="fld">
          <label htmlFor="icp">
            <b>2 · ICP</b> — ideal customer profile
          </label>
          <textarea
            id="icp"
            rows={3}
            placeholder="I help [ One Person - Designation/Role ] achieve [ Tangible Outcome ] by [ Your Solution - Product / Service ] through [ Your Method/Framework Name ]"
            value={inputs.icp || ''}
            onChange={e => handleChange('icp', e.target.value)}
            required
          />
        </div>

        <div className="fld">
          <label htmlFor="life" className="l">
            <b>3 · As a Lifeboat</b> — top 3 issues you solve
          </label>
          <textarea
            id="life"
            rows={4}
            placeholder="1. &#10;2. &#10;3. "
            value={inputs.life || ''}
            onChange={e => handleChange('life', e.target.value)}
            required
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
            placeholder="1. &#10;2. &#10;3. "
            value={inputs.yacht || ''}
            onChange={e => handleChange('yacht', e.target.value)}
            required
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
            placeholder="Explain your method in 3 steps:&#10;1. &#10;2. &#10;3. "
            value={inputs.both || ''}
            onChange={e => handleChange('both', e.target.value)}
            style={{ height: '125px' }}
            required
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
