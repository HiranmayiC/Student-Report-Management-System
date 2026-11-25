import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { canAccessStudentRecord } from '../../utils/rbacRules';

/**
 * ProtectedRoute Component
 * Enforces authentication and role-based access control.
 * Also enforces record-level isolation for both Students and Faculty.
 */
const ProtectedRoute = ({ allowedRoles = [], checkStudentParam = false, children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const params = useParams();

  // 1. Authentication Guard: Must be signed in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Guard: Must match allowed roles if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // 3. Record-Level Isolation Guard for /students/:id
  if (checkStudentParam && params.id) {
    const requestedStudentId = params.id;
    const allStudents = storageService.getStudents();
    const hasPermission = canAccessStudentRecord(user, requestedStudentId, allStudents);

    if (!hasPermission) {
      let customReason = 'Access Denied: You do not have permission to view this student record.';
      if (user.role === 'student') {
        customReason = `Access Restricted: You are signed in as ${user.name} (${user.studentId}) and can only access your own academic records.`;
      } else if (user.role === 'faculty') {
        customReason = `Access Restricted: Student record ${requestedStudentId} does not belong to your assigned classes/sections (${(user.assignedClasses || []).join(', ')}).`;
      }

      return (
        <Navigate
          to="/unauthorized"
          state={{ reason: customReason }}
          replace
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;
