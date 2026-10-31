import React, { useState } from 'react';

export default function AvatarForm({
  inputs,
  setInputs,
  onSubmit,
  onClear,
  loading,
  status,
  statusType,
}) {
  const [errors, setErrors] = useState({});
  const requiredFields = ['intro', 'icp', 'life', 'yacht', 'both'];

  const handleChange = (field, e) => {
    setInputs(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear the error highlight as the user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    const newErrors = {};
    let hasError = false;

    // Check all 5 fields for empty strings or just whitespace
    requiredFields.forEach(field => {
      const value = inputs[field] || '';
      if (value.trim() === '') {
        newErrors[field] = 'This field is required.';
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors); // Triggers red borders
      return; // Stops submission
    }

    if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleClear = () => {
    setErrors({});
    if (onClear) onClear();
  };

  const getErrorStyle = (field) => {
    return errors[field]
      ? { border: '1px solid #ef4444', backgroundColor: '#fef2f2' }
      : {};
  };

  return (
    <section className="panel" aria-label="Your inputs">
      <form onSubmit={handleFormSubmit} noValidate>
        {/* 1. WOW Intro */}
        <div className="fld">
          <label htmlFor="intro"><b>1 · WOW Intro</b> — who you are</label>
          <textarea
            id="intro"
            rows={3}
            placeholder="I help [ One Person ] achieve [ Tangible Outcome ]"
            value={inputs.intro || ''}
            onChange={e => handleChange('intro', e)}
            style={getErrorStyle('intro')}
          />
        </div>

        {/* 2. ICP */}
        <div className="fld">
          <label htmlFor="icp"><b>2 · ICP</b> — ideal customer profile</label>
          <textarea
            id="icp"
            rows={3}
            placeholder="I help [ One Person ] achieve [ Tangible Outcome ]"
            value={inputs.icp || ''}
            onChange={e => handleChange('icp', e)}
            style={getErrorStyle('icp')}
          />
        </div>

        {/* 3. Lifeboat */}
        <div className="fld">
          <label htmlFor="life" className="l"><b>3 · As a Lifeboat</b> — top 3 issues you solve</label>
          <textarea
            id="life"
            rows={4}
            placeholder="1.&#10;2.&#10;3."
            value={inputs.life || ''}
            onChange={e => handleChange('life', e)}
            style={getErrorStyle('life')}
          />
        </div>

        {/* 4. Yacht */}
        <div className="fld">
          <label htmlFor="yacht" className="y"><b>4 · As a Yacht</b> — top 3 issues you solve</label>
          <textarea
            id="yacht"
            rows={4}
            placeholder="1.&#10;2.&#10;3."
            value={inputs.yacht || ''}
            onChange={e => handleChange('yacht', e)}
            style={getErrorStyle('yacht')}
          />
        </div>

        {/* 5. How you help both */}
        <div className="fld">
          <label htmlFor="both"><b>5 · How you help both</b></label>
          <textarea
            id="both"
            rows={3}
            placeholder="Explain your method in 3 steps:&#10;1.&#10;2.&#10;3."
            value={inputs.both || ''}
            onChange={e => handleChange('both', e)}
            style={{ height: '125px', ...getErrorStyle('both') }}
          />
        </div>

        {/* Actions */}
        <div className="actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Building avatars…' : 'Create avatars'}
          </button>
          <button type="button" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        </div>

        {/* Status Message from Parent */}
        <p
          className={`status ${statusType === 'error' ? 'err' : statusType === 'success' ? 'success' : ''}`}
          role="status"
        >
          {status}
        </p>
      </form>
    </section>
  );
}
