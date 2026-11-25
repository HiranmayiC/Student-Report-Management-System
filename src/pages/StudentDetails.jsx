import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/studentService';
import {
  ArrowLeft,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  BookOpen,
  ShieldCheck,
  Award,
  Users,
  AlertCircle
} from 'lucide-react';

const StudentDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  let student = null;
  let error = null;

  try {
    student = studentService.getById(user, id);
  } catch (err) {
    error = err.message;
  }

  const isSelf = user?.role === 'student' && user?.studentId === id;

  if (error) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <AlertCircle size={44} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Record Inaccessible</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0.75rem 0 1.5rem', fontSize: '0.92rem' }}>
            {error}
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Student Not Found</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0.75rem 0 1.5rem', fontSize: '0.92rem' }}>
            No student was found with identifier <strong>{id}</strong>.
          </p>
          <Link to="/students" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to={user?.role === 'student' ? '/dashboard' : '/students'}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} /> Back to {user?.role === 'student' ? 'Dashboard' : 'Student Directory'}
        </Link>
      </div>

      {/* Main Profile Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Avatar & Primary Identity */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
            <img
              src={student.avatar}
              alt={student.fullName}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-light)',
                border: '4px solid var(--color-border)',
                objectFit: 'cover'
              }}
            />
            {isSelf && (
              <span style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                backgroundColor: 'var(--color-success)',
                color: '#ffffff',
                borderRadius: 'var(--radius-full)',
                padding: '4px',
                boxShadow: '0 0 0 2px var(--color-bg-card)'
              }}>
                <ShieldCheck size={16} />
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {student.fullName}
          </h2>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
            {student.studentId}
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-info">{student.department}</span>
            <span className="badge badge-success">Enrolled Active</span>
          </div>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            fontSize: '0.88rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-text-secondary)' }}>
              <Mail size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-primary)', wordBreak: 'break-all' }}>{student.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-text-secondary)' }}>
              <Phone size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-primary)' }}>{student.phone}</span>
            </div>
            {student.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--color-text-secondary)' }}>
                <MapPin size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--color-text-primary)' }}>{student.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Academic Details & Guardian Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Academic Information Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BookOpen size={20} color="var(--color-primary)" /> Academic Standing
              </div>
              <span className="badge badge-info">Term: {student.academicYear || '2024-2025'}</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Current Semester
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '3px' }}>
                  Semester {student.semester}
                </div>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Assigned Section
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '3px' }}>
                  Section {student.section}
                </div>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Class Identifier
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '3px' }}>
                  {student.classId || `${student.department}-Sem${student.semester}`}
                </div>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Admission Date
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '3px' }}>
                  {student.admissionDate || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Guardian & Emergency Contact Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Users size={20} color="var(--color-primary)" /> Guardian & Emergency Contact
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Guardian Legal Name
                </span>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '2px' }}>
                  {student.guardianName || 'Unregistered'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Emergency Contact Phone
                </span>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '2px', color: 'var(--color-primary)' }}>
                  {student.guardianContact || 'Unregistered'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Date of Birth
                </span>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '2px' }}>
                  {student.dateOfBirth || 'Unregistered'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
