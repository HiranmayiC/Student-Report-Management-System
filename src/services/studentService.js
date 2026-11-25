/**
 * Student Management Data Service
 * Encapsulates all CRUD operations for students with service-level authorization enforcement.
 */

import { storageService, STORAGE_KEYS, DEMO_STUDENTS } from './storageService.js';
import { canAccessStudentRecord } from '../utils/rbacRules.js';

export const studentService = {
  /**
   * Fetch students with role-based visibility filtering.
   * - Administrators: View all students.
   * - Faculty: View ONLY students enrolled in their assigned classes.
   * - Students: View ONLY their own record.
   */
  getAll: (currentUser) => {
    if (!currentUser) {
      throw new Error('Authentication required to access student records.');
    }

    const allStudents = storageService.getStudents();

    if (currentUser.role === 'admin') {
      return allStudents;
    }

    if (currentUser.role === 'faculty') {
      const assignedClasses = currentUser.assignedClasses || [];
      return allStudents.filter(student => {
        const studentClassId = student.classId || `${student.department}-Sem${student.semester}-Sec${student.section}`;
        const shortClassId = `${student.semester}-${student.section}`;
        return assignedClasses.includes(studentClassId) || assignedClasses.includes(shortClassId);
      });
    }

    if (currentUser.role === 'student') {
      return allStudents.filter(s => s.studentId === currentUser.studentId);
    }

    return [];
  },

  /**
   * Fetch a single student record with authorization checks.
   */
  getById: (currentUser, studentId) => {
    if (!currentUser) {
      throw new Error('Authentication required to view student record.');
    }

    const allStudents = storageService.getStudents();
    const student = allStudents.find(s => s.studentId === studentId);

    if (!student) {
      return null;
    }

    // Service-level authorization enforcement
    const isAllowed = canAccessStudentRecord(currentUser, student, allStudents);
    if (!isAllowed) {
      throw new Error(
        `Access Denied: User role "${currentUser.role}" does not have permission to access record ${studentId}.`
      );
    }

    return student;
  },

  /**
   * Create a new student record.
   * STRICT: Only Administrators are authorized to create students.
   */
  create: (currentUser, studentData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only administrators have permission to create student records.');
    }

    const allStudents = storageService.getStudents();

    // 1. Validate Required Fields
    const trimmedId = (studentData.studentId || '').trim();
    const trimmedName = (studentData.fullName || '').trim();
    const trimmedEmail = (studentData.email || '').trim();

    if (!trimmedId) throw new Error('Student ID is required.');
    if (!trimmedName) throw new Error('Full Name is required.');
    if (!trimmedEmail) throw new Error('Email address is required.');
    if (!studentData.department) throw new Error('Department is required.');
    if (!studentData.semester) throw new Error('Semester is required.');
    if (!studentData.section) throw new Error('Section is required.');

    // 2. Uniqueness Validation: Prevent duplicate Student IDs
    const duplicate = allStudents.find(s => s.studentId.toLowerCase() === trimmedId.toLowerCase());
    if (duplicate) {
      throw new Error(`Student ID "${trimmedId}" already exists. Student IDs must be strictly unique.`);
    }

    // 3. Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Invalid email format. Please provide a valid academic or personal email.');
    }

    // 4. Compute composite classId
    const deptPrefix = studentData.department.toLowerCase().includes('computer') ? 'CS'
      : studentData.department.toLowerCase().includes('information') ? 'IT'
      : studentData.department.toLowerCase().includes('electronic') ? 'EC'
      : studentData.department.toLowerCase().includes('mech') ? 'ME' : 'ENG';

    const classId = studentData.classId || `${deptPrefix}-Sem${studentData.semester}-Sec${studentData.section}`;

    const newStudent = {
      ...studentData,
      studentId: trimmedId,
      fullName: trimmedName,
      email: trimmedEmail,
      semester: Number(studentData.semester),
      section: studentData.section.toUpperCase(),
      classId,
      avatar: studentData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedId)}`,
      createdAt: new Date().toISOString()
    };

    const updatedStudents = [newStudent, ...allStudents];
    storageService.setItem(STORAGE_KEYS.STUDENTS, updatedStudents);

    return newStudent;
  },

  /**
   * Update an existing student record.
   * STRICT: Only Administrators are authorized to update student records.
   */
  update: (currentUser, studentId, updateData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only administrators have permission to update student records.');
    }

    const allStudents = storageService.getStudents();
    const index = allStudents.findIndex(s => s.studentId === studentId);

    if (index === -1) {
      throw new Error(`Student with ID "${studentId}" not found.`);
    }

    const existingStudent = allStudents[index];

    // Compute updated classId if semester, department, or section changed
    const dept = updateData.department || existingStudent.department;
    const sem = updateData.semester || existingStudent.semester;
    const sec = (updateData.section || existingStudent.section).toUpperCase();

    const deptPrefix = dept.toLowerCase().includes('computer') ? 'CS'
      : dept.toLowerCase().includes('information') ? 'IT'
      : dept.toLowerCase().includes('electronic') ? 'EC'
      : dept.toLowerCase().includes('mech') ? 'ME' : 'ENG';

    const classId = `${deptPrefix}-Sem${sem}-Sec${sec}`;

    const updatedStudent = {
      ...existingStudent,
      ...updateData,
      studentId: existingStudent.studentId, // Student ID is immutable to preserve foreign key links
      semester: Number(sem),
      section: sec,
      classId,
      updatedAt: new Date().toISOString()
    };

    const updatedList = [...allStudents];
    updatedList[index] = updatedStudent;
    storageService.setItem(STORAGE_KEYS.STUDENTS, updatedList);

    return updatedStudent;
  },

  /**
   * Delete a student record.
   * STRICT: Only Administrators are authorized to delete student records.
   */
  delete: (currentUser, studentId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only administrators have permission to delete student records.');
    }

    const allStudents = storageService.getStudents();
    const exists = allStudents.some(s => s.studentId === studentId);

    if (!exists) {
      throw new Error(`Cannot delete: Student with ID "${studentId}" not found.`);
    }

    const updatedList = allStudents.filter(s => s.studentId !== studentId);
    storageService.setItem(STORAGE_KEYS.STUDENTS, updatedList);

    return { success: true, deletedId: studentId };
  }
};
