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

  // Handle input changes
  const handleChange = (field, e) => {
    setInputs(prev => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear the error for this specific field as the user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validate and submit form
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    const newErrors = {};
    let hasError = false;

    // Validate every mandatory field against the React state
    requiredFields.forEach(field => {
      const value = inputs[field] || '';
      if (value.trim() === '') {
        newErrors[field] = 'This field is required.';
        hasError = true;
      }
    });

    // If there are errors, update the state and stop submission
    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // All five fields are valid
    if (typeof onSubmit === 'function') {
      onSubmit(e);
    }
  };

  // Handle Clear
  const handleClear = () => {
    setErrors({});
    if (onClear) onClear();
  };

  // Helper for inline error styling
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
          <label htmlFor="intro">
            <b>1 · WOW Intro</b> — who you are
          </label>
          <textarea
            id="intro"
            name="intro"
            rows={3}
            placeholder="I help [ One Person - Designation/Role ] achieve [ Tangible Outcome ] by [ Your Solution - Product / Service ] through [ Your Method/Framework Name ]"
            value={inputs.intro || ''}
            onChange={e => handleChange('intro', e)}
            style={getErrorStyle('intro')}
          />
          {errors.intro && <p style={{color: '#ef4444', fontSize: '13px', margin: '4px 0 0'}}>{errors.intro}</p>}
        </div>

        {/* 2. ICP */}
        <div className="fld">
          <label htmlFor="icp">
            <b>2 · ICP</b> — ideal customer profile
          </label>
          <textarea
            id="icp"
            name="icp"
            rows={3}
            placeholder="I help [ One Person - Designation/Role ] achieve [ Tangible Outcome ] by [ Your Solution - Product / Service ] through [ Your Method/Framework Name ]"
            value={inputs.icp || ''}
            onChange={e => handleChange('icp', e)}
            style={getErrorStyle('icp')}
          />
          {errors.icp && <p style={{color: '#ef4444', fontSize: '13px', margin: '4px 0 0'}}>{errors.icp}</p>}
        </div>

        {/* 3. Lifeboat */}
        <div className="fld">
          <label htmlFor="life" className="l">
            <b>3 · As a Lifeboat</b> — top 3 issues you solve
          </label>
          <textarea
            id="life"
            name="life"
            rows={4}
            placeholder={'1.\n2.\n3.'}
            value={inputs.life || ''}
            onChange={e => handleChange('life', e)}
            style={getErrorStyle('life')}
          />
          <p className="hint">When they're sinking: urgent, painful, needs rescue now.</p>
          {errors.life && <p style={{color: '#ef4444', fontSize: '13px', margin: '4px 0 0'}}>{errors.life}</p>}
        </div>

        {/* 4. Yacht */}
        <div className="fld">
          <label htmlFor="yacht" className="y">
            <b>4 · As a Yacht</b> — top 3 issues you solve
          </label>
          <textarea
            id="yacht"
            name="yacht"
            rows={4}
            placeholder={'1.\n2.\n3.'}
            value={inputs.yacht || ''}
            onChange={e => handleChange('yacht', e)}
            style={getErrorStyle('yacht')}
          />
          <p className="hint">When they're doing well: ambition, status, the next level.</p>
          {errors.yacht && <p style={{color: '#ef4444', fontSize: '13px', margin: '4px 0 0'}}>{errors.yacht}</p>}
        </div>

        {/* 5. How you help both */}
        <div className="fld">
          <label htmlFor="both">
            <b>5 · How you help both</b>
          </label>
          <textarea
            id="both"
            name="both"
            rows={3}
            placeholder={'Explain your method in 3 steps:\n1.\n2.\n3.'}
            value={inputs.both || ''}
            onChange={e => handleChange('both', e)}
            style={{ height: '125px', ...getErrorStyle('both') }}
          />
          {errors.both && <p style={{color: '#ef4444', fontSize: '13px', margin: '4px 0 0'}}>{errors.both}</p>}
        </div>

        {/* Action Buttons */}
        <div className="actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Building avatars…' : 'Create avatars'}
          </button>
          <button type="button" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        </div>

        {/* Status Message */}
        <p
          className={`status ${statusType === 'error' ? 'err' : statusType === 'success' ? 'success' : ''}`}
          role="status"
          aria-live="polite"
        >
          {status}
        </p>

      </form>
    </section>
  );
}
