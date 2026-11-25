/**
 * Academic Report & Transcript Data Service
 * Aggregates student demographic profiles, complete semester-wise marks,
 * credit-weighted SGPA, multi-semester CGPA, and attendance standing.
 * Enforces dual-layer role-based access control.
 */

import { storageService } from './storageService.js';
import { studentService } from './studentService.js';
import { marksService } from './marksService.js';
import { attendanceService } from './attendanceService.js';
import { canAccessStudentRecord } from '../utils/rbacRules.js';

export const INSTITUTION_INFO = {
  name: 'APEX INSTITUTE OF TECHNOLOGY',
  department: 'Office of Academic Affairs & Controller of Examinations',
  accreditation: "Accredited 'A++' Grade by National Board • Autonomous University Center",
  address: '100 Innovation Boulevard, Tech Campus, Cambridge, MA 02142',
  phone: '+1 (555) 019-2834 • contact@apex.edu • www.apex.edu'
};

export const reportService = {
  /**
   * Compiles the complete institutional report dossier for a specific student.
   * Strictly enforces role-based access control.
   */
  generateStudentReportData: (currentUser, studentId) => {
    if (!currentUser) {
      throw new Error('Authentication required to generate academic reports.');
    }

    const allStudents = storageService.getStudents();
    const student = allStudents.find(s => s.studentId === studentId);
    if (!student) {
      throw new Error(`Student with ID "${studentId}" was not found in the institutional registry.`);
    }

    // Role-based authorization check
    const isAllowed = canAccessStudentRecord(currentUser, student, allStudents);
    if (!isAllowed) {
      throw new Error(`Access Denied: You are not authorized to access academic reports for student "${studentId}".`);
    }

    // Fetch academic marks and compute GPA progression
    let studentMarks = [];
    try {
      studentMarks = marksService.getByStudentId(currentUser, studentId);
    } catch {
      studentMarks = [];
    }

    const gpaSummary = marksService.getStudentGpaSummary(studentMarks);

    // Fetch attendance records and compute attendance standing
    let attendanceRecords = [];
    try {
      attendanceRecords = attendanceService.getByStudentId(currentUser, studentId);
    } catch {
      attendanceRecords = [];
    }

    const attendanceStats = attendanceService.calculateStudentAttendance(attendanceRecords);
    const subjectAttendance = attendanceService.getSubjectWiseBreakdown(attendanceRecords);

    // Determine Academic Standing
    let standing = 'Evaluation In Progress';
    let standingClass = 'warning';
    if (gpaSummary.cgpa >= 9.0) {
      standing = 'First Class with Exemplary Distinction';
      standingClass = 'success';
    } else if (gpaSummary.cgpa >= 8.0) {
      standing = 'First Class with Distinction';
      standingClass = 'success';
    } else if (gpaSummary.cgpa >= 6.5) {
      standing = 'First Class';
      standingClass = 'info';
    } else if (gpaSummary.cgpa >= 5.0) {
      standing = 'Second Class';
      standingClass = 'primary';
    } else if (studentMarks.length > 0) {
      standing = 'Needs Academic Improvement';
      standingClass = 'danger';
    }

    // Completeness validation
    const hasMarks = studentMarks.length > 0;
    const hasAttendance = attendanceRecords.length > 0;
    const isComplete = hasMarks && hasAttendance;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const reportReference = `TRN-${today.getFullYear()}-${student.studentId.replace(/[^a-zA-Z0-9]/g, '')}`;

    return {
      referenceId: reportReference,
      issueDate: formattedDate,
      generatedTimestamp: today.toISOString(),
      generatedBy: currentUser.name || currentUser.username || 'System Administrator',
      institution: INSTITUTION_INFO,
      student: {
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        department: student.department,
        academicYear: student.academicYear,
        semester: student.semester,
        section: student.section,
        classId: student.classId || `${student.department}-Sem${student.semester}-Sec${student.section}`,
        dateOfBirth: student.dateOfBirth,
        admissionDate: student.admissionDate,
        guardianName: student.guardianName,
        guardianContact: student.guardianContact,
        address: student.address
      },
      academic: {
        semesters: gpaSummary.semesters,
        cgpa: gpaSummary.cgpa,
        totalCredits: gpaSummary.totalCredits,
        totalQualityPoints: gpaSummary.totalQualityPoints,
        totalCoursesEvaluated: studentMarks.length,
        coursesPassed: studentMarks.filter(m => m.grade !== 'F').length,
        coursesFailed: studentMarks.filter(m => m.grade === 'F').length,
        standing,
        standingClass
      },
      attendance: {
        totalSessions: attendanceStats.total,
        attendedSessions: attendanceStats.attended,
        absentSessions: attendanceStats.absent,
        lateSessions: attendanceStats.late,
        excusedSessions: attendanceStats.excused,
        percentage: attendanceStats.percentage,
        isShortage: attendanceStats.isShortage,
        threshold: attendanceStats.threshold,
        subjectBreakdown: subjectAttendance
      },
      status: {
        hasMarks,
        hasAttendance,
        isComplete,
        evaluationStatus: isComplete ? 'Complete' : !hasMarks && !hasAttendance ? 'No Records Available' : 'Partial / Pending Evaluation'
      }
    };
  },

  /**
   * Compiles summaries for all students authorized for the active user.
   */
  getAllStudentsReportSummaries: (currentUser) => {
    if (!currentUser) return [];

    const authorizedStudents = studentService.getAll(currentUser);
    const allMarks = storageService.getMarks();
    const allAttendance = storageService.getAttendance();

    return authorizedStudents.map(student => {
      const studentMarks = allMarks.filter(m => m.studentId === student.studentId);
      const studentAttendance = allAttendance.filter(a => a.studentId === student.studentId);

      const gpa = marksService.getStudentGpaSummary(studentMarks);
      const attStats = attendanceService.calculateStudentAttendance(studentAttendance);

      return {
        studentId: student.studentId,
        fullName: student.fullName,
        department: student.department,
        academicYear: student.academicYear,
        semester: student.semester,
        section: student.section,
        classId: student.classId || `${student.department}-Sem${student.semester}-Sec${student.section}`,
        cgpa: gpa.cgpa,
        completedSemesters: gpa.semesters.length,
        totalCredits: gpa.totalCredits,
        attendancePercentage: attStats.percentage,
        isAttendanceShortage: attStats.isShortage,
        hasMarks: studentMarks.length > 0,
        hasAttendance: studentAttendance.length > 0,
        status: studentMarks.length > 0 && studentAttendance.length > 0 ? 'Complete' : 'Pending'
      };
    });
  }
};

