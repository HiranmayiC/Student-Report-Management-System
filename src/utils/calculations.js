/**
 * Academic Computation & Grading Engine
 *
 * Implements:
 * 1. Assessment component maximum bounds validation.
 * 2. Automated total and percentage calculations.
 * 3. Configured demonstration grading scale mapping.
 * 4. Credit-weighted Semester Grade Point Average (SGPA).
 * 5. Cumulative Grade Point Average (CGPA) across all completed semesters.
 */

// Course Assessment Structure Definitions
export const ASSESSMENT_STRUCTURES = {
  THEORY_LAB: {
    type: 'theory_lab',
    label: 'Theory with Laboratory Course',
    defaultCredits: 4,
    components: {
      internal: { label: 'Internal Assessment', max: 25 },
      external: { label: 'External Examination', max: 50 },
      assignment: { label: 'Assignment / Seminar', max: 10 },
      lab: { label: 'Laboratory / Practical', max: 15 }
    },
    totalMax: 100
  },
  THEORY_ONLY: {
    type: 'theory_only',
    label: 'Theory Only Course',
    defaultCredits: 3,
    components: {
      internal: { label: 'Internal Assessment', max: 30 },
      external: { label: 'External Examination', max: 60 },
      assignment: { label: 'Assignment / Seminar', max: 10 },
      lab: { label: 'Laboratory', max: 0 }
    },
    totalMax: 100
  },
  LAB_ONLY: {
    type: 'lab_only',
    label: 'Practical / Laboratory Only Course',
    defaultCredits: 2,
    components: {
      internal: { label: 'Continuous Practical Evaluation', max: 40 },
      external: { label: 'End-Semester Practical Exam', max: 40 },
      assignment: { label: 'Lab Record & Viva-Voce', max: 20 },
      lab: { label: 'Laboratory', max: 0 }
    },
    totalMax: 100
  }
};

// University Demonstration Grading Scale (Consistent and Configurable)
export const GRADING_SCALE = [
  { grade: 'O',  gradePoint: 10, minPercentage: 90.0, maxPercentage: 100.0, description: 'Outstanding', passed: true },
  { grade: 'A+', gradePoint: 9,  minPercentage: 80.0, maxPercentage: 89.99, description: 'Excellent',   passed: true },
  { grade: 'A',  gradePoint: 8,  minPercentage: 70.0, maxPercentage: 79.99, description: 'Very Good',   passed: true },
  { grade: 'B+', gradePoint: 7,  minPercentage: 60.0, maxPercentage: 69.99, description: 'Good',        passed: true },
  { grade: 'B',  gradePoint: 6,  minPercentage: 50.0, maxPercentage: 59.99, description: 'Above Average', passed: true },
  { grade: 'C',  gradePoint: 5,  minPercentage: 40.0, maxPercentage: 49.99, description: 'Pass',         passed: true },
  { grade: 'F',  gradePoint: 0,  minPercentage: 0.0,  maxPercentage: 39.99, description: 'Fail',         passed: false }
];

/**
 * Validates individual mark component values against their structure boundaries.
 */
export const validateComponentMarks = (components = {}, structureType = 'THEORY_LAB') => {
  const structure = ASSESSMENT_STRUCTURES[structureType] || ASSESSMENT_STRUCTURES.THEORY_LAB;
  const errors = {};

  const check = (key, val, max) => {
    if (val === undefined || val === null || val === '') {
      errors[key] = `${structure.components[key].label} is required`;
      return;
    }
    const num = Number(val);
    if (Number.isNaN(num)) {
      errors[key] = 'Must be a valid number';
      return;
    }
    if (num < 0) {
      errors[key] = 'Marks cannot be negative';
      return;
    }
    if (num > max) {
      errors[key] = `Cannot exceed maximum of ${max} marks`;
      return;
    }
  };

  check('internal', components.internal, structure.components.internal.max);
  check('external', components.external, structure.components.external.max);
  check('assignment', components.assignment, structure.components.assignment.max);
  if (structure.components.lab.max > 0) {
    check('lab', components.lab, structure.components.lab.max);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Computes Total Marks, Percentage, Letter Grade, and Grade Points.
 */
export const calculateAssessmentResults = (components = {}, structureType = 'THEORY_LAB') => {
  const structure = ASSESSMENT_STRUCTURES[structureType] || ASSESSMENT_STRUCTURES.THEORY_LAB;

  const internal = Number(components.internal) || 0;
  const external = Number(components.external) || 0;
  const assignment = Number(components.assignment) || 0;
  const lab = structure.components.lab.max > 0 ? (Number(components.lab) || 0) : 0;

  const totalMarks = Math.round((internal + external + assignment + lab) * 100) / 100;
  const maxMarks = structure.totalMax; // Strictly 100

  // Percentage calculation
  const percentage = Math.round(((totalMarks / maxMarks) * 100) * 100) / 100;

  // Use the administrator-configured grading scale when available.
  // The built-in scale remains the fallback for fresh installations.
  let activeGradingScale = GRADING_SCALE;
  try {
    const savedSettings = JSON.parse(localStorage.getItem('srms_settings') || '{}');
    if (Array.isArray(savedSettings.gradingScale) && savedSettings.gradingScale.length > 0) {
      activeGradingScale = savedSettings.gradingScale;
    }
  } catch (error) {
    // Ignore invalid stored settings and safely use the default scale.
  }

  const orderedScale = [...activeGradingScale].sort((a, b) => b.minPercentage - a.minPercentage);
  let gradeEntry = orderedScale[orderedScale.length - 1];
  for (const item of orderedScale) {
    if (percentage >= Number(item.minPercentage) && percentage <= Number(item.maxPercentage)) {
      gradeEntry = item;
      break;
    }
  }

  return {
    totalMarks,
    maxMarks,
    percentage,
    grade: gradeEntry.grade,
    gradePoint: gradeEntry.gradePoint,
    gradeDescription: gradeEntry.description,
    isPassed: gradeEntry.passed
  };
};

/**
 * Calculates Semester Grade Point Average (SGPA) for a given semester's subject list.
 * Formula: SGPA = sum(Credits_i * GradePoint_i) / sum(Credits_i)
 */
export const calculateSGPA = (marksList = []) => {
  if (!Array.isArray(marksList) || marksList.length === 0) {
    return 0.0;
  }

  let totalQualityPoints = 0;
  let totalCredits = 0;

  for (const mark of marksList) {
    const credits = Number(mark.credits) || 0;
    const gradePoint = Number(mark.gradePoint) || 0;

    totalQualityPoints += credits * gradePoint;
    totalCredits += credits;
  }

  if (totalCredits === 0) return 0.0;

  const sgpa = totalQualityPoints / totalCredits;
  return Math.round((sgpa + Number.EPSILON) * 100) / 100;
};

/**
 * Calculates Cumulative Grade Point Average (CGPA) considering all completed subjects across all semesters.
 * Formula: CGPA = sum(all Credits * GradePoint) / sum(all Credits)
 */
export const calculateCGPA = (allSemestersMarks = []) => {
  if (!Array.isArray(allSemestersMarks) || allSemestersMarks.length === 0) {
    return 0.0;
  }

  let cumulativeQualityPoints = 0;
  let cumulativeCredits = 0;

  for (const mark of allSemestersMarks) {
    const credits = Number(mark.credits) || 0;
    const gradePoint = Number(mark.gradePoint) || 0;

    cumulativeQualityPoints += credits * gradePoint;
    cumulativeCredits += credits;
  }

  if (cumulativeCredits === 0) return 0.0;

  const cgpa = cumulativeQualityPoints / cumulativeCredits;
  return Math.round((cgpa + Number.EPSILON) * 100) / 100;
};

