import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../db/supabaseClient';
import { Camera, Save, User, RefreshCw, AlertCircle, Check, Trash2 } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface SettingsViewProps {
  isMock: boolean;
  user: { id: string; name: string; email: string; role: 'admin' | 'operator'; avatar_url?: string };
  onUserUpdate?: (updatedUser: Partial<{ id: string; name: string; email: string; role: 'admin' | 'operator'; avatar_url?: string }>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isMock, user, onUserUpdate }) => {
  const { t, language, setLanguage } = useTranslation();

  // Form States
  const [name, setName] = useState(user.name);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatar_url || null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setStatusMessage({ type: 'error', text: 'Csak képformátumú fájl tölthető fel!' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage({ type: 'error', text: 'A fájl mérete nem haladhatja meg az 5MB-ot!' });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStatusMessage(null);
    }
  };

  const handleDeleteAvatar = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Unified Save Handler
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: t('setErrorName') });
      return;
    }

    // Password validation: must fill both or none
    if ((oldPassword && !newPassword) || (!oldPassword && newPassword)) {
      setStatusMessage({ type: 'error', text: t('setErrorPwdMatch') });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      let finalAvatarUrl = previewUrl || '';
      let profileUpdated = false;
      let passwordUpdated = false;

      // 1. Profile Picture Upload
      if (selectedFile) {
        if (!isMock && isSupabaseConfigured) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase!.storage
            .from('avatars')
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            throw new Error(`Sikertelen képfeltöltés: ${uploadError.message}`);
          }

          const { data } = supabase!.storage.from('avatars').getPublicUrl(filePath);
          if (!data?.publicUrl) {
            throw new Error('Sikertelen nyilvános kép URL lekérés.');
          }
          finalAvatarUrl = data.publicUrl;
        } else {
          await new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              finalAvatarUrl = event.target?.result as string;
              resolve();
            };
            reader.onerror = () => reject(new Error('Sikertelen helyi fájlolvasás'));
            reader.readAsDataURL(selectedFile);
          });
        }
      }

      // 2. Profile Details Update
      if (name !== user.name || finalAvatarUrl !== (user.avatar_url || '')) {
        if (!isMock && isSupabaseConfigured) {
          const { error: updateError } = await supabase!
            .from('profiles')
            .update({
              name: name,
              avatar_url: finalAvatarUrl
            })
            .eq('id', user.id);

          if (updateError) {
            throw new Error(`Profil mentési hiba: ${updateError.message}`);
          }
        }
        profileUpdated = true;
      }

      // 3. Password Update
      if (oldPassword && newPassword) {
        if (newPassword.length < 6) {
          throw new Error(t('setErrorPwdLength'));
        }

        if (!isMock && isSupabaseConfigured) {
          // Verify old password
          const { error: signInError } = await supabase!.auth.signInWithPassword({
            email: user.email,
            password: oldPassword,
          });

          if (signInError) {
            throw new Error('A megadott régi jelszó helytelen.');
          }

          // Update password
          const { error: updateError } = await supabase!.auth.updateUser({
            password: newPassword,
          });

          if (updateError) {
            throw new Error(`Sikertelen jelszómódosítás: ${updateError.message}`);
          }
        } else {
          // Mock mode password update
          const savedUsersJson = localStorage.getItem('smartfarm_users');
          const savedUsers = savedUsersJson ? JSON.parse(savedUsersJson) : [];
          const userIndex = savedUsers.findIndex((u: any) => u.email === user.email);

          if (userIndex !== -1) {
            if (savedUsers[userIndex].password !== oldPassword) {
              throw new Error('A megadott régi jelszó helytelen.');
            }
            savedUsers[userIndex].password = newPassword;
            localStorage.setItem('smartfarm_users', JSON.stringify(savedUsers));
          } else {
            if (user.email === 'kovacs.gabor@ceg.hu' && oldPassword !== 'password123') {
              throw new Error('A megadott régi jelszó helytelen.');
            }
            const newUserEntry = {
              name: user.name,
              email: user.email,
              role: user.role,
              password: newPassword
            };
            savedUsers.push(newUserEntry);
            localStorage.setItem('smartfarm_users', JSON.stringify(savedUsers));
          }
        }
        passwordUpdated = true;
      }

      // 4. Trigger UI State Update
      if (profileUpdated && onUserUpdate) {
        onUserUpdate({
          name: name,
          avatar_url: finalAvatarUrl
        });
      }

      // 5. Success feedback
      let successText = t('setSuccessGeneral');
      if (profileUpdated && passwordUpdated) {
        successText = t('setSuccessAll');
      } else if (passwordUpdated) {
        successText = t('setSuccessPwd');
      } else if (profileUpdated) {
        successText = t('setSuccessProfile');
      }

      setStatusMessage({ type: 'success', text: successText });
      setOldPassword('');
      setNewPassword('');
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setStatusMessage({ type: 'error', text: error.message || 'Sikertelen mentés.' });
    } finally {
      setLoading(false);
    }
  };

  // Password Reminder Handler
  const handleForgotPasswordReminder = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      if (!isMock && isSupabaseConfigured) {
        const { error } = await supabase!.auth.resetPasswordForEmail(user.email, {
          redirectTo: window.location.origin
        });

        if (error) {
          throw error;
        }
        setStatusMessage({ type: 'success', text: `Jelszó-visszaállító e-mail sikeresen elküldve a következő címre: ${user.email}` });
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        setStatusMessage({ 
          type: 'success', 
          text: `[Demó Mód] Jelszó-visszaállító e-mail kiküldése szimulálva a következő címre: ${user.email}` 
        });
      }
    } catch (err: any) {
      console.error('Password reminder error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Nem sikerült elküldeni a jelszó emlékeztetőt.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="details-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="details-card-title" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <User size={22} style={{ color: 'var(--primary)' }} />
        {t('setProfileTitle')}
      </h2>

      {statusMessage && (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: statusMessage.type === 'success' ? 'var(--primary-light)' : 'var(--danger-bg)',
            color: statusMessage.type === 'success' ? 'var(--primary)' : 'var(--danger)',
            border: `1px solid ${statusMessage.type === 'success' ? 'rgba(0, 104, 55, 0.2)' : 'rgba(235, 87, 87, 0.2)'}`
          }}
        >
          {statusMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Picture Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            {/* Center: Profile Image */}
            <img
              src={previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=006837&color=fff&size=128`}
              alt="Profilkép"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary)',
                boxShadow: 'var(--shadow-md)'
              }}
            />

            {/* Left overlay: Green Camera Button */}
            <label 
              htmlFor="avatar-upload"
              style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                backgroundColor: 'var(--primary)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Új kép feltöltése"
            >
              <Camera size={16} />
              <input 
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>

            {/* Right overlay: Red Trash Button */}
            <button
              type="button"
              onClick={handleDeleteAvatar}
              disabled={!previewUrl}
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: previewUrl ? 'var(--danger)' : '#cccccc',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: previewUrl ? 'pointer' : 'not-allowed',
                boxShadow: 'var(--shadow-md)',
                border: 'none',
                transition: 'transform 0.2s',
                opacity: previewUrl ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (previewUrl) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Profilkép törlése"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {t('setAvatarDesc')}
          </span>
        </div>

        {/* Inputs */}
        <div className="form-group">
          <label className="form-label" htmlFor="pName">{t('setLabelName')}</label>
          <input
            id="pName"
            type="text"
            required
            className="form-input-text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('setPlaceholderName')}
          />
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '0' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="pEmail">{t('setLabelEmail')}</label>
            <input
              id="pEmail"
              type="email"
              disabled
              className="form-input-text"
              value={user.email}
              style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="pRole">{t('setLabelRole')}</label>
            <input
              id="pRole"
              type="text"
              disabled
              className="form-input-text"
              value={user.role === 'admin' ? t('roleAdmin') : t('roleOperator')}
              style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
            />
          </div>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '0', marginTop: '0' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: '0' }}>
            <label className="form-label" htmlFor="oldPwd">{t('setLabelOldPwd')}</label>
            <input
              id="oldPwd"
              type="password"
              className="form-input-text"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder={t('setPlaceholderOldPwd')}
            />
          </div>

          <div className="form-group" style={{ flex: 1, marginBottom: '0' }}>
            <label className="form-label" htmlFor="newPwd">{t('setLabelNewPwd')}</label>
            <input
              id="newPwd"
              type="password"
              className="form-input-text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('setPlaceholderNewPwd')}
            />
          </div>
        </div>

        {/* Forgotten Password Reminder Trigger (Full-width, stretched out) */}
        <div style={{ textAlign: 'left', marginBottom: '20px', marginTop: '8px' }}>
          <button
            type="button"
            className="btn-link"
            onClick={handleForgotPasswordReminder}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              padding: 0,
              textDecoration: 'underline',
              textAlign: 'left',
              whiteSpace: 'nowrap'
            }}
          >
            {t('setForgotPwd')}
          </button>
        </div>

        {/* Language Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginBottom: '20px' }}>
          <label className="form-label" style={{ marginBottom: '4px' }}>
            {t('setLanguageTitle')}
          </label>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {t('setLanguageDesc')}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setLanguage('hu')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                border: language === 'hu' ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: language === 'hu' ? 'var(--primary-light)' : 'var(--bg-card)',
                color: language === 'hu' ? 'var(--primary)' : 'var(--text-primary)',
                fontWeight: language === 'hu' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '16px' }}>🇭🇺</span> Magyar
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                border: language === 'en' ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: language === 'en' ? 'var(--primary-light)' : 'var(--bg-card)',
                color: language === 'en' ? 'var(--primary)' : 'var(--text-primary)',
                fontWeight: language === 'en' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '16px' }}>🇬🇧</span> English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('de')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                border: language === 'de' ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: language === 'de' ? 'var(--primary-light)' : 'var(--bg-card)',
                color: language === 'de' ? 'var(--primary)' : 'var(--text-primary)',
                fontWeight: language === 'de' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '16px' }}>🇩🇪</span> Deutsch
            </button>
          </div>
        </div>

        {/* Buttons row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                <span>{t('saving')}</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{t('save')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
