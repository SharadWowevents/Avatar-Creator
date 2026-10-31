import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AvatarCard from '../components/AvatarCard';
import BridgeCard from '../components/BridgeCard';
import { exportToPdf } from '../utils/pdfExport';

export default function ResultPage({ data, inputs }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('lifeboat');
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('normal');

  const handleDownloadPdf = async () => {
    if (!data) return;
    try {
      setDownloading(true);
      setStatus('Preparing PDF…');
      setStatusType('normal');
      await exportToPdf(data);
      setStatus('PDF downloaded successfully!');
      setStatusType('success');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error('PDF error:', err);
      setStatus('Failed to export PDF.');
      setStatusType('error');
    } finally {
      setDownloading(false);
    }
  };

  if (!data) {
    return (
      <div className="result-page-container">
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <h2>No Avatars Created Yet</h2>
          <p className="sub" style={{ margin: '8px auto 20px', maxWidth: '400px' }}>
            Please fill out the inputs on the first page to generate your customer avatars.
          </p>
          <button type="button" className="primary" onClick={() => navigate('/')}>
            ← Go to Input Page
          </button>
        </div>
      </div>
    );
  }

  const dossierTitle = data?.title || 'CUSTOMER AVATAR DOSSIER';

  return (
    <div className="result-page-container">
      {/* Top Banner Navigation */}
      <div className="banner" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-subtle"
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => navigate('/')}
            title="Return to input page to edit prompts"
          >
            ← Edit Inputs
          </button>

          {/* Tabs */}
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
        </div>

        <div className="banner-r">
          <span className="chip status-chip online" title="Result automatically saved to database" style={{ fontSize: '11px', padding: '4px 8px' }}>
            ✓ Auto-Saved
          </span>

          <span
            className="chip status-chip"
            title={`Customer Avatar PDF sent to ${user?.email || 'your email'} with BCC to sachin@wowos.in`}
            style={{ fontSize: '11px', padding: '4px 8px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
          >
            ✉ PDF Emailed {user?.email ? `(${user.email})` : ''}
          </span>

          <span className="example">{dossierTitle}</span>

          <button
            type="button"
            id="pdf"
            onClick={handleDownloadPdf}
            disabled={downloading}
            title="Download multi-page PDF"
          >
            {downloading ? 'Preparing PDF…' : '📄 Download PDF'}
          </button>
        </div>
      </div>

      {status && (
        <p
          className={`status ${
            statusType === 'error' ? 'err' : statusType === 'success' ? 'success' : ''
          }`}
          style={{ textAlign: 'right', marginBottom: '12px' }}
        >
          {status}
        </p>
      )}

      {/* Render Active View */}
      <div id="view">
        {tab === 'bridge' ? (
          <BridgeCard bridge={data.bridge} />
        ) : (
          <AvatarCard avatar={data[tab]} kind={tab} />
        )}
      </div>
    </div>
  );
}
