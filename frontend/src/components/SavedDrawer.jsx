import React from 'react';

export default function SavedDrawer({
  isOpen,
  onClose,
  savedAvatars,
  onLoadAvatar,
  onDeleteAvatar,
  loadingList,
}) {
  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Saved Avatars ({savedAvatars.length})</h2>
          <button type="button" className="btn-subtle" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {loadingList ? (
          <p className="status">Loading saved avatars…</p>
        ) : savedAvatars.length === 0 ? (
          <p className="hint" style={{ marginTop: '20px' }}>
            No saved avatars found. Click <strong>💾 Save to DB</strong> on any dossier to store it here.
          </p>
        ) : (
          <div className="saved-list">
            {savedAvatars.map(item => {
              const lbEmoji = item.output?.lifeboat?.emoji || '🐇';
              const ytEmoji = item.output?.yacht?.emoji || '🦅';
              const createdDate = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              return (
                <div key={item._id} className="saved-item">
                  <div className="saved-item-header">
                    <h3 className="saved-item-title">{item.title}</h3>
                    <span className="saved-item-date">{createdDate}</span>
                  </div>

                  <div className="saved-item-chips">
                    <span className="chip l">
                      {lbEmoji} {item.output?.lifeboat?.characterName?.split(' ')[1] || 'Lifeboat'}
                    </span>
                    <span className="chip y">
                      {ytEmoji} {item.output?.yacht?.characterName?.split(' ')[1] || 'Yacht'}
                    </span>
                  </div>

                  <p className="hint" style={{ fontSize: '12px' }}>
                    {item.inputs?.intro ? item.inputs.intro.slice(0, 100) + '...' : ''}
                  </p>

                  <div className="saved-item-actions">
                    <button
                      type="button"
                      className="primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => onLoadAvatar(item)}
                    >
                      Load into Workbench
                    </button>
                    <button
                      type="button"
                      className="btn-subtle"
                      style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--life)' }}
                      onClick={() => onDeleteAvatar(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}

