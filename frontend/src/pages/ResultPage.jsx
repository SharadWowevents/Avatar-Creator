import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarCard from '../components/AvatarCard';
import BridgeCard from '../components/BridgeCard';
import { exportToPdf } from '../utils/pdfExport';
import { saveAvatarApi } from '../api/avatarApi';

export default function ResultPage({ data, inputs, onRefreshSaved }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('lifeboat');
  const [saving, setSaving] = useState(false);
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

  const handleSaveToDatabase = async () => {
    if (!data) return;
    setSaving(true);
    setStatus('Saving dossier to database…');
    setStatusType('normal');

    try {
      const defaultTitle =
        `${data.lifeboat?.characterName?.split(' ')[1] || 'Lifeboat'} & ${data.yacht?.characterName?.split(' ')[1] || 'Yacht'}`;
      await saveAvatarApi({
        title: defaultTitle,
        inputs,
        output: data,
      });
      setStatus(`Saved "${defaultTitle}" to database!`);
      setStatusType('success');
      if (onRefreshSaved) onRefreshSaved();
      setTimeout(() => setStatus(''), 4000);
    } catch (err) {
      console.error('Save error:', err);
      setStatus('Failed to save: ' + err.message);
      setStatusType('error');
    } finally {
      setSaving(false);
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

  const isExample = inputs?.intro?.toLowerCase().includes('wow');
  const dossierTitle = isExample ? 'EXAMPLE · WOW EVENTS' : 'YOUR AVATAR DOSSIER';

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
          <span className="example">{dossierTitle}</span>

          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={saving}
            title="Save this dossier to MongoDB database"
          >
            {saving ? 'Saving…' : '💾 Save to DB'}
          </button>

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

