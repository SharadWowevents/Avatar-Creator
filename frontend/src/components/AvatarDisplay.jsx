import React, { useState } from 'react';
import AvatarCard from './AvatarCard';
import BridgeCard from './BridgeCard';
import { exportToPdf } from '../utils/pdfExport';

export default function AvatarDisplay({
  data,
  tab,
  setTab,
  loading,
  exampleLabel,
}) {
  const [downloading, setDownloading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');

  const handleDownloadPdf = async () => {
    if (!data || loading) return;
    try {
      setDownloading(true);
      setPdfStatus('Preparing PDF…');
      await exportToPdf(data);
      setPdfStatus('PDF saved!');
      setTimeout(() => setPdfStatus(''), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfStatus('Failed to generate PDF');
      setTimeout(() => setPdfStatus(''), 4000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="out" aria-label="Avatar dossier">
      <div className="banner">
        <div className="tabs" role="tablist">
          <button
            type="button"
            className={`tab l ${tab === 'lifeboat' ? 'active' : ''}`}
            role="tab"
            aria-selected={tab === 'lifeboat'}
            onClick={() => setTab('lifeboat')}
          >
            Lifeboat avatar
          </button>
          <button
            type="button"
            className={`tab y ${tab === 'yacht' ? 'active' : ''}`}
            role="tab"
            aria-selected={tab === 'yacht'}
            onClick={() => setTab('yacht')}
          >
            Yacht avatar
          </button>
          <button
            type="button"
            className={`tab b ${tab === 'bridge' ? 'active' : ''}`}
            role="tab"
            aria-selected={tab === 'bridge'}
            onClick={() => setTab('bridge')}
          >
            Serve both
          </button>
        </div>

        <div className="banner-r">
          <span className="example" id="exlabel">
            {exampleLabel}
          </span>

          <button
            type="button"
            id="pdf"
            onClick={handleDownloadPdf}
            disabled={downloading || loading || !data}
            title="Export high-resolution 3-page PDF dossier"
          >
            {downloading ? 'Preparing PDF…' : '📄 Download PDF'}
          </button>
        </div>
      </div>

      {pdfStatus && (
        <p className="status" style={{ textAlign: 'right', margin: 0 }}>
          {pdfStatus}
        </p>
      )}

      <div id="view">
        {loading ? (
          <div className="card">
            <div className="thinking">
              <span className="dot" />
              <span className="dot" />
              <span>Building your avatars… this usually takes 5–20 seconds</span>
            </div>
          </div>
        ) : !data ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--muted)' }}>
            <p>No avatar generated yet. Fill in the form and click <strong>Create avatars</strong>.</p>
          </div>
        ) : tab === 'bridge' ? (
          <BridgeCard bridge={data.bridge} />
        ) : (
          <AvatarCard avatar={data[tab]} kind={tab} />
        )}
      </div>
    </section>
  );
}

