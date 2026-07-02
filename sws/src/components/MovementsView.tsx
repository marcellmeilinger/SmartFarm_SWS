import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Transaction } from '../db/dbService';
import { useTranslation } from '../context/LanguageContext';

interface MovementsViewProps {
  transactions: Transaction[];
  isMobile?: boolean;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  transactions,
  isMobile = false
}) => {
  const { t, language } = useTranslation();
  const [selectedNotes, setSelectedNotes] = useState<string | null>(null);

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const locale = language === 'hu' ? 'hu-HU' : language === 'en' ? 'en-US' : 'de-DE';
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocalizedType = (type: 'intake' | 'checkout') => {
    return type === 'intake' ? t('movTypeIntake') : t('movTypeCheckout');
  };

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 className="mobile-section-title">{t('movTitle')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transactions.map((tItem) => (
            <div key={tItem.id} className="mobile-stock-card" style={{ padding: '12px' }}>
              <div className="mobile-stock-card-left">
                <div className={`movement-icon-wrapper ${tItem.type}`} style={{ width: '28px', height: '28px' }}>
                  {tItem.type === 'intake' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
                <div className="mobile-stock-info" style={{ maxWidth: '170px' }}>
                  <h4 style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tItem.material_name}</h4>
                  <p style={{ fontSize: '10px' }}>
                    {tItem.user_name} •{' '}
                    {tItem.notes ? (
                      tItem.notes.length > 25 ? (
                        <span 
                          style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--primary)' }} 
                          onClick={() => setSelectedNotes(tItem.notes || null)}
                        >
                          {tItem.notes.substring(0, 22)}...
                        </span>
                      ) : (
                        tItem.notes
                      )
                    ) : '—'}
                  </p>
                </div>
              </div>
              <div className="mobile-stock-card-right">
                <span className={`movement-qty ${tItem.type}`} style={{ fontSize: '12px' }}>
                  {tItem.quantity > 0 ? `+${tItem.quantity}` : tItem.quantity}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                  {formatDateTime(tItem.timestamp)}
                </span>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
              {t('movNoResults')}
            </div>
          )}
        </div>

        {/* Modal for viewing long notes */}
        {selectedNotes && (
          <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setSelectedNotes(null)}>
            <div className="modal-card" style={{ maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 700 }}>
                  {t('movColNotes') || 'Megjegyzés'}
                </h3>
                <button 
                  onClick={() => setSelectedNotes(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-secondary)' }}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body" style={{ padding: '20px', textAlign: 'left', wordBreak: 'break-word', color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6' }}>
                {selectedNotes}
              </div>
              <div className="modal-footer" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)' }}>
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ padding: '8px 16px', fontSize: '13px', width: 'auto' }} 
                  onClick={() => setSelectedNotes(null)}
                >
                  Bezárás
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="details-card" style={{ width: '100%' }}>
      <div className="details-card-header">
        <div>
          <h2 className="details-card-title">{t('movTitle')}</h2>
          <p className="page-subtitle">{t('movSubtitle')}</p>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('movColDate')}</th>
              <th>{t('statId')}</th>
              <th>{t('statName')}</th>
              <th>{t('movColType')}</th>
              <th>{t('movColQty')}</th>
              <th>{t('movColUser')}</th>
              <th>{t('movColNotes')}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tItem) => {
              const hasLongNotes = tItem.notes && tItem.notes.length > 25;

              return (
                <tr key={tItem.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDateTime(tItem.timestamp)}</td>
                  <td><span className="material-id-badge">{tItem.material_id}</span></td>
                  <td style={{ fontWeight: 600 }}>{tItem.material_name}</td>
                  <td>
                    <span 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: tItem.type === 'intake' ? 'var(--primary-light)' : 'var(--danger-bg)',
                        color: tItem.type === 'intake' ? 'var(--primary)' : 'var(--danger)'
                      }}
                    >
                      {getLocalizedType(tItem.type)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: tItem.type === 'intake' ? 'var(--success)' : 'var(--danger)' }}>
                    {tItem.quantity > 0 ? `+${tItem.quantity}` : tItem.quantity}
                  </td>
                  <td>{tItem.user_name}</td>
                  
                  {hasLongNotes ? (
                    <td 
                      style={{ 
                        color: 'var(--text-secondary)', 
                        fontStyle: 'italic',
                        maxWidth: '180px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => setSelectedNotes(tItem.notes || null)}
                      title="Kattints a részletekért"
                    >
                      {tItem.notes}
                    </td>
                  ) : (
                    <td 
                      style={{ 
                        color: 'var(--text-secondary)', 
                        fontStyle: 'italic',
                        maxWidth: '180px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {tItem.notes || '—'}
                    </td>
                  )}
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  {t('movNoResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing long notes */}
      {selectedNotes && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setSelectedNotes(null)}>
          <div className="modal-card" style={{ maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 700 }}>
                {t('movColNotes') || 'Megjegyzés'}
              </h3>
              <button 
                onClick={() => setSelectedNotes(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px', textAlign: 'left', wordBreak: 'break-word', color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6' }}>
              {selectedNotes}
            </div>
            <div className="modal-footer" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ padding: '8px 16px', fontSize: '13px', width: 'auto' }} 
                onClick={() => setSelectedNotes(null)}
              >
                Bezárás
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
