/**
 * Role-Based Access Control (RBAC) & Permission Policy Rules
 *
 * Implements strict authorization logic:
 * 1. Administrators retain unrestricted institutional access.
 * 2. Students can ONLY access their own records.
 * 3. Faculty can ONLY access students in their assigned classes/sections,
 *    enter marks for their assigned subjects, and take attendance for their
 *    assigned classes and subjects.
 */

/**
 * Checks whether a user has permission to view or manage a specific student record.
 * @param {Object} user - The active session user object from AuthContext
 * @param {string|Object} targetStudent - Either the student ID string or the student entity object
 * @param {Array} [studentList] - Optional array of all student records for lookups
 * @returns {boolean}
 */
export const canAccessStudentRecord = (user, targetStudent, studentList = []) => {
  if (!user) return false;

  // 1. Administrators have full institutional access
  if (user.role === 'admin') {
    return true;
  }

  const studentId = typeof targetStudent === 'string'
    ? targetStudent
    : targetStudent?.studentId;

  // 2. Students can strictly access only their own record
  if (user.role === 'student') {
    return !!user.studentId && user.studentId === studentId;
  }

  // 3. Faculty members can access only students in their assigned classes/sections
  if (user.role === 'faculty') {
    let studentObj = typeof targetStudent === 'object' ? targetStudent : null;

    if (!studentObj && Array.isArray(studentList)) {
      studentObj = studentList.find(s => s.studentId === studentId);
    }

    if (!studentObj) {
      // If student object not found, deny access by default (safe-fail)
      return false;
    }

    const assignedClasses = user.assignedClasses || [];
    const studentClassId = studentObj.classId || `${studentObj.department}-Sem${studentObj.semester}-Sec${studentObj.section}`;

    // Direct match against class identifier
    if (assignedClasses.includes(studentClassId)) {
      return true;
    }

    // Match against shorthand (e.g., "CS-Sem4-SecA" or "4-A")
    const shortClassId = `${studentObj.semester}-${studentObj.section}`;
    if (assignedClasses.includes(shortClassId)) {
      return true;
    }

    return false;
  }

  return false;
};

/**
 * Checks whether a user has permission to enter or edit marks for a given subject.
 * @param {Object} user - Active session user
 * @param {string} subjectId - Course/Subject identifier (e.g. "CS401")
 * @returns {boolean}
 */
export const canEnterSubjectMarks = (user, subjectId) => {
  if (!user) return false;

  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'faculty') {
    const assignedSubjects = user.assignedSubjects || [];
    return assignedSubjects.includes(subjectId);
  }

  // Students can NEVER enter marks
  return false;
};

/**
 * Checks whether a user has permission to record attendance for a given class and subject.
 * @param {Object} user - Active session user
 * @param {string} classId - Class/Section identifier (e.g. "CS-Sem4-SecA")
 * @param {string} subjectId - Course/Subject identifier (e.g. "CS401")
 * @returns {boolean}
 */
export const canRecordAttendance = (user, classId, subjectId) => {
  if (!user) return false;

  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'faculty') {
    const assignedClasses = user.assignedClasses || [];
    const assignedSubjects = user.assignedSubjects || [];

    const isClassAssigned = assignedClasses.includes(classId);
    const isSubjectAssigned = assignedSubjects.includes(subjectId);

    return isClassAssigned && isSubjectAssigned;
  }

  // Students can NEVER record attendance
  return false;
};

