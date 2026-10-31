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
  const handleChange = (field, e) => {
    // Clear any native browser errors as the user types
    e.target.setCustomValidity('');
    setInputs(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const requiredFields = ['intro', 'icp', 'life', 'yacht', 'both'];
    
    // Check every field to ensure it contains actual text, not just spaces/newlines
    for (const field of requiredFields) {
      const value = inputs[field] || '';
      
      if (value.trim() === '') {
        const inputElement = document.getElementById(field);
        if (inputElement) {
          // Triggers the native browser "Please fill out this field" tooltip
          inputElement.setCustomValidity('Please fill out this field.');
          inputElement.reportValidity();
        }
        return; // Immediately block submission
      }
    }

    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <section className="panel" aria-label="Your inputs">
      <form onSubmit={handleFormSubmit}>
        <div className="fld">
          <label htmlFor="intro">
            <b>1 · WOW Intro</b> — who you are
          </label>
          <textarea
            id="intro"
            rows={3}
            placeholder="I help [ One Person - Designation/Role ] achieve [ Tangible Outcome ] by [ Your Solution - Product / Service ] through [ Your Method/Framework Name ]"
            value={inputs.intro || ''}
            onChange={e => handleChange('intro', e)}
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
            onChange={e => handleChange('icp', e)}
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
            onChange={e => handleChange('life', e)}
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
            onChange={e => handleChange('yacht', e)}
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
            onChange={e => handleChange('both', e)}
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
