import React, { useState } from 'react';

export default function BridgeCard({ bridge }) {
  const [copied, setCopied] = useState(false);

  if (!bridge) return null;

  const handleCopyText = async () => {
    const journeyText = (bridge.journey || [])
      .map(j => `- ${j.tag}: ${j.text}`)
      .join('\n');

    const text = `${bridge.headline}

Lifeboat offer: ${bridge.lifeboatOffer}
Yacht offer: ${bridge.yachtOffer}

Journey:
${journeyText}

${bridge.message}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
    <article className="card">
      <div className="bridge">
        <div>
          <p className="kicker" style={{ color: 'var(--muted)' }}>
            How you help both
          </p>
          <h3>{bridge.headline}</h3>
        </div>

        <div className="lanes">
          <div className="lane l">
            <h4>Lifeboat offer</h4>
            <p>{bridge.lifeboatOffer}</p>
          </div>
          <div className="lane y">
            <h4>Yacht offer</h4>
            <p>{bridge.yachtOffer}</p>
          </div>
        </div>

        <div>
          <h4
            className="kicker"
            style={{ color: 'var(--muted)', marginBottom: '10px' }}
          >
            Lifeboat → Yacht journey
          </h4>
          <ol className="ladder">
            {(bridge.journey || []).map((j, i) => (
              <li key={i}>
                <span className="tag">{j.tag}</span>
                <span>{j.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="tagline" style={{ fontSize: '16px' }}>
          {bridge.message}
        </p>
      </div>

      <div className="foot">
        <button type="button" className="copy" onClick={handleCopyText}>
          {copied ? '✓ Copied!' : 'Copy as text'}
        </button>
      </div>
    </article>
  );
}

