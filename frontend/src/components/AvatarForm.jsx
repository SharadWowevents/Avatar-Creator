
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
  const requiredFields = [
    'intro',
    'icp',
    'life',
    'yacht',
    'both',
  ];

  // Handle input changes
  const handleChange = (field, e) => {
    // Clear previous validation message
    e.target.setCustomValidity('');

    setInputs(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Validate and submit form
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Prevent submission while loading
    if (loading) return;

    const form = e.currentTarget;

    // Clear all previous validation errors
    requiredFields.forEach(field => {
      const element = form.elements.namedItem(field);

      if (element) {
        element.setCustomValidity('');
      }
    });

    // Validate every mandatory field
    for (const field of requiredFields) {
      const element = form.elements.namedItem(field);

      // Check actual DOM value, including spaces and newlines
      if (!element || element.value.trim() === '') {
        if (element) {
          element.setCustomValidity(
            'This field is mandatory. Please enter your response.'
          );

          element.reportValidity();
          element.focus();
        }

        return; // Stop submission immediately
      }
    }

    // All five fields are valid
    if (typeof onSubmit === 'function') {
      onSubmit(e);
    }
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
            required
          />
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
            required
          />
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
            required
          />

          <p className="hint">
            When they're sinking: urgent, painful, needs rescue now.
          </p>
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
            required
          />

          <p className="hint">
            When they're doing well: ambition, status, the next level.
          </p>
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
            style={{ height: '125px' }}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="actions">

          <button
            type="submit"
            className="primary"
            disabled={loading}
          >
            {loading ? 'Building avatars…' : 'Create avatars'}
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={loading}
          >
            Clear
          </button>

        </div>

        {/* Status Message */}
        <p
          className={`status ${
            statusType === 'error'
              ? 'err'
              : statusType === 'success'
              ? 'success'
              : ''
          }`}
          role="status"
          aria-live="polite"
        >
          {status}
        </p>

      </form>
    </section>
  );
}
