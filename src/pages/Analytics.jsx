import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, GraduationCap, TrendingUp, RefreshCw, Download,
  BookOpen, ClipboardCheck, Award, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { storageService } from '../services/storageService';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
const card = {
  background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
  borderRadius: 14, padding: '1.15rem', minWidth: 0
};
const selectStyle = {
  padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--color-border)',
  background: 'var(--color-bg-card)', color: 'var(--color-text-primary)'
};
const number = value => Number.isFinite(value) ? value : 0;
const average = values => values.length ? values.reduce((sum, value) => sum + number(value), 0) / values.length : 0;
const percent = value => `${number(value).toFixed(1)}%`;

function downloadCsv(rows, filename) {
  if (!rows.length) { toast.info('There is no analytics data to export.'); return; }
  const headers = Object.keys(rows[0]);
  const escape = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map(row => headers.map(key => escape(row[key])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
  toast.success('Analytics CSV downloaded.');
}

const Analytics = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState('All');

  const source = useMemo(() => {
    try {
      return {
        students: storageService.getStudents() || [],
        marks: storageService.getMarks() || [],
        attendance: storageService.getAttendance() || []
      };
    } catch (error) {
      console.error('Unable to load analytics data:', error);
      return { students: [], marks: [], attendance: [] };
    }
  }, [refreshKey]);

  const departments = useMemo(() => [...new Set(source.students.map(s => s.department).filter(Boolean))].sort(), [source.students]);
  const semesters = useMemo(() => [...new Set(source.students.map(s => String(s.semester)).filter(Boolean))].sort((a, b) => Number(a) - Number(b)), [source.students]);

  const data = useMemo(() => {
    const filteredStudents = source.students.filter(student =>
      (department === 'All' || student.department === department) &&
      (semester === 'All' || String(student.semester) === semester)
    );
    const studentIds = new Set(filteredStudents.map(student => student.studentId));
    const marks = source.marks.filter(mark => studentIds.has(mark.studentId) &&
      (semester === 'All' || String(mark.semester) === semester) &&
      (department === 'All' || mark.department === department));
    const attendance = source.attendance.filter(record => studentIds.has(record.studentId));

    const gradeOrder = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'];
    const gradeCounts = gradeOrder.map(grade => ({ grade, students: marks.filter(mark => String(mark.grade || '').toUpperCase() === grade).length })).filter(item => item.students > 0);
    const otherGrades = [...new Set(marks.map(mark => String(mark.grade || 'Not graded').toUpperCase()))].filter(grade => !gradeOrder.includes(grade));
    otherGrades.forEach(grade => gradeCounts.push({ grade, students: marks.filter(mark => String(mark.grade || 'Not graded').toUpperCase() === grade).length }));

    const subjectMap = new Map();
    marks.forEach(mark => {
      const key = mark.subjectName || mark.subjectId || 'Unknown subject';
      if (!subjectMap.has(key)) subjectMap.set(key, []);
      subjectMap.get(key).push(number(mark.percentage));
    });
    const subjectPerformance = [...subjectMap.entries()].map(([subject, scores]) => ({
      subject: subject.length > 25 ? `${subject.slice(0, 22)}…` : subject,
      average: Number(average(scores).toFixed(1)), records: scores.length
    })).sort((a, b) => b.average - a.average);

    const departmentMap = new Map();
    marks.forEach(mark => {
      const key = mark.department || filteredStudents.find(s => s.studentId === mark.studentId)?.department || 'Other';
      if (!departmentMap.has(key)) departmentMap.set(key, []);
      departmentMap.get(key).push(number(mark.percentage));
    });
    const departmentPerformance = [...departmentMap.entries()].map(([name, scores]) => ({
      department: name.length > 18 ? `${name.slice(0, 15)}…` : name,
      average: Number(average(scores).toFixed(1))
    }));

    const attendanceCount = attendance.reduce((counts, item) => {
      const status = String(item.status || 'Unknown');
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    const attendanceBreakdown = Object.entries(attendanceCount).map(([name, value]) => ({ name, value }));
    const attendanceTotal = attendance.length;
    const attended = attendance.filter(item => ['present', 'late', 'excused'].includes(String(item.status).toLowerCase())).length;
    const attendanceRate = attendanceTotal ? attended / attendanceTotal * 100 : 0;

    const studentPerformance = filteredStudents.map(student => {
      const ownMarks = marks.filter(mark => mark.studentId === student.studentId);
      const score = ownMarks.length ? average(ownMarks.map(mark => mark.percentage)) : null;
      return { ...student, average: score, records: ownMarks.length };
    }).filter(student => student.average !== null).sort((a, b) => b.average - a.average);

    const passRecords = marks.filter(mark => mark.isPassed === true || (mark.isPassed == null && number(mark.percentage) >= 40));
    return {
      students: filteredStudents, marks, attendance, gradeCounts, subjectPerformance,
      departmentPerformance, attendanceBreakdown, attendanceRate,
      avgScore: average(marks.map(mark => mark.percentage)),
      passRate: marks.length ? passRecords.length / marks.length * 100 : 0,
      studentPerformance,
      topStudents: studentPerformance.slice(0, 5),
      lowAttendance: filteredStudents.map(student => {
        const records = attendance.filter(item => item.studentId === student.studentId);
        const present = records.filter(item => ['present', 'late', 'excused'].includes(String(item.status).toLowerCase())).length;
        return { ...student, attendance: records.length ? present / records.length * 100 : null };
      }).filter(student => student.attendance !== null && student.attendance < 75).sort((a, b) => a.attendance - b.attendance).slice(0, 5)
    };
  }, [source, department, semester]);

  const handleExport = () => downloadCsv(data.students.map(student => {
    const performance = data.studentPerformance.find(item => item.studentId === student.studentId);
    const attendanceRecords = data.attendance.filter(item => item.studentId === student.studentId);
    const attended = attendanceRecords.filter(item => ['present', 'late', 'excused'].includes(String(item.status).toLowerCase())).length;
    return {
      studentId: student.studentId, name: student.fullName, department: student.department,
      semester: student.semester, averagePercentage: performance ? performance.average.toFixed(1) : 'No marks',
      attendancePercentage: attendanceRecords.length ? (attended / attendanceRecords.length * 100).toFixed(1) : 'No attendance'
    };
  }), 'srms-analytics.csv');

  const Stat = ({ icon: Icon, label, value, note }) => (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, display: 'grid', placeItems: 'center', color: 'var(--color-primary)', background: 'var(--color-primary-light)', flexShrink: 0 }}><Icon size={22} /></div>
      <div style={{ minWidth: 0 }}><div style={{ color: 'var(--color-text-secondary)', fontSize: '.78rem', fontWeight: 700 }}>{label}</div><div style={{ color: 'var(--color-text-primary)', fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.35 }}>{value}</div><div style={{ color: 'var(--color-text-muted)', fontSize: '.75rem' }}>{note}</div></div>
    </div>
  );

  const ChartEmpty = () => <div style={{ minHeight: 220, display: 'grid', placeItems: 'center', color: 'var(--color-text-muted)', textAlign: 'center' }}>No records available for the selected filters.</div>;
  const tooltipStyle = { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)' };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1500, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div><h1 style={{ color: 'var(--color-text-primary)', fontSize: '1.65rem', fontWeight: 800 }}>Institutional Analytics</h1><p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>Explore academic performance, grade distribution and attendance trends.</p></div>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setRefreshKey(value => value + 1)} className="btn btn-secondary"><RefreshCw size={16} /> Refresh</button>
          <button type="button" onClick={handleExport} className="btn btn-primary"><Download size={16} /> Export CSV</button>
        </div>
      </div>

      <div style={{ ...card, display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
        <strong style={{ color: 'var(--color-text-primary)', marginRight: '.25rem' }}>Filters</strong>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--color-text-secondary)', fontSize: '.85rem' }}>Department
          <select value={department} onChange={event => setDepartment(event.target.value)} style={selectStyle}><option value="All">All departments</option>{departments.map(item => <option key={item} value={item}>{item}</option>)}</select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--color-text-secondary)', fontSize: '.85rem' }}>Semester
          <select value={semester} onChange={event => setSemester(event.target.value)} style={selectStyle}><option value="All">All semesters</option>{semesters.map(item => <option key={item} value={item}>Semester {item}</option>)}</select>
        </label>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '.78rem' }}>Figures update based on selected filters.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <Stat icon={Users} label="TOTAL STUDENTS" value={data.students.length} note="Students in selected group" />
        <Stat icon={BookOpen} label="MARKS RECORDS" value={data.marks.length} note="Subject assessment records" />
        <Stat icon={TrendingUp} label="AVERAGE SCORE" value={percent(data.avgScore)} note="Across available marks records" />
        <Stat icon={Award} label="PASS RATE" value={percent(data.passRate)} note="Based on assessment records" />
        <Stat icon={ClipboardCheck} label="ATTENDANCE RATE" value={percent(data.attendanceRate)} note={`${data.attendance.length} attendance entries`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <section style={card}>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1rem', marginBottom: 4 }}>Grade Distribution</h2><p style={{ color: 'var(--color-text-muted)', fontSize: '.78rem', marginBottom: 12 }}>Number of assessment records in each grade</p>
          {data.gradeCounts.length ? <ResponsiveContainer width="100%" height={260}><BarChart data={data.gradeCounts} margin={{ top: 8, right: 10, left: -18, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /><XAxis dataKey="grade" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="students" name="Records" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <ChartEmpty />}
        </section>
        <section style={card}>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1rem', marginBottom: 4 }}>Attendance Breakdown</h2><p style={{ color: 'var(--color-text-muted)', fontSize: '.78rem', marginBottom: 12 }}>Recorded attendance statuses</p>
          {data.attendanceBreakdown.length ? <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={data.attendanceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="48%" outerRadius={88} label={({ name, percent: slice }) => `${name} ${(slice * 100).toFixed(0)}%`}>{data.attendanceBreakdown.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /><Legend /></PieChart></ResponsiveContainer> : <ChartEmpty />}
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <section style={card}>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1rem', marginBottom: 4 }}>Department Performance</h2><p style={{ color: 'var(--color-text-muted)', fontSize: '.78rem', marginBottom: 12 }}>Average marks percentage by department</p>
          {data.departmentPerformance.length ? <ResponsiveContainer width="100%" height={270}><BarChart data={data.departmentPerformance} margin={{ top: 8, right: 12, left: -12, bottom: 35 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /><XAxis dataKey="department" angle={-15} textAnchor="end" interval={0} height={55} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} /><Tooltip contentStyle={tooltipStyle} formatter={value => [`${value}%`, 'Average']} /><Bar dataKey="average" name="Average" fill="#0d9488" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <ChartEmpty />}
        </section>
        <section style={card}>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1rem', marginBottom: 4 }}>Subject Performance</h2><p style={{ color: 'var(--color-text-muted)', fontSize: '.78rem', marginBottom: 12 }}>Average score by subject</p>
          {data.subjectPerformance.length ? <ResponsiveContainer width="100%" height={270}><BarChart data={data.subjectPerformance.slice(0, 8)} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /><XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} /><YAxis type="category" dataKey="subject" width={145} tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} formatter={value => [`${value}%`, 'Average']} /><Bar dataKey="average" fill="#8b5cf6" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer> : <ChartEmpty />}
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '1rem' }}>
        <section style={card}>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><GraduationCap size={18} /> Top Performers</h2>
          {data.topStudents.length ? <div className="table-wrapper"><table><thead><tr><th style={{ padding: 10, textAlign: 'left' }}>Student</th><th style={{ padding: 10, textAlign: 'left' }}>Department</th><th style={{ padding: 10, textAlign: 'right' }}>Average</th></tr></thead><tbody>{data.topStudents.map((student, index) => <tr key={student.studentId}><td style={{ padding: 10 }}><strong>{index + 1}. {student.fullName}</strong><div style={{ color: 'var(--color-text-muted)', fontSize: '.75rem' }}>{student.studentId}</div></td><td style={{ padding: 10 }}>{student.department || '—'}</td><td style={{ padding: 10, textAlign: 'right', fontWeight: 700 }}>{percent(student.average)}</td></tr>)}</tbody></table></div> : <ChartEmpty />}
        </section>
        <section style={card}>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={18} color="#d97706" /> Attendance Below 75%</h2><p style={{ color: 'var(--color-text-muted)', fontSize: '.78rem', marginBottom: 12 }}>Students with attendance records below the threshold</p>
          {data.lowAttendance.length ? <div className="table-wrapper"><table><thead><tr><th style={{ padding: 10, textAlign: 'left' }}>Student</th><th style={{ padding: 10, textAlign: 'left' }}>Class</th><th style={{ padding: 10, textAlign: 'right' }}>Attendance</th></tr></thead><tbody>{data.lowAttendance.map(student => <tr key={student.studentId}><td style={{ padding: 10 }}><strong>{student.fullName}</strong><div style={{ color: 'var(--color-text-muted)', fontSize: '.75rem' }}>{student.studentId}</div></td><td style={{ padding: 10 }}>{student.semester ? `Sem ${student.semester} - ${student.section || ''}` : '—'}</td><td style={{ padding: 10, textAlign: 'right', color: 'var(--color-danger)', fontWeight: 700 }}>{percent(student.attendance)}</td></tr>)}</tbody></table></div> : <div style={{ minHeight: 140, display: 'grid', placeItems: 'center', color: 'var(--color-text-muted)', textAlign: 'center' }}>No students below 75% in the selected group.</div>}
        </section>
      </div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '.75rem', marginTop: '1rem' }}>Analytics are calculated from the student, marks and attendance records stored in this browser. Add or update records in the relevant modules, then select Refresh to recalculate.</p>
    </div>
  );
};

export default Analytics;
