import React, { useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Settings as SettingsIcon, Palette, GraduationCap, Database, Download, Upload,
  RotateCcw, Save, ShieldCheck, Info, AlertTriangle, CheckCircle2, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { storageService, STORAGE_KEYS, DEMO_USERS, DEMO_STUDENTS, DEMO_FACULTY, DEMO_MARKS, DEMO_ATTENDANCE } from '../services/storageService';
import { GRADING_SCALE } from '../utils/calculations';

const SETTINGS_KEY = STORAGE_KEYS.SETTINGS;
const DATA_KEYS = [
  STORAGE_KEYS.USERS, STORAGE_KEYS.STUDENTS, STORAGE_KEYS.FACULTY,
  STORAGE_KEYS.MARKS, STORAGE_KEYS.ATTENDANCE
];

const cardStyle = {
  background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
  borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem'
};
const fieldStyle = {
  width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px',
  border: '1px solid var(--color-border)', background: 'var(--color-bg-main)',
  color: 'var(--color-text-primary)', outline: 'none'
};
const primaryButton = {
  display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem',
  border: 0, borderRadius: '8px', background: 'var(--color-primary)', color: '#fff',
  fontWeight: 600, cursor: 'pointer'
};
const secondaryButton = {
  ...primaryButton, background: 'var(--color-bg-main)', color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border)'
};

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('general');
  const savedSettings = storageService.getItem(SETTINGS_KEY, {});
  const [gradingScale, setGradingScale] = useState(() => savedSettings.gradingScale || GRADING_SCALE);
  const [institutionName, setInstitutionName] = useState(savedSettings.institutionName || 'Apex University');
  const [academicYear, setAcademicYear] = useState(savedSettings.academicYear || '2026-2027');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'grading', label: 'Grading Scale', icon: GraduationCap },
    { id: 'data', label: 'Data & Backup', icon: Database }
  ];

  const stats = useMemo(() => ({
    students: storageService.getItem(STORAGE_KEYS.STUDENTS, []).length,
    faculty: storageService.getItem(STORAGE_KEYS.FACULTY, []).length,
    marks: storageService.getItem(STORAGE_KEYS.MARKS, []).length,
    attendance: storageService.getItem(STORAGE_KEYS.ATTENDANCE, []).length
  }), []);

  const saveSettings = () => {
    setSaving(true);
    const settings = { institutionName: institutionName.trim(), academicYear: academicYear.trim(), gradingScale };
    if (!settings.institutionName || !settings.academicYear) {
      toast.error('Please complete the institution name and academic year.');
      setSaving(false);
      return;
    }
    if (!storageService.setItem(SETTINGS_KEY, settings)) {
      toast.error('Could not save settings. Check browser storage availability.');
    } else {
      toast.success('Settings saved successfully.');
    }
    setSaving(false);
  };

  const updateGrade = (index, field, value) => {
    setGradingScale(current => current.map((grade, i) => i === index
      ? { ...grade, [field]: ['gradePoint', 'minPercentage', 'maxPercentage'].includes(field) ? Number(value) : value }
      : grade));
  };

  const validateGradingScale = () => {
    if (!gradingScale.length) return 'Add at least one grade.';
    const sorted = [...gradingScale].sort((a, b) => b.minPercentage - a.minPercentage);
    if (sorted.some(g => !g.grade.trim() || !Number.isFinite(g.gradePoint) || g.gradePoint < 0 || g.gradePoint > 10 || g.minPercentage < 0 || g.maxPercentage > 100 || g.minPercentage > g.maxPercentage)) {
      return 'Check grade names, grade points (0–10), and percentage ranges (0–100).';
    }
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i].maxPercentage >= sorted[i - 1].minPercentage) return 'Grade percentage ranges must not overlap.';
    }
    return null;
  };

  const saveGradingScale = () => {
    const error = validateGradingScale();
    if (error) { toast.error(error); return; }
    const existing = storageService.getItem(SETTINGS_KEY, {});
    if (storageService.setItem(SETTINGS_KEY, { ...existing, institutionName, academicYear, gradingScale })) {
      toast.success('Grading scale saved. New mark calculations will use this scale.');
    } else toast.error('Unable to save grading scale.');
  };

  const exportBackup = () => {
    const backup = {
      application: 'Student Report Management System',
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      data: Object.fromEntries(Object.values(STORAGE_KEYS).map(key => [key, storageService.getItem(key, null)]))
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `srms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    toast.success('Backup downloaded.');
  };

  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed.application !== 'Student Report Management System' || !parsed.data || typeof parsed.data !== 'object') {
        throw new Error('This file is not a valid SRMS backup.');
      }
      const allowed = Object.values(STORAGE_KEYS);
      const entries = Object.entries(parsed.data).filter(([key]) => allowed.includes(key));
      if (!entries.length) throw new Error('The backup does not contain SRMS data.');
      if (!window.confirm(`Restore ${entries.length} data sections from this backup? Current data in those sections will be replaced.`)) return;
      for (const [key, value] of entries) {
        if (value === null) storageService.removeItem(key);
        else if (!storageService.setItem(key, value)) throw new Error(`Could not restore ${key}.`);
      }
      toast.success('Backup restored. Reloading the application…');
      window.setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      toast.error(error.message || 'Unable to read this backup file.');
    } finally {
      event.target.value = '';
    }
  };

  const resetDemoData = () => {
    const confirmed = window.confirm('Reset all student, faculty, marks, attendance and user data to the original demo records? This cannot be undone. Export a backup first if you need to keep your data.');
    if (!confirmed) return;
    const defaults = {
      [STORAGE_KEYS.USERS]: DEMO_USERS,
      [STORAGE_KEYS.STUDENTS]: DEMO_STUDENTS,
      [STORAGE_KEYS.FACULTY]: DEMO_FACULTY,
      [STORAGE_KEYS.MARKS]: DEMO_MARKS,
      [STORAGE_KEYS.ATTENDANCE]: DEMO_ATTENDANCE
    };
    Object.entries(defaults).forEach(([key, value]) => storageService.setItem(key, value));
    storageService.removeItem(STORAGE_KEYS.AUTH_USER);
    toast.success('Demo data restored. Please sign in again.');
    window.location.href = '/login';
  };

  const resetGradingScale = () => {
    setGradingScale(GRADING_SCALE.map(item => ({ ...item })));
    toast.info('Default grading scale loaded. Click Save Grading Scale to apply it.');
  };

  const renderGeneral = () => (
    <section style={cardStyle}>
      <h2 style={sectionTitle}>Institution details</h2>
      <p style={muted}>Set the institution name and academic year used by the application.</p>
      <div className="settings-form-grid" style={formGrid}>
        <label style={labelStyle}>Institution name<input style={fieldStyle} value={institutionName} onChange={e => setInstitutionName(e.target.value)} placeholder="Enter institution name" /></label>
        <label style={labelStyle}>Current academic year<input style={fieldStyle} value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="e.g. 2026-2027" /></label>
      </div>
      <button style={primaryButton} onClick={saveSettings} disabled={saving}><Save size={16} />{saving ? 'Saving…' : 'Save Changes'}</button>
    </section>
  );

  const renderAppearance = () => (
    <section style={cardStyle}>
      <h2 style={sectionTitle}>Display preferences</h2>
      <p style={muted}>Choose how the application looks on this device. Your choice is saved automatically.</p>
      <div style={themeOption}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isDark ? <Moon size={22} /> : <Sun size={22} />}
          <div><strong>{isDark ? 'Dark mode' : 'Light mode'}</strong><div style={muted}>Currently active theme</div></div>
        </div>
        <button style={secondaryButton} onClick={toggleTheme}>{isDark ? <Sun size={16} /> : <Moon size={16} />}{isDark ? 'Switch to Light' : 'Switch to Dark'}</button>
      </div>
      <div style={{ ...muted, marginTop: '1rem' }}>Theme preference: <strong>{theme}</strong></div>
    </section>
  );

  const renderGrading = () => (
    <section style={cardStyle}>
      <div style={spaceBetween}>
        <div><h2 style={sectionTitle}>Grading scale</h2><p style={muted}>Edit the grade boundaries and grade points used for academic calculations.</p></div>
        <button style={secondaryButton} onClick={resetGradingScale}><RotateCcw size={15} />Restore Default</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead><tr>{['Grade', 'Grade point', 'Minimum %', 'Maximum %', 'Description', 'Result'].map(x => <th style={thStyle} key={x}>{x}</th>)}</tr></thead>
          <tbody>{gradingScale.map((grade, index) => (
            <tr key={`${grade.grade}-${index}`}>
              <td style={tdStyle}><input aria-label="Grade name" style={{ ...fieldStyle, minWidth: 70 }} value={grade.grade} onChange={e => updateGrade(index, 'grade', e.target.value)} /></td>
              <td style={tdStyle}><input aria-label="Grade point" type="number" min="0" max="10" step="0.1" style={{ ...fieldStyle, minWidth: 85 }} value={grade.gradePoint} onChange={e => updateGrade(index, 'gradePoint', e.target.value)} /></td>
              <td style={tdStyle}><input aria-label="Minimum percentage" type="number" min="0" max="100" step="0.01" style={{ ...fieldStyle, minWidth: 95 }} value={grade.minPercentage} onChange={e => updateGrade(index, 'minPercentage', e.target.value)} /></td>
              <td style={tdStyle}><input aria-label="Maximum percentage" type="number" min="0" max="100" step="0.01" style={{ ...fieldStyle, minWidth: 95 }} value={grade.maxPercentage} onChange={e => updateGrade(index, 'maxPercentage', e.target.value)} /></td>
              <td style={tdStyle}><input aria-label="Grade description" style={{ ...fieldStyle, minWidth: 125 }} value={grade.description} onChange={e => updateGrade(index, 'description', e.target.value)} /></td>
              <td style={tdStyle}><select style={fieldStyle} value={String(grade.passed)} onChange={e => updateGrade(index, 'passed', e.target.value === 'true')}><option value="true">Pass</option><option value="false">Fail</option></select></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <button style={secondaryButton} onClick={() => setGradingScale(current => [...current, { grade: 'New', gradePoint: 0, minPercentage: 0, maxPercentage: 0, description: 'New grade', passed: false }])}>＋ Add Grade</button>
        <button style={primaryButton} onClick={saveGradingScale}><Save size={16} />Save Grading Scale</button>
      </div>
      <p style={{ ...muted, marginTop: '0.85rem' }}><Info size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />Percentage ranges cannot overlap. Grade points must be between 0 and 10.</p>
    </section>
  );

  const renderData = () => (
    <>
      <section style={cardStyle}>
        <h2 style={sectionTitle}>Data overview</h2>
        <p style={muted}>Records currently stored in this browser.</p>
        <div style={statsGrid}>{[
          ['Students', stats.students], ['Faculty', stats.faculty], ['Marks records', stats.marks], ['Attendance records', stats.attendance]
        ].map(([label, value]) => <div key={label} style={statTile}><strong style={{ fontSize: '1.5rem' }}>{value}</strong><span style={muted}>{label}</span></div>)}</div>
      </section>
      <section style={cardStyle}>
        <h2 style={sectionTitle}>Backup and restore</h2>
        <p style={muted}>Download a JSON copy of your application data or restore data from an earlier SRMS backup.</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button style={primaryButton} onClick={exportBackup}><Download size={16} />Download Backup</button>
          <button style={secondaryButton} onClick={() => fileInputRef.current?.click()}><Upload size={16} />Restore Backup</button>
          <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={importBackup} style={{ display: 'none' }} />
        </div>
        <div style={{ ...notice, marginTop: '1rem' }}><ShieldCheck size={18} /><span>Backups are saved locally as JSON files. Keep them in a safe place. Restoring replaces the matching records in this browser.</span></div>
      </section>
      <section style={{ ...cardStyle, borderColor: 'var(--color-danger, #dc5656)' }}>
        <h2 style={{ ...sectionTitle, color: 'var(--color-danger, #dc5656)' }}>Danger zone</h2>
        <p style={muted}>Restore the original sample records and sign out. Your current records will be permanently replaced.</p>
        <button style={{ ...primaryButton, background: 'var(--color-danger, #c83d3d)', marginTop: '0.75rem' }} onClick={resetDemoData}><AlertTriangle size={16} />Reset Demo Data</button>
      </section>
    </>
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}><SettingsIcon size={25} /><h1 style={{ margin: 0, fontSize: '1.65rem', color: 'var(--color-text-primary)' }}>Application Settings</h1></div>
        <p style={muted}>Manage institution preferences, appearance, grading rules and application data.</p>
      </div>
      <div style={tabList} role="tablist" aria-label="Settings sections">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} style={{ ...tabButton, ...(activeTab === id ? activeTabButton : {}) }}><Icon size={17} />{label}</button>)}
      </div>
      {activeTab === 'general' && renderGeneral()}
      {activeTab === 'appearance' && renderAppearance()}
      {activeTab === 'grading' && renderGrading()}
      {activeTab === 'data' && renderData()}
      <div style={{ ...muted, display: 'flex', alignItems: 'center', gap: 6, marginTop: '1rem' }}><CheckCircle2 size={14} />Settings are stored in this browser using local storage.</div>
    </div>
  );
};

const sectionTitle = { margin: '0 0 0.35rem', fontSize: '1.1rem', color: 'var(--color-text-primary)' };
const muted = { color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 1rem' };
const labelStyle = { display: 'grid', gap: '0.45rem', color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.9rem' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', margin: '1.25rem 0' };
const spaceBetween = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' };
const themeOption = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 10 };
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: 760 };
const thStyle = { textAlign: 'left', padding: '0.75rem 0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', borderBottom: '1px solid var(--color-border)' };
const tdStyle = { padding: '0.55rem 0.4rem', borderBottom: '1px solid var(--color-border)' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '1rem' };
const statTile = { display: 'grid', gap: '0.25rem', padding: '1rem', borderRadius: 9, background: 'var(--color-bg-main)', color: 'var(--color-text-primary)' };
const notice = { display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.8rem', borderRadius: 8, background: 'var(--color-bg-main)', color: 'var(--color-text-secondary)', fontSize: '0.85rem' };
const tabList = { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' };
const tabButton = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid transparent', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600 };
const activeTabButton = { background: 'var(--color-primary-light, rgba(59,130,246,0.12))', color: 'var(--color-primary)', borderColor: 'var(--color-border)' };

export default Settings;
