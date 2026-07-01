import React from 'react';
import type { UserProfile } from '../db/dbService';
import { useTranslation } from '../context/LanguageContext';

interface UsersViewProps {
  users: UserProfile[];
  onUpdateUserRole?: (userId: string, newRole: 'admin' | 'operator') => Promise<void>;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, onUpdateUserRole }) => {
  const { t } = useTranslation();

  return (
    <div className="details-card">
      <h2 className="details-card-title" style={{ marginBottom: '16px' }}>{t('usrTitle')}</h2>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('usrColName')}</th>
              <th>{t('usrColEmail')}</th>
              <th>{t('usrColRole')}</th>
              <th>{t('statStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => {
                      if (onUpdateUserRole) {
                        onUpdateUserRole(u.id, e.target.value as 'admin' | 'operator');
                      }
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      backgroundColor: 'transparent',
                      fontWeight: u.role === 'admin' ? '600' : 'normal',
                      color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="operator">{t('usrRoleOperator')}</option>
                    <option value="admin">{t('usrRoleAdmin')}</option>
                  </select>
                </td>
                <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>{t('usrStatusActive')}</span></td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  {t('usrNoUsers')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
