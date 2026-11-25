/**
 * Faculty Management Data Service
 * Encapsulates all CRUD operations for faculty with data-layer authorization enforcement
 * and dynamic synchronization with the RBAC policy engine.
 */

import { storageService, STORAGE_KEYS, DEMO_FACULTY, COURSE_CATALOG, AVAILABLE_CLASSES } from './storageService.js';

export const facultyService = {
  /**
   * Fetch faculty with role-based visibility filtering.
   * - Administrators: View all faculty members.
   * - Faculty: View ONLY their own faculty record.
   * - Students: Access Denied.
   */
  getAll: (currentUser) => {
    if (!currentUser) {
      throw new Error('Authentication required to access faculty directory.');
    }

    if (currentUser.role === 'student') {
      throw new Error('Access Denied: Students do not have permission to browse faculty directory.');
    }

    const allFaculty = storageService.getFaculty();

    if (currentUser.role === 'admin') {
      return allFaculty;
    }

    if (currentUser.role === 'faculty') {
      return allFaculty.filter(f => f.facultyId === currentUser.facultyId);
    }

    return [];
  },

  /**
   * Fetch a single faculty record by ID with authorization checks.
   */
  getById: (currentUser, facultyId) => {
    if (!currentUser) {
      throw new Error('Authentication required to view faculty profile.');
    }

    if (currentUser.role === 'student') {
      throw new Error('Access Denied: Students do not have permission to view faculty profiles.');
    }

    if (currentUser.role === 'faculty' && currentUser.facultyId !== facultyId) {
      throw new Error('Access Denied: Faculty members can only view their own faculty profile.');
    }

    const allFaculty = storageService.getFaculty();
    const faculty = allFaculty.find(f => f.facultyId === facultyId);

    return faculty || null;
  },

  /**
   * Create a new faculty member.
   * STRICT: Only Administrators are authorized to add faculty.
   */
  create: (currentUser, facultyData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only administrators have permission to create faculty records.');
    }

    const allFaculty = storageService.getFaculty();

    const trimmedId = (facultyData.facultyId || '').trim();
    const trimmedName = (facultyData.fullName || '').trim();
    const trimmedEmail = (facultyData.email || '').trim();

    if (!trimmedId) throw new Error('Faculty ID is required.');
    if (!trimmedName) throw new Error('Full Name is required.');
    if (!trimmedEmail) throw new Error('Email address is required.');
    if (!facultyData.department) throw new Error('Department is required.');
    if (!facultyData.designation) throw new Error('Designation is required.');

    // Duplicate Faculty ID check
    const duplicate = allFaculty.find(f => f.facultyId.toLowerCase() === trimmedId.toLowerCase());
    if (duplicate) {
      throw new Error(`Faculty ID "${trimmedId}" already exists. Faculty IDs must be strictly unique.`);
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Invalid email format. Please provide a valid institutional email address.');
    }

    const newFaculty = {
      ...facultyData,
      facultyId: trimmedId,
      fullName: trimmedName,
      email: trimmedEmail,
      assignedSubjects: Array.isArray(facultyData.assignedSubjects) ? facultyData.assignedSubjects : [],
      assignedClasses: Array.isArray(facultyData.assignedClasses) ? facultyData.assignedClasses : [],
      joiningDate: facultyData.joiningDate || new Date().toISOString().split('T')[0],
      avatar: facultyData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedId)}`,
      createdAt: new Date().toISOString()
    };

    const updatedList = [newFaculty, ...allFaculty];
    storageService.setItem(STORAGE_KEYS.FACULTY, updatedList);

    return newFaculty;
  },

  /**
   * Update an existing faculty member's profile and assignments.
   * STRICT: Only Administrators can update faculty records.
   * Synchronizes changes directly with active session and user records for live RBAC updates.
   */
  update: (currentUser, facultyId, updateData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only administrators have permission to update faculty records.');
    }

    const allFaculty = storageService.getFaculty();
    const index = allFaculty.findIndex(f => f.facultyId === facultyId);

    if (index === -1) {
      throw new Error(`Faculty with ID "${facultyId}" not found.`);
    }

    const existingFaculty = allFaculty[index];

    const updatedFaculty = {
      ...existingFaculty,
      ...updateData,
      facultyId: existingFaculty.facultyId, // Immutable ID
      assignedSubjects: Array.isArray(updateData.assignedSubjects)
        ? updateData.assignedSubjects
        : existingFaculty.assignedSubjects,
      assignedClasses: Array.isArray(updateData.assignedClasses)
        ? updateData.assignedClasses
        : existingFaculty.assignedClasses,
      updatedAt: new Date().toISOString()
    };

    const updatedList = [...allFaculty];
    updatedList[index] = updatedFaculty;
    storageService.setItem(STORAGE_KEYS.FACULTY, updatedList);

    // Dynamic RBAC Synchronization:
    // If the updated faculty is registered in srms_users or active in srms_auth_user,
    // synchronize their assignedClasses and assignedSubjects immediately.
    const allUsers = storageService.getItem(STORAGE_KEYS.USERS, []);
    const userIndex = allUsers.findIndex(u => u.facultyId === facultyId);
    if (userIndex !== -1) {
      allUsers[userIndex] = {
        ...allUsers[userIndex],
        assignedSubjects: updatedFaculty.assignedSubjects,
        assignedClasses: updatedFaculty.assignedClasses,
        department: updatedFaculty.department
      };
      storageService.setItem(STORAGE_KEYS.USERS, allUsers);
    }

    const currentAuth = storageService.getItem(STORAGE_KEYS.AUTH_USER);
    if (currentAuth && currentAuth.facultyId === facultyId) {
      const updatedAuth = {
        ...currentAuth,
        assignedSubjects: updatedFaculty.assignedSubjects,
        assignedClasses: updatedFaculty.assignedClasses,
        department: updatedFaculty.department
      };
      storageService.setItem(STORAGE_KEYS.AUTH_USER, updatedAuth);
    }

    return updatedFaculty;
  },

  /**
   * Delete a faculty member.
   * STRICT: Only Administrators can delete faculty.
   */
  delete: (currentUser, facultyId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only administrators have permission to delete faculty records.');
    }

    const allFaculty = storageService.getFaculty();
    const exists = allFaculty.some(f => f.facultyId === facultyId);

    if (!exists) {
      throw new Error(`Cannot delete: Faculty member with ID "${facultyId}" not found.`);
    }

    const updatedList = allFaculty.filter(f => f.facultyId !== facultyId);
    storageService.setItem(STORAGE_KEYS.FACULTY, updatedList);

    return { success: true, deletedId: facultyId };
  },

  /**
   * Helpers for dropdown catalogs
   */
  getAvailableCourses: () => COURSE_CATALOG,
  getAvailableClasses: () => AVAILABLE_CLASSES
};

