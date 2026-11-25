/**
 * Attendance Management Data Service
 * Enforces role-based permissions, duplicate prevention, automated percentage calculation,
 * shortage threshold detection, and LocalStorage persistence.
 */

import {
  storageService,
  STORAGE_KEYS,
  COURSE_CATALOG,
  AVAILABLE_CLASSES
} from './storageService.js';
import { canRecordAttendance, canAccessStudentRecord } from '../utils/rbacRules.js';

export const ATTENDANCE_STATUSES = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  EXCUSED: 'Excused'
};

export const DEFAULT_SHORTAGE_THRESHOLD = 75.0; // Standard 75% regulatory requirement

export const attendanceService = {
  /**
   * Fetch attendance records filtered by user role:
   * - Administrator: Institutional oversight across all classes & subjects.
   * - Faculty: Restricted strictly to assigned classes and assigned subjects.
   * - Student: Restricted strictly to personal attendance records.
   */
  getAll: (currentUser) => {
    if (!currentUser) {
      throw new Error('Authentication required to access attendance records.');
    }

    const allAttendance = storageService.getAttendance();

    if (currentUser.role === 'admin') {
      return allAttendance;
    }

    if (currentUser.role === 'faculty') {
      const assignedClasses = currentUser.assignedClasses || [];
      const assignedSubjects = currentUser.assignedSubjects || [];

      return allAttendance.filter(record =>
        assignedClasses.includes(record.classId) && assignedSubjects.includes(record.subjectId)
      );
    }

    if (currentUser.role === 'student') {
      return allAttendance.filter(record => record.studentId === currentUser.studentId);
    }

    return [];
  },

  /**
   * Fetch attendance records for a specific student ID with authorization checks.
   */
  getByStudentId: (currentUser, studentId) => {
    if (!currentUser) {
      throw new Error('Authentication required.');
    }

    const allStudents = storageService.getStudents();
    const isAllowed = canAccessStudentRecord(currentUser, studentId, allStudents);

    if (!isAllowed) {
      throw new Error(`Access Denied: You do not have permission to view attendance for student "${studentId}".`);
    }

    const allAttendance = storageService.getAttendance();
    return allAttendance.filter(r => r.studentId === studentId);
  },

  /**
   * Fetch attendance records for a specific class, subject, and optional date.
   */
  getByClassAndSubject: (currentUser, classId, subjectId, date = null) => {
    if (!currentUser) {
      throw new Error('Authentication required.');
    }

    // Role check: Faculty must be assigned to this class and subject
    if (currentUser.role === 'faculty') {
      if (!canRecordAttendance(currentUser, classId, subjectId)) {
        throw new Error(`Access Denied: You are not assigned to class "${classId}" for course "${subjectId}".`);
      }
    } else if (currentUser.role === 'student') {
      throw new Error('Access Denied: Students are not authorized to view class-level attendance rosters.');
    }

    const allAttendance = storageService.getAttendance();
    return allAttendance.filter(r => {
      const matchClass = r.classId === classId;
      const matchSubject = r.subjectId === subjectId;
      const matchDate = date ? r.date === date : true;
      return matchClass && matchSubject && matchDate;
    });
  },

  /**
   * Record or update class session attendance for an entire roster.
   * Enforces duplicate prevention: updates in place if record for (date + classId + subjectId + studentId) exists.
   */
  recordClassAttendance: (currentUser, { date, classId, subjectId, records = [] }) => {
    if (!currentUser) {
      throw new Error('Authentication required to record attendance.');
    }

    // Role guard: Students can NEVER record attendance
    if (currentUser.role === 'student') {
      throw new Error('Access Denied: Students are not authorized to record or alter attendance.');
    }

    // Faculty assignment guard: Must be assigned to both class and subject
    if (currentUser.role === 'faculty') {
      if (!canRecordAttendance(currentUser, classId, subjectId)) {
        throw new Error(
          `Access Denied: You are not authorized to record attendance for class "${classId}" in course "${subjectId}".`
        );
      }
    }

    // Input validations
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('A valid date in YYYY-MM-DD format is required.');
    }
    if (!classId) {
      throw new Error('Class identifier is required.');
    }
    if (!subjectId) {
      throw new Error('Subject identifier is required.');
    }
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('Attendance records list cannot be empty.');
    }

    const course = COURSE_CATALOG.find(c => c.subjectId === subjectId);
    const subjectName = course ? course.subjectName : subjectId;
    const allStudents = storageService.getStudents();
    const currentAttendance = storageService.getAttendance();

    const timestamp = new Date().toISOString();
    const recordedBy = currentUser.facultyId || currentUser.username || 'admin';

    // Copy array for immutability
    const updatedAttendance = [...currentAttendance];
    const savedRecords = [];

    for (const item of records) {
      const student = allStudents.find(s => s.studentId === item.studentId);
      const studentName = student ? student.fullName : (item.studentName || item.studentId);

      // Check if attendance for this student on this date, class, and subject already exists
      const existingIndex = updatedAttendance.findIndex(
        r => r.date === date &&
             r.classId === classId &&
             r.subjectId === subjectId &&
             r.studentId === item.studentId
      );

      const status = Object.values(ATTENDANCE_STATUSES).includes(item.status)
        ? item.status
        : ATTENDANCE_STATUSES.PRESENT;

      const recordPayload = {
        id: existingIndex !== -1
          ? updatedAttendance[existingIndex].id
          : `ATT-${date.replace(/-/g, '')}-${subjectId}-${item.studentId}`,
        date,
        classId,
        subjectId,
        subjectName,
        studentId: item.studentId,
        studentName,
        status,
        remarks: item.remarks ? item.remarks.trim() : '',
        recordedBy,
        recordedAt: existingIndex !== -1 ? updatedAttendance[existingIndex].recordedAt : timestamp,
        updatedAt: timestamp
      };

      if (existingIndex !== -1) {
        // Update previously recorded attendance in place (duplicate prevention & correction)
        updatedAttendance[existingIndex] = recordPayload;
      } else {
        // Append new attendance record
        updatedAttendance.unshift(recordPayload);
      }

      savedRecords.push(recordPayload);
    }

    storageService.setItem(STORAGE_KEYS.ATTENDANCE, updatedAttendance);
    return savedRecords;
  },

  /**
   * Update a single attendance record (e.g., status correction).
   */
  updateSingleRecord: (currentUser, recordId, { status, remarks }) => {
    if (!currentUser) {
      throw new Error('Authentication required.');
    }

    if (currentUser.role === 'student') {
      throw new Error('Access Denied: Students cannot alter attendance records.');
    }

    const allAttendance = storageService.getAttendance();
    const existingIndex = allAttendance.findIndex(r => r.id === recordId);
    if (existingIndex === -1) {
      throw new Error(`Attendance record with ID "${recordId}" was not found.`);
    }

    const existing = allAttendance[existingIndex];

    // Faculty check
    if (currentUser.role === 'faculty') {
      if (!canRecordAttendance(currentUser, existing.classId, existing.subjectId)) {
        throw new Error('Access Denied: You are not authorized to update this class attendance.');
      }
    }

    const updated = {
      ...existing,
      status: status || existing.status,
      remarks: remarks !== undefined ? remarks.trim() : existing.remarks,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.facultyId || currentUser.username
    };

    allAttendance[existingIndex] = updated;
    storageService.setItem(STORAGE_KEYS.ATTENDANCE, allAttendance);
    return updated;
  },

  /**
   * Delete an attendance record. Strictly Administrator only.
   */
  deleteRecord: (currentUser, recordId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only administrators can delete attendance records.');
    }

    const allAttendance = storageService.getAttendance();
    const updated = allAttendance.filter(r => r.id !== recordId);
    storageService.setItem(STORAGE_KEYS.ATTENDANCE, updated);
    return { success: true, deletedId: recordId };
  },

  /**
   * Calculate summary metrics and shortage detection for a set of student attendance records.
   * Attended = Present + Late + Excused
   * Total = Present + Absent + Late + Excused
   */
  calculateStudentAttendance: (records = [], threshold = DEFAULT_SHORTAGE_THRESHOLD) => {
    if (!Array.isArray(records) || records.length === 0) {
      return {
        total: 0,
        attended: 0,
        absent: 0,
        late: 0,
        excused: 0,
        percentage: 0.0,
        isShortage: false,
        threshold
      };
    }

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    for (const r of records) {
      switch (r.status) {
        case ATTENDANCE_STATUSES.PRESENT:
          present++;
          break;
        case ATTENDANCE_STATUSES.ABSENT:
          absent++;
          break;
        case ATTENDANCE_STATUSES.LATE:
          late++;
          break;
        case ATTENDANCE_STATUSES.EXCUSED:
          excused++;
          break;
        default:
          present++;
      }
    }

    const total = records.length;
    // Late and Excused count as attended sessions in standard institutional grading
    const attended = present + late + excused;
    const percentage = total > 0 ? Math.round(((attended / total) * 100) * 10) / 10 : 0.0;
    const isShortage = total > 0 && percentage < threshold;

    return {
      total,
      attended,
      present,
      absent,
      late,
      excused,
      percentage,
      isShortage,
      threshold
    };
  },

  /**
   * Calculate subject-wise attendance breakdown for a student.
   */
  getSubjectWiseBreakdown: (records = [], threshold = DEFAULT_SHORTAGE_THRESHOLD) => {
    if (!Array.isArray(records) || records.length === 0) {
      return [];
    }

    const subjectMap = {};
    for (const r of records) {
      const subId = r.subjectId;
      if (!subjectMap[subId]) {
        subjectMap[subId] = {
          subjectId: subId,
          subjectName: r.subjectName || subId,
          records: []
        };
      }
      subjectMap[subId].records.push(r);
    }

    return Object.values(subjectMap).map(item => {
      const stats = attendanceService.calculateStudentAttendance(item.records, threshold);
      return {
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        totalSessions: stats.total,
        attendedSessions: stats.attended,
        absentSessions: stats.absent,
        lateSessions: stats.late,
        excusedSessions: stats.excused,
        percentage: stats.percentage,
        isShortage: stats.isShortage
      };
    });
  },

  /**
   * Get class-wise summary statistics for faculty and administrators.
   */
  getOverallStats: (currentUser, threshold = DEFAULT_SHORTAGE_THRESHOLD) => {
    const records = attendanceService.getAll(currentUser);
    const allStudents = storageService.getStudents();

    if (!records || records.length === 0) {
      return {
        totalRecords: 0,
        totalSessions: 0,
        averagePercentage: 0.0,
        shortageCount: 0,
        presentRate: 0.0
      };
    }

    // Unique session dates + classId + subjectId combinations
    const sessionsSet = new Set(records.map(r => `${r.date}|${r.classId}|${r.subjectId}`));

    // Group records by student to determine student-level shortages
    const studentRecordsMap = {};
    for (const r of records) {
      if (!studentRecordsMap[r.studentId]) {
        studentRecordsMap[r.studentId] = [];
      }
      studentRecordsMap[r.studentId].push(r);
    }

    let shortageCount = 0;
    let totalStudentPercentages = 0;
    const evaluatedStudentIds = Object.keys(studentRecordsMap);

    for (const studentId of evaluatedStudentIds) {
      const studentMetrics = attendanceService.calculateStudentAttendance(studentRecordsMap[studentId], threshold);
      totalStudentPercentages += studentMetrics.percentage;
      if (studentMetrics.isShortage) {
        shortageCount++;
      }
    }

    const averagePercentage = evaluatedStudentIds.length > 0
      ? Math.round((totalStudentPercentages / evaluatedStudentIds.length) * 10) / 10
      : 0.0;

    const totalAttended = records.filter(r => r.status !== ATTENDANCE_STATUSES.ABSENT).length;
    const presentRate = records.length > 0
      ? Math.round(((totalAttended / records.length) * 100) * 10) / 10
      : 0.0;

    return {
      totalRecords: records.length,
      totalSessions: sessionsSet.size,
      averagePercentage,
      shortageCount,
      presentRate
    };
  },

  /**
   * Get classes authorized for the active user.
   */
  getAvailableClassesForUser: (currentUser) => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return AVAILABLE_CLASSES;
    }
    if (currentUser.role === 'faculty') {
      return currentUser.assignedClasses || [];
    }
    return [];
  },

  /**
   * Get courses authorized for the active user.
   */
  getAvailableSubjectsForUser: (currentUser) => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return COURSE_CATALOG;
    }
    if (currentUser.role === 'faculty') {
      const assigned = currentUser.assignedSubjects || [];
      return COURSE_CATALOG.filter(c => assigned.includes(c.subjectId));
    }
    return [];
  }
};

