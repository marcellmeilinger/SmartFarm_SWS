import React from 'react';
import type { UserProfile } from '../db/dbService';
import { useTranslation } from '../context/LanguageContext';

interface UsersViewProps {
  users: UserProfile[];
}

export const UsersView: React.FC<UsersViewProps> = ({ users }) => {
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
                <td>{u.role === 'admin' ? t('loginRoleAdmin') : t('loginRoleRole') || t('roleKezelo')}</td>
                <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>Aktív</span></td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  Nem található felhasználó.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
