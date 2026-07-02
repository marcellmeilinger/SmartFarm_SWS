import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import type { UserProfile } from '../db/dbService';
import { useTranslation } from '../context/LanguageContext';

interface UsersViewProps {
  users: UserProfile[];
  onUpdateUserRole?: (userId: string, newRole: 'admin' | 'operator') => Promise<void>;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, onUpdateUserRole }) => {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<'name' | 'email' | 'role' | null>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'name' | 'email' | 'role') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: 'name' | 'email' | 'role') => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.4, marginLeft: '6px' }} />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp size={12} style={{ color: 'var(--primary)', marginLeft: '6px' }} />
    ) : (
      <ChevronDown size={12} style={{ color: 'var(--primary)', marginLeft: '6px' }} />
    );
  };

  const sortedUsers = useMemo(() => {
    if (!sortField) return users;
    return [...users].sort((a, b) => {
      let valA = '';
      let valB = '';
      if (sortField === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (sortField === 'email') {
        valA = a.email || '';
        valB = b.email || '';
      } else if (sortField === 'role') {
        valA = a.role || '';
        valB = b.role || '';
      }
      
      const strA = valA.toLowerCase();
      const strB = valB.toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortField, sortDirection]);

  return (
    <div className="details-card">
      <h2 className="details-card-title" style={{ marginBottom: '16px' }}>{t('usrTitle')}</h2>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('name')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {t('usrColName')}
                  {renderSortIcon('name')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('email')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {t('usrColEmail')}
                  {renderSortIcon('email')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('role')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {t('usrColRole')}
                  {renderSortIcon('role')}
                </div>
              </th>
              <th>{t('statStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((u) => (
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
            {sortedUsers.length === 0 && (
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
