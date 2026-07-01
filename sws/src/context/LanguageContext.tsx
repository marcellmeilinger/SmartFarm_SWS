import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'hu' | 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  hu: {
    // Sidebar & Navigation
    appName: 'SmartFarm Raktár',
    version: 'Verzió 1.2.0',
    navDashboard: 'Dashboard',
    navMaterials: 'Anyagok',
    navNewMaterial: 'Új anyag',
    navMovements: 'Készletmozgások',
    navQrCodes: 'QR-kódok',
    navUsers: 'Felhasználók',
    navSettings: 'Beállítások',
    navLogout: 'Kijelentkezés',

    // Header & General UI
    roleAdmin: 'Raktárvezető',
    roleOperator: 'Raktári dolgozó',
    roleKezelo: 'Kezelő',
    searchPlaceholder: 'Keresés anyag, azonosító vagy hely szerint...',
    qrScanBtn: 'QR Beolvasás',
    demoNotice: 'Jelenleg offline Demó / LocalStorage üzemmódban fut a rendszer.',
    demoLink: 'Supabase csatlakozási adatok megadása',
    loading: 'Töltés...',
    save: 'Mentés',
    saveData: 'Adatok mentése',
    saving: 'Mentés...',
    savingData: 'Adatok mentése...',
    cancel: 'Mégse',

    // Dashboard Overview
    dbTitle: 'Főáttekintő dashboard',
    dbSubtitle: 'Áttekintés a raktár készletéről és a legfontosabb mutatókról.',
    cardTotalMaterials: 'Összes anyag',
    cardLowStock: 'Alacsony készlet',
    cardTodayMovements: 'Mai mozgások',
    levelGreen: 'Zöld szint (>70%)',
    levelYellow: 'Sárga szint (40-70%)',
    levelRed: 'Piros szint (<40%)',
    criticalStockTitle: 'Kritikus készletű anyagok',
    viewAllCritical: 'Összes kritikus anyag megtekintése',
    categoryDistribution: 'Kategória szerinti megoszlás',
    totalText: 'ÖSSZESEN',
    statStatus: 'STÁTUSZ',
    statId: 'AZONOSÍTÓ',
    statName: 'NÉV',
    statStock: 'KÉSZLET',
    statMax: 'MAX',
    statLevel: 'SZINT',
    statLocation: 'HELY',
    comparedToLastWeek: 'az előző héthez képest',
    comparedToYesterday: 'az előző naphoz képest',

    // Materials View
    matTitle: 'Raktárkészlet',
    matSubtitle: 'Az összes regisztrált anyag listája és aktuális készletszintje.',
    matCategories: 'Kategóriák:',
    matAll: 'Mind',
    matSearch: 'Keresés...',
    matNoResults: 'Nincs találat a keresési feltételeknek megfelelően.',
    matCardView: 'Kártya nézet',
    matTableView: 'Táblázat nézet',
    matActions: 'Műveletek',
    matEdit: 'Módosítás',
    matDelete: 'Törlés',
    matIntake: 'Bevételezés',
    matCheckout: 'Kiadás',
    matPrint: 'Nyomtatás',

    // Movements View
    movTitle: 'Készletmozgások naplója',
    movSubtitle: 'A raktárban történt bevételezések és kiadások időrendi listája.',
    movNoResults: 'Nincs még rögzített készletmozgás.',
    movColType: 'TÍPUS',
    movColMaterial: 'ANYAG',
    movColQty: 'MENNYISÉG',
    movColDate: 'DÁTUM',
    movColUser: 'FELHASZNÁLÓ',
    movColNotes: 'MEGJEGYZÉS',
    movTypeIntake: 'Bevétel',
    movTypeCheckout: 'Kivétel',

    // QR Codes View
    qrTitle: 'QR-kód Generátor',
    qrSubtitle: 'Itt nyomtathatsz QR-kódot a raktári anyagokhoz a könnyebb beazonosítás és beolvasás érdekében.',
    qrColAction: 'Nyomtatás',

    // Users View
    usrTitle: 'Felhasználók kezelése',
    usrSubtitle: 'A rendszerhez hozzáférő raktári dolgozók és jogosultságok.',
    usrColName: 'NÉV',
    usrColEmail: 'EMAIL',
    usrColRole: 'SZEREPKÖR',

    // Settings View
    setProfileTitle: 'Profil beállítások',
    setLabelName: 'Név',
    setPlaceholderName: 'Teljes név',
    setLabelEmail: 'Email cím (nem módosítható)',
    setLabelRole: 'Szerepkör (adminisztrációs)',
    setLabelOldPwd: 'Régi jelszó (opcionális)',
    setPlaceholderOldPwd: 'Adja meg a jelenlegi jelszavát',
    setLabelNewPwd: 'Új jelszó (opcionális)',
    setPlaceholderNewPwd: 'Adja meg az új jelszót',
    setForgotPwd: 'Elfelejtetted a régi jelszavad? (Emlékeztető küldése)',
    setLanguageTitle: 'Nyelvválasztás / Language / Sprache',
    setLanguageDesc: 'Válaszd ki a rendszer nyelvét (Select language / Sprache wählen):',
    setAvatarDesc: 'Módosítsd a profilképet a bal alsó gombbal, vagy töröld a jobb alsó gombbal.',
    setSuccessAll: 'A profil adatok és a jelszó is sikeresen frissült!',
    setSuccessPwd: 'Jelszó sikeresen megváltoztatva!',
    setSuccessProfile: 'Profil adatok sikeresen elmentve!',
    setSuccessGeneral: 'Változtatások sikeresen elmentve!',
    setErrorName: 'A név megadása kötelező!',
    setErrorPwdMatch: 'A jelszó módosításához a régi és az új jelszó megadása is kötelező!',
    setErrorPwdLength: 'Az új jelszónak legalább 6 karakterből kell állnia!',

    // Login View
    loginTitle: 'Bejelentkezés a rendszerbe',
    loginLabelEmail: 'Email cím',
    loginLabelPwd: 'Jelszó',
    loginBtnSubmit: 'Bejelentkezés',
    loginRemember: 'Emlékezz rám',
    loginNoAccount: 'Nincs fiókod? Regisztráció',
    loginHaveAccount: 'Van már fiókod? Bejelentkezés',
    loginRegisterTitle: 'Regisztráció',
    loginBtnRegister: 'Regisztráció',
    loginRoleAdmin: 'Raktárvezető (Admin)',
    loginRoleOperator: 'Raktári dolgozó (Kezelő)',
    loginLabelFullName: 'Teljes név',
    loginLabelRole: 'Szerepkör',
  },
  en: {
    // Sidebar & Navigation
    appName: 'SmartFarm Inventory',
    version: 'Version 1.2.0',
    navDashboard: 'Dashboard',
    navMaterials: 'Materials',
    navNewMaterial: 'New Material',
    navMovements: 'Movements',
    navQrCodes: 'QR Codes',
    navUsers: 'Users',
    navSettings: 'Settings',
    navLogout: 'Logout',

    // Header & General UI
    roleAdmin: 'Warehouse Manager',
    roleOperator: 'Warehouse Worker',
    roleKezelo: 'Operator',
    searchPlaceholder: 'Search by material, code or location...',
    qrScanBtn: 'Scan QR',
    demoNotice: 'The system is currently running in offline Demo / LocalStorage mode.',
    demoLink: 'Configure Supabase connection settings',
    loading: 'Loading...',
    save: 'Save',
    saveData: 'Save Data',
    saving: 'Saving...',
    savingData: 'Saving Data...',
    cancel: 'Cancel',

    // Dashboard Overview
    dbTitle: 'Dashboard Overview',
    dbSubtitle: 'Overview of warehouse stock and key performance metrics.',
    cardTotalMaterials: 'Total Materials',
    cardLowStock: 'Low Stock',
    cardTodayMovements: "Today's Movements",
    levelGreen: 'Green level (>70%)',
    levelYellow: 'Yellow level (40-70%)',
    levelRed: 'Red level (<40%)',
    criticalStockTitle: 'Critical Stock Materials',
    viewAllCritical: 'View All Critical Materials',
    categoryDistribution: 'Category Distribution',
    totalText: 'TOTAL',
    statStatus: 'STATUS',
    statId: 'ID',
    statName: 'NAME',
    statStock: 'STOCK',
    statMax: 'MAX',
    statLevel: 'LEVEL',
    statLocation: 'LOCATION',
    comparedToLastWeek: 'compared to last week',
    comparedToYesterday: 'compared to yesterday',

    // Materials View
    matTitle: 'Warehouse Stock',
    matSubtitle: 'List of all registered materials and their current stock levels.',
    matCategories: 'Categories:',
    matAll: 'All',
    matSearch: 'Search...',
    matNoResults: 'No materials found matching search criteria.',
    matCardView: 'Card View',
    matTableView: 'Table View',
    matActions: 'Actions',
    matEdit: 'Edit',
    matDelete: 'Delete',
    matIntake: 'Intake',
    matCheckout: 'Checkout',
    matPrint: 'Print',

    // Movements View
    movTitle: 'Inventory Movements Log',
    movSubtitle: 'Chronological list of warehouse intakes and checkouts.',
    movNoResults: 'No inventory movements recorded yet.',
    movColType: 'TYPE',
    movColMaterial: 'MATERIAL',
    movColQty: 'QUANTITY',
    movColDate: 'DATE',
    movColUser: 'USER',
    movColNotes: 'NOTES',
    movTypeIntake: 'Intake',
    movTypeCheckout: 'Checkout',

    // QR Codes View
    qrTitle: 'QR Code Generator',
    qrSubtitle: 'Generate and print QR codes for materials to scan and identify them easily.',
    qrColAction: 'Print',

    // Users View
    usrTitle: 'User Management',
    usrSubtitle: 'Warehouse workers and permissions accessing the system.',
    usrColName: 'NAME',
    usrColEmail: 'EMAIL',
    usrColRole: 'ROLE',

    // Settings View
    setProfileTitle: 'Profile Settings',
    setLabelName: 'Name',
    setPlaceholderName: 'Full name',
    setLabelEmail: 'Email Address (read-only)',
    setLabelRole: 'Role (administrative)',
    setLabelOldPwd: 'Old Password (optional)',
    setPlaceholderOldPwd: 'Enter your current password',
    setLabelNewPwd: 'New Password (optional)',
    setPlaceholderNewPwd: 'Enter your new password',
    setForgotPwd: 'Forgot your old password? (Send reminder)',
    setLanguageTitle: 'Language Selection / Nyelvválasztás / Sprache',
    setLanguageDesc: 'Select system language (Nyelvválasztás / Sprache wählen):',
    setAvatarDesc: 'Change profile picture with the bottom-left button, or delete with the bottom-right button.',
    setSuccessAll: 'Profile data and password saved successfully!',
    setSuccessPwd: 'Password changed successfully!',
    setSuccessProfile: 'Profile data saved successfully!',
    setSuccessGeneral: 'Changes saved successfully!',
    setErrorName: 'Name is required!',
    setErrorPwdMatch: 'Both old and new password fields are required to change your password!',
    setErrorPwdLength: 'New password must be at least 6 characters long!',

    // Login View
    loginTitle: 'Sign in to the system',
    loginLabelEmail: 'Email Address',
    loginLabelPwd: 'Password',
    loginBtnSubmit: 'Sign In',
    loginRemember: 'Remember me',
    loginNoAccount: "Don't have an account? Sign Up",
    loginHaveAccount: 'Already have an account? Sign In',
    loginRegisterTitle: 'Sign Up',
    loginBtnRegister: 'Sign Up',
    loginRoleAdmin: 'Warehouse Manager (Admin)',
    loginRoleOperator: 'Warehouse Worker (Operator)',
    loginLabelFullName: 'Full Name',
    loginLabelRole: 'Role',
  },
  de: {
    // Sidebar & Navigation
    appName: 'SmartFarm Inventar',
    version: 'Version 1.2.0',
    navDashboard: 'Dashboard',
    navMaterials: 'Materialien',
    navNewMaterial: 'Neues Material',
    navMovements: 'Bewegungen',
    navQrCodes: 'QR-Codes',
    navUsers: 'Benutzer',
    navSettings: 'Einstellungen',
    navLogout: 'Abmelden',

    // Header & General UI
    roleAdmin: 'Lagerleiter',
    roleOperator: 'Lagermitarbeiter',
    roleKezelo: 'Bediener',
    searchPlaceholder: 'Nach Material, Code oder Ort suchen...',
    qrScanBtn: 'QR Scannen',
    demoNotice: 'Das System läuft derzeit im Offline-Demo- / LocalStorage-Modus.',
    demoLink: 'Supabase-Verbindungseinstellungen konfigurieren',
    loading: 'Laden...',
    save: 'Speichern',
    saveData: 'Daten speichern',
    saving: 'Speichern...',
    savingData: 'Daten werden gespeichert...',
    cancel: 'Abbrechen',

    // Dashboard Overview
    dbTitle: 'Dashboard-Übersicht',
    dbSubtitle: 'Übersicht über den Lagerbestand und wichtige Kennzahlen.',
    cardTotalMaterials: 'Materialien Gesamt',
    cardLowStock: 'Niedriger Bestand',
    cardTodayMovements: 'Heutige Bewegungen',
    levelGreen: 'Grüner Bereich (>70%)',
    levelYellow: 'Gelber Bereich (40-70%)',
    levelRed: 'Roter Bereich (<40%)',
    criticalStockTitle: 'Kritische Lagerbestände',
    viewAllCritical: 'Alle kritischen Materialien anzeigen',
    categoryDistribution: 'Kategorieverteilung',
    totalText: 'GESAMT',
    statStatus: 'STATUS',
    statId: 'ID',
    statName: 'NAME',
    statStock: 'BESTAND',
    statMax: 'MAX',
    statLevel: 'BEREICH',
    statLocation: 'ORT',
    comparedToLastWeek: 'im Vergleich zur Vorwoche',
    comparedToYesterday: 'im Vergleich zu gestern',

    // Materials View
    matTitle: 'Lagerbestand',
    matSubtitle: 'Liste aller registrierten Materialien und ihrer aktuellen Bestände.',
    matCategories: 'Kategorien:',
    matAll: 'Alle',
    matSearch: 'Suchen...',
    matNoResults: 'Keine Materialien gefunden, die den Kriterien entsprechen.',
    matCardView: 'Kartenansicht',
    matTableView: 'Tabellenansicht',
    matActions: 'Aktionen',
    matEdit: 'Bearbeiten',
    matDelete: 'Löschen',
    matIntake: 'Einlagern',
    matCheckout: 'Auslagern',
    matPrint: 'Drucken',

    // Movements View
    movTitle: 'Lagerbewegungsprotokoll',
    movSubtitle: 'Chronologische Liste der Ein- und Auslagerungen im Lager.',
    movNoResults: 'Bisher wurden keine Lagerbewegungen aufgezeichnet.',
    movColType: 'TYP',
    movColMaterial: 'MATERIAL',
    movColQty: 'MENGE',
    movColDate: 'DATUM',
    movColUser: 'BENUTZER',
    movColNotes: 'NOTIZ',
    movTypeIntake: 'Eingang',
    movTypeCheckout: 'Ausgang',

    // QR Codes View
    qrTitle: 'QR-Code-Generator',
    qrSubtitle: 'Generieren und drucken Sie QR-Codes für Materialien, um sie einfach zu identifizieren.',
    qrColAction: 'Drucken',

    // Users View
    usrTitle: 'Benutzerverwaltung',
    usrSubtitle: 'Lagermitarbeiter und Berechtigungen für den Systemzugriff.',
    usrColName: 'NAME',
    usrColEmail: 'E-MAIL',
    usrColRole: 'ROLLE',

    // Settings View
    setProfileTitle: 'Profileinstellungen',
    setLabelName: 'Name',
    setPlaceholderName: 'Vollständiger Name',
    setLabelEmail: 'E-Mail-Adresse (schreibgeschützt)',
    setLabelRole: 'Rolle (administrativ)',
    setLabelOldPwd: 'Altes Passwort (optional)',
    setPlaceholderOldPwd: 'Geben Sie Ihr aktuelles Passwort ein',
    setLabelNewPwd: 'Neues Passwort (optional)',
    setPlaceholderNewPwd: 'Geben Sie Ihr neues Passwort ein',
    setForgotPwd: 'Altes Passwort vergessen? (Erinnerung senden)',
    setLanguageTitle: 'Sprachauswahl / Nyelvválasztás / Language',
    setLanguageDesc: 'Wählen Sie die Systemspache (Nyelvválasztás / Language select):',
    setAvatarDesc: 'Ändern Sie das Profilbild mit der Taste unten links, oder löschen Sie es mit der Taste unten rechts.',
    setSuccessAll: 'Profildaten und Passwort erfolgreich gespeichert!',
    setSuccessPwd: 'Passwort erfolgreich geändert!',
    setSuccessProfile: 'Profildaten erfolgreich gespeichert!',
    setSuccessGeneral: 'Änderungen erfolgreich gespeichert!',
    setErrorName: 'Name ist erforderlich!',
    setErrorPwdMatch: 'Sowohl das alte als auch das neue Passwort müssen angegeben werden!',
    setErrorPwdLength: 'Das neue Passwort muss mindestens 6 Zeichen lang sein!',

    // Login View
    loginTitle: 'Am System anmelden',
    loginLabelEmail: 'E-Mail-Adresse',
    loginLabelPwd: 'Passwort',
    loginBtnSubmit: 'Anmelden',
    loginRemember: 'Angemeldet bleiben',
    loginNoAccount: 'Noch kein Konto? Registrieren',
    loginHaveAccount: 'Bereits ein Konto? Anmelden',
    loginRegisterTitle: 'Registrieren',
    loginBtnRegister: 'Registrieren',
    loginRoleAdmin: 'Lagerleiter (Admin)',
    loginRoleOperator: 'Lagermitarbeiter (Bediener)',
    loginLabelFullName: 'Vollständiger Name',
    loginLabelRole: 'Rolle',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('smartfarm_language') as Language) || 'hu';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('smartfarm_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['hu'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
