import React, { useState } from 'react';

export default function AvatarCard({ avatar, kind }) {
  const [copied, setCopied] = useState(false);

  if (!avatar) return null;

  const isLifeboat = kind === 'lifeboat';
  const cardClass = `card ${isLifeboat ? 'l' : 'y'}`;

  const handleCopyText = async () => {
    const L = arr => (arr || []).map((s, i) => `${i + 1}. ${s}`).join('\n');
    const text = `${avatar.characterName} (${avatar.animal}) — ${
      isLifeboat ? 'Lifeboat' : 'Yacht'
    } customer
${avatar.tagline}
Why this animal: ${avatar.whyAnimal}

Current state: ${avatar.currentState}
Desired state: ${avatar.desiredState}

Stage of business/life: ${avatar.stage}

Top 3 pain points:
${L(avatar.painPoints)}

What they want:
${L(avatar.wants)}

Buying behaviour:
${L(avatar.buyingBehaviour)}

Language they use:
${(avatar.language || []).join('\n')}

Next steps:
${L(avatar.nextSteps)}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className={cardClass}>
      <div className="hero">
        <div className="portrait" aria-hidden="true">
          {avatar.emoji || '🐾'}
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="kicker">
            {isLifeboat ? 'Lifeboat customer' : 'Yacht customer'} · {avatar.animal}
          </p>
          <h2 className="name">{avatar.characterName}</h2>
          <p className="tagline">{avatar.tagline}</p>
        </div>
      </div>

      <div className="why">
        <strong>Why a {(avatar.animal || '').toLowerCase()}?</strong> {avatar.whyAnimal}
      </div>

      <div className="shift">
        <div>
          <h4>Current state</h4>
          <p>{avatar.currentState}</p>
        </div>
        <div className="arrow" aria-hidden="true">
          →
        </div>
        <div className="to">
          <h4>Desired state</h4>
          <p>{avatar.desiredState}</p>
        </div>
      </div>

      <div className="secs">
        <div className="sec full">
          <h4>Stage of business / life</h4>
          <p className="stage">{avatar.stage}</p>
        </div>

        <div className="sec">
          <h4>Top 3 pain points</h4>
          <ol>
            {(avatar.painPoints || []).map((pt, i) => (
              <li key={i}>{pt}</li>
            ))}
          </ol>
        </div>

        <div className="sec">
          <h4>What they want</h4>
          <ul>
            {(avatar.wants || []).map((want, i) => (
              <li key={i}>{want}</li>
            ))}
          </ul>
        </div>

        <div className="sec">
          <h4>Buying behaviour</h4>
          <ul>
            {(avatar.buyingBehaviour || []).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>

        <div className="sec">
          <h4>Language they use</h4>
          <div className="quotes">
            {(avatar.language || []).map((q, i) => (
              <span key={i} className="q">
                {q}
              </span>
            ))}
          </div>
        </div>

        <div className="sec full">
          <h4>Next steps</h4>
          <ol className="steps">
            {(avatar.nextSteps || []).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="foot">
        <button type="button" className="copy" onClick={handleCopyText}>
          {copied ? '✓ Copied!' : 'Copy as text'}
        </button>
      </div>
    </article>
  );
}

