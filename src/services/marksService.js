/**
 * Academic Marks & Performance Data Service
 * Enforces data-layer authorization, component boundary validations,
 * automatic grade calculations, SGPA, and multi-semester CGPA computation.
 */

import { storageService, STORAGE_KEYS, DEMO_MARKS, COURSE_CATALOG } from './storageService.js';
import { canAccessStudentRecord, canEnterSubjectMarks } from '../utils/rbacRules.js';
import {
  validateComponentMarks,
  calculateAssessmentResults,
  calculateSGPA,
  calculateCGPA,
  ASSESSMENT_STRUCTURES
} from '../utils/calculations.js';

export const marksService = {
  /**
   * Fetch marks records with role-based visibility filtering.
   * - Administrators: View all institutional marks.
   * - Faculty: View marks for assigned classes and assigned subjects.
   * - Students: View ONLY their personal marks records.
   */
  getAll: (currentUser) => {
    if (!currentUser) {
      throw new Error('Authentication required to access marks records.');
    }

    const allMarks = storageService.getMarks();

    if (currentUser.role === 'admin') {
      return allMarks;
    }

    if (currentUser.role === 'faculty') {
      const allStudents = storageService.getStudents();
      const assignedClasses = currentUser.assignedClasses || [];
      const assignedSubjects = currentUser.assignedSubjects || [];

      // Filter students assigned to faculty
      const assignedStudentIds = new Set(
        allStudents
          .filter(s => {
            const classId = s.classId || `${s.department}-Sem${s.semester}-Sec${s.section}`;
            return assignedClasses.includes(classId) || assignedClasses.includes(`${s.semester}-${s.section}`);
          })
          .map(s => s.studentId)
      );

      return allMarks.filter(mark =>
        assignedStudentIds.has(mark.studentId) && assignedSubjects.includes(mark.subjectId)
      );
    }

    if (currentUser.role === 'student') {
      return allMarks.filter(mark => mark.studentId === currentUser.studentId);
    }

    return [];
  },

  /**
   * Fetch marks records for a specific student ID with authorization checks.
   */
  getByStudentId: (currentUser, studentId) => {
    if (!currentUser) {
      throw new Error('Authentication required.');
    }

    const allStudents = storageService.getStudents();
    const isAllowed = canAccessStudentRecord(currentUser, studentId, allStudents);

    if (!isAllowed) {
      throw new Error(`Access Denied: You do not have permission to view marks for student ${studentId}.`);
    }

    const allMarks = storageService.getMarks();
    return allMarks.filter(m => m.studentId === studentId);
  },

  /**
   * Enter or update academic marks with rigorous boundary and RBAC validation.
   */
  saveMark: (currentUser, markData) => {
    if (!currentUser) {
      throw new Error('Authentication required to enter marks.');
    }

    // 1. Role-Level Authorization Guard
    if (currentUser.role === 'student') {
      throw new Error('Access Denied: Students are not authorized to enter or alter marks.');
    }

    // 2. Faculty Assignment Restrictions Guard
    if (currentUser.role === 'faculty') {
      // Must be assigned to teach this subject
      if (!canEnterSubjectMarks(currentUser, markData.subjectId)) {
        throw new Error(
          `Access Denied: You are not assigned to evaluate course "${markData.subjectId}". Assigned subjects: ${(currentUser.assignedSubjects || []).join(', ')}.`
        );
      }

      // Target student must be in faculty's assigned class roster
      const allStudents = storageService.getStudents();
      if (!canAccessStudentRecord(currentUser, markData.studentId, allStudents)) {
        throw new Error(
          `Access Denied: Student "${markData.studentId}" is not enrolled in your assigned classes.`
        );
      }
    }

    // 3. Resolve Course Metadata
    const course = COURSE_CATALOG.find(c => c.subjectId === markData.subjectId);
    if (!course) {
      throw new Error(`Course with ID "${markData.subjectId}" is not recognized in the university catalog.`);
    }

    const structureType = course.structureType || 'THEORY_LAB';

    // 4. Validate Component Boundaries (No negatives, cannot exceed max)
    const validation = validateComponentMarks(markData.components, structureType);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(`Assessment Boundary Violation: ${firstError}`);
    }

    // 5. Compute Automated Mathematical Results (Total, %, Grade, GP)
    const results = calculateAssessmentResults(markData.components, structureType);

    const allMarks = storageService.getMarks();

    // 6. Check for existing record (Prevent duplicate entries; update if exists)
    const existingIndex = allMarks.findIndex(
      m => m.studentId === markData.studentId && m.subjectId === markData.subjectId
    );

    const markRecord = {
      id: existingIndex !== -1 ? allMarks[existingIndex].id : `MRK-${markData.studentId}-${markData.subjectId}`,
      studentId: markData.studentId,
      subjectId: markData.subjectId,
      subjectName: course.subjectName,
      department: course.department,
      semester: Number(markData.semester || course.semester || 4),
      credits: Number(course.credits || 4),
      structureType,
      components: {
        internal: Number(markData.components.internal) || 0,
        external: Number(markData.components.external) || 0,
        assignment: Number(markData.components.assignment) || 0,
        lab: Number(markData.components.lab) || 0
      },
      totalMarks: results.totalMarks,
      maxMarks: results.maxMarks,
      percentage: results.percentage,
      grade: results.grade,
      gradePoint: results.gradePoint,
      gradeDescription: results.gradeDescription,
      isPassed: results.isPassed,
      facultyRemarks: markData.facultyRemarks ? markData.facultyRemarks.trim() : '',
      enteredBy: currentUser.facultyId || currentUser.username || 'admin',
      updatedAt: new Date().toISOString()
    };

    let updatedList;
    if (existingIndex !== -1) {
      updatedList = [...allMarks];
      updatedList[existingIndex] = markRecord;
    } else {
      updatedList = [markRecord, ...allMarks];
    }

    storageService.setItem(STORAGE_KEYS.MARKS, updatedList);
    return markRecord;
  },

  /**
   * Delete a marks record. Strictly Administrator only.
   */
  deleteMark: (currentUser, markId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only administrators can delete academic records.');
    }

    const allMarks = storageService.getMarks();
    const updated = allMarks.filter(m => m.id !== markId);
    storageService.setItem(STORAGE_KEYS.MARKS, updated);
    return { success: true, deletedId: markId };
  },

  /**
   * Computes complete GPA Summary (Semester SGPAs & Multi-Semester CGPA) for a student.
   */
  getStudentGpaSummary: (studentMarks = []) => {
    if (!Array.isArray(studentMarks) || studentMarks.length === 0) {
      return {
        semesters: [],
        cgpa: 0.0,
        totalCredits: 0,
        totalQualityPoints: 0
      };
    }

    // Group marks by semester
    const semesterMap = {};
    for (const mark of studentMarks) {
      const sem = mark.semester || 1;
      if (!semesterMap[sem]) {
        semesterMap[sem] = [];
      }
      semesterMap[sem].push(mark);
    }

    const semesters = Object.keys(semesterMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map(sem => {
        const marksInSem = semesterMap[sem];
        const sgpa = calculateSGPA(marksInSem);
        const credits = marksInSem.reduce((acc, m) => acc + (Number(m.credits) || 0), 0);
        const qualityPoints = marksInSem.reduce((acc, m) => acc + ((Number(m.credits) || 0) * (Number(m.gradePoint) || 0)), 0);

        return {
          semester: sem,
          sgpa,
          credits,
          qualityPoints,
          marks: marksInSem
        };
      });

    const cgpa = calculateCGPA(studentMarks);
    const totalCredits = studentMarks.reduce((acc, m) => acc + (Number(m.credits) || 0), 0);
    const totalQualityPoints = studentMarks.reduce((acc, m) => acc + ((Number(m.credits) || 0) * (Number(m.gradePoint) || 0)), 0);

    return {
      semesters,
      cgpa,
      totalCredits,
      totalQualityPoints
    };
  },

  /**
   * Get courses that the current user is authorized to evaluate.
   */
  getAvailableCoursesForUser: (currentUser) => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return COURSE_CATALOG;
    }
    if (currentUser.role === 'faculty') {
      const assigned = currentUser.assignedSubjects || [];
      return COURSE_CATALOG.filter(c => assigned.includes(c.subjectId));
    }
    return [];
  },

  /**
   * Calculate marks statistics for administrative or faculty performance views.
   */
  getStats: (currentUser) => {
    const marks = marksService.getAll(currentUser);
    if (!marks || marks.length === 0) {
      return {
        totalEntries: 0,
        averagePercentage: 0,
        passRate: 0,
        passedCount: 0,
        failedCount: 0,
        outstandingCount: 0
      };
    }

    const totalEntries = marks.length;
    const totalPercentage = marks.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
    const averagePercentage = Math.round((totalPercentage / totalEntries) * 10) / 10;
    const passedCount = marks.filter(m => m.isPassed !== false && m.grade !== 'F').length;
    const failedCount = totalEntries - passedCount;
    const passRate = Math.round(((passedCount / totalEntries) * 100) * 10) / 10;
    const outstandingCount = marks.filter(m => m.grade === 'O').length;

    return {
      totalEntries,
      averagePercentage,
      passRate,
      passedCount,
      failedCount,
      outstandingCount
    };
  }
};

