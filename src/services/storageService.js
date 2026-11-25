/**
 * Centralized Storage Service
 * Manages LocalStorage keys, safe JSON serialization, error handling,
 * and demo seed data.
 */

export const STORAGE_KEYS = {
  USERS: 'srms_users',
  AUTH_USER: 'srms_auth_user',
  THEME: 'srms_theme',
  STUDENTS: 'srms_students',
  FACULTY: 'srms_faculty',
  DEPARTMENTS: 'srms_departments',
  COURSES: 'srms_courses',
  MARKS: 'srms_marks',
  ATTENDANCE: 'srms_attendance',
  NOTIFICATIONS: 'srms_notifications',
  SETTINGS: 'srms_settings'
};

// Course Catalog Definition with Standard Assessment Structures
export const COURSE_CATALOG = [
  { subjectId: 'CS401', subjectName: 'Design and Analysis of Algorithms', department: 'Computer Science', credits: 4, structureType: 'THEORY_LAB', semester: 4 },
  { subjectId: 'CS402', subjectName: 'Database Management Systems', department: 'Computer Science', credits: 4, structureType: 'THEORY_LAB', semester: 4 },
  { subjectId: 'CS403', subjectName: 'Operating Systems Architecture', department: 'Computer Science', credits: 3, structureType: 'THEORY_ONLY', semester: 4 },
  { subjectId: 'CS404', subjectName: 'Computer Networks & Security', department: 'Computer Science', credits: 3, structureType: 'THEORY_ONLY', semester: 4 },
  { subjectId: 'CS405', subjectName: 'Algorithms & Data Structures Practical', department: 'Computer Science', credits: 2, structureType: 'LAB_ONLY', semester: 4 },
  { subjectId: 'CS301', subjectName: 'Discrete Mathematical Structures', department: 'Computer Science', credits: 4, structureType: 'THEORY_ONLY', semester: 3 },
  { subjectId: 'CS302', subjectName: 'Object Oriented Programming with Java', department: 'Computer Science', credits: 4, structureType: 'THEORY_LAB', semester: 3 },
  { subjectId: 'CS201', subjectName: 'Digital Logic and Microprocessors', department: 'Computer Science', credits: 4, structureType: 'THEORY_LAB', semester: 2 },
  { subjectId: 'CS101', subjectName: 'Introduction to Computer Programming', department: 'Computer Science', credits: 4, structureType: 'THEORY_LAB', semester: 1 },
  { subjectId: 'IT601', subjectName: 'Cloud Infrastructure & DevOps', department: 'Information Technology', credits: 4, structureType: 'THEORY_LAB', semester: 6 },
  { subjectId: 'IT602', subjectName: 'Information Security & Cryptography', department: 'Information Technology', credits: 3, structureType: 'THEORY_ONLY', semester: 6 },
  { subjectId: 'IT603', subjectName: 'Advanced Web Technologies', department: 'Information Technology', credits: 3, structureType: 'THEORY_ONLY', semester: 6 },
  { subjectId: 'EC801', subjectName: 'VLSI Design & Systems', department: 'Electronics & Communication', credits: 4, structureType: 'THEORY_LAB', semester: 8 },
  { subjectId: 'EC802', subjectName: 'Digital Signal Processing', department: 'Electronics & Communication', credits: 4, structureType: 'THEORY_LAB', semester: 8 },
  { subjectId: 'EC803', subjectName: 'Embedded Systems & IoT', department: 'Electronics & Communication', credits: 3, structureType: 'THEORY_ONLY', semester: 8 },
  { subjectId: 'ME501', subjectName: 'Advanced Thermodynamics', department: 'Mechanical Engineering', credits: 4, structureType: 'THEORY_ONLY', semester: 5 },
  { subjectId: 'ME502', subjectName: 'Fluid Mechanics & Machinery', department: 'Mechanical Engineering', credits: 4, structureType: 'THEORY_LAB', semester: 5 }
];

// Available Class Roster Sections
export const AVAILABLE_CLASSES = [
  'CS-Sem4-SecA',
  'CS-Sem4-SecB',
  'IT-Sem6-SecA',
  'IT-Sem6-SecB',
  'EC-Sem2-SecA',
  'EC-Sem8-SecA',
  'ME-Sem4-SecA'
];

// Initial Demo Users Seed
export const DEMO_USERS = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'password123',
    role: 'admin',
    name: 'Dr. Sarah Jenkins',
    email: 'admin@apex.edu',
    designation: 'Dean of Academic Affairs',
    department: 'Administration',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    id: 'USR-002',
    username: 'faculty1',
    password: 'password123',
    role: 'faculty',
    name: 'Prof. Alan Turing',
    facultyId: 'FAC-101',
    email: 'aturing@apex.edu',
    designation: 'Associate Professor',
    department: 'Computer Science',
    assignedSubjects: ['CS401', 'CS402'],
    assignedClasses: ['CS-Sem4-SecA', 'CS-Sem4-SecB'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=turing'
  },
  {
    id: 'USR-003',
    username: 'student1',
    password: 'password123',
    role: 'student',
    name: 'Ada Lovelace',
    studentId: 'STU-2024-001',
    email: 'ada@apex.edu',
    department: 'Computer Science',
    academicYear: '2024-2025',
    semester: 4,
    section: 'A',
    classId: 'CS-Sem4-SecA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ada'
  }
];

// Initial Demo Faculty Seed
export const DEMO_FACULTY = [
  {
    facultyId: 'FAC-101',
    fullName: 'Prof. Alan Turing',
    email: 'aturing@apex.edu',
    phone: '+1 (555) 345-6789',
    department: 'Computer Science',
    designation: 'Associate Professor',
    assignedSubjects: ['CS401', 'CS402'],
    assignedClasses: ['CS-Sem4-SecA', 'CS-Sem4-SecB'],
    joiningDate: '2018-08-01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=turing'
  },
  {
    facultyId: 'FAC-102',
    fullName: 'Prof. Barbara Liskov',
    email: 'bliskov@apex.edu',
    phone: '+1 (555) 456-7891',
    department: 'Computer Science',
    designation: 'Professor & Chair',
    assignedSubjects: ['CS403', 'CS404'],
    assignedClasses: ['CS-Sem4-SecA', 'CS-Sem4-SecB'],
    joiningDate: '2015-01-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liskov'
  },
  {
    facultyId: 'FAC-103',
    fullName: 'Prof. Tim Berners-Lee',
    email: 'tberners@apex.edu',
    phone: '+1 (555) 567-8902',
    department: 'Information Technology',
    designation: 'Professor',
    assignedSubjects: ['IT601', 'IT603'],
    assignedClasses: ['IT-Sem6-SecA', 'IT-Sem6-SecB'],
    joiningDate: '2019-07-20',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=berners'
  },
  {
    facultyId: 'FAC-104',
    fullName: 'Prof. Dennis Ritchie',
    email: 'dritchie@apex.edu',
    phone: '+1 (555) 678-9013',
    department: 'Electronics & Communication',
    designation: 'Associate Professor',
    assignedSubjects: ['EC801', 'EC803'],
    assignedClasses: ['EC-Sem2-SecA', 'EC-Sem8-SecA'],
    joiningDate: '2017-09-10',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ritchie'
  }
];

// Initial Demo Students Seed
export const DEMO_STUDENTS = [
  {
    studentId: 'STU-2024-001',
    fullName: 'Ada Lovelace',
    email: 'ada@apex.edu',
    phone: '+1 (555) 234-5678',
    department: 'Computer Science',
    academicYear: '2024-2025',
    semester: 4,
    section: 'A',
    classId: 'CS-Sem4-SecA',
    dateOfBirth: '2003-12-10',
    admissionDate: '2022-08-15',
    address: '42 Analytical Way, Suite 10, Cambridge, MA',
    guardianName: 'Lord Byron',
    guardianContact: '+1 (555) 987-6543',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ada'
  },
  {
    studentId: 'STU-2024-002',
    fullName: 'Charles Babbage',
    email: 'babbage@apex.edu',
    phone: '+1 (555) 345-6789',
    department: 'Computer Science',
    academicYear: '2024-2025',
    semester: 4,
    section: 'B',
    classId: 'CS-Sem4-SecB',
    dateOfBirth: '2003-05-18',
    admissionDate: '2022-08-15',
    address: '15 Difference Engine Court, London, UK',
    guardianName: 'Benjamin Babbage',
    guardianContact: '+1 (555) 876-5432',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=babbage'
  },
  {
    studentId: 'STU-2024-003',
    fullName: 'Margaret Hamilton',
    email: 'mhamilton@apex.edu',
    phone: '+1 (555) 456-7890',
    department: 'Information Technology',
    academicYear: '2024-2025',
    semester: 6,
    section: 'A',
    classId: 'IT-Sem6-SecA',
    dateOfBirth: '2002-08-17',
    admissionDate: '2021-08-15',
    address: '11 Apollo Parkway, Houston, TX',
    guardianName: 'Kenneth Hamilton',
    guardianContact: '+1 (555) 765-4321',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mhamilton'
  },
  {
    studentId: 'STU-2024-004',
    fullName: 'Claude Shannon',
    email: 'cshannon@apex.edu',
    phone: '+1 (555) 567-8901',
    department: 'Electronics & Communication',
    academicYear: '2024-2025',
    semester: 8,
    section: 'A',
    classId: 'EC-Sem8-SecA',
    dateOfBirth: '2001-04-30',
    admissionDate: '2020-08-15',
    address: '8 Information Theory Rd, Princeton, NJ',
    guardianName: 'Claude Shannon Sr.',
    guardianContact: '+1 (555) 654-3210',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cshannon'
  },
  {
    studentId: 'STU-2024-005',
    fullName: 'Grace Hopper',
    email: 'ghopper@apex.edu',
    phone: '+1 (555) 678-9012',
    department: 'Computer Science',
    academicYear: '2024-2025',
    semester: 4,
    section: 'A',
    classId: 'CS-Sem4-SecA',
    dateOfBirth: '2003-12-09',
    admissionDate: '2022-08-15',
    address: '1906 Compiler Lane, New York, NY',
    guardianName: 'Walter Murray Hopper',
    guardianContact: '+1 (555) 543-2109',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ghopper'
  },
  {
    studentId: 'STU-2024-006',
    fullName: 'Katherine Johnson',
    email: 'kjohnson@apex.edu',
    phone: '+1 (555) 789-0123',
    department: 'Information Technology',
    academicYear: '2024-2025',
    semester: 6,
    section: 'B',
    classId: 'IT-Sem6-SecB',
    dateOfBirth: '2002-08-26',
    admissionDate: '2021-08-15',
    address: '100 Orbital Trajectory Blvd, Hampton, VA',
    guardianName: 'Joshua Coleman',
    guardianContact: '+1 (555) 432-1098',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kjohnson'
  },
  {
    studentId: 'STU-2024-007',
    fullName: 'Nikola Tesla',
    email: 'ntesla@apex.edu',
    phone: '+1 (555) 890-1234',
    department: 'Electronics & Communication',
    academicYear: '2024-2025',
    semester: 2,
    section: 'A',
    classId: 'EC-Sem2-SecA',
    dateOfBirth: '2004-07-10',
    admissionDate: '2023-08-15',
    address: '369 Alternating Current Dr, Colorado Springs, CO',
    guardianName: 'Milutin Tesla',
    guardianContact: '+1 (555) 321-0987',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ntesla'
  },
  {
    studentId: 'STU-2024-008',
    fullName: 'Alan Kay',
    email: 'akay@apex.edu',
    phone: '+1 (555) 901-2345',
    department: 'Computer Science',
    academicYear: '2024-2025',
    semester: 4,
    section: 'B',
    classId: 'CS-Sem4-SecB',
    dateOfBirth: '2003-05-17',
    admissionDate: '2022-08-15',
    address: '1970 Dynabook Way, Palo Alto, CA',
    guardianName: 'Hector Kay',
    guardianContact: '+1 (555) 210-9876',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=akay'
  }
];

// Initial Demo Academic Marks Seed (Multiple Semesters for Ada Lovelace & Peers)
export const DEMO_MARKS = [
  // Ada Lovelace (STU-2024-001) - Semester 4
  {
    id: 'MRK-STU001-CS401',
    studentId: 'STU-2024-001',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    department: 'Computer Science',
    semester: 4,
    credits: 4,
    structureType: 'THEORY_LAB',
    components: { internal: 24, external: 48, assignment: 9.5, lab: 14 },
    totalMarks: 95.5,
    maxMarks: 100,
    percentage: 95.5,
    grade: 'O',
    gradePoint: 10,
    facultyRemarks: 'Flawless algorithmic proofs and asymptotic analysis.',
    enteredBy: 'FAC-101',
    updatedAt: '2024-11-01T10:00:00Z'
  },
  {
    id: 'MRK-STU001-CS402',
    studentId: 'STU-2024-001',
    subjectId: 'CS402',
    subjectName: 'Database Management Systems',
    department: 'Computer Science',
    semester: 4,
    credits: 4,
    structureType: 'THEORY_LAB',
    components: { internal: 22, external: 45, assignment: 9, lab: 13 },
    totalMarks: 89.0,
    maxMarks: 100,
    percentage: 89.0,
    grade: 'A+',
    gradePoint: 9,
    facultyRemarks: 'Excellent relational algebra and query optimization skills.',
    enteredBy: 'FAC-101',
    updatedAt: '2024-11-01T10:30:00Z'
  },
  {
    id: 'MRK-STU001-CS403',
    studentId: 'STU-2024-001',
    subjectId: 'CS403',
    subjectName: 'Operating Systems Architecture',
    department: 'Computer Science',
    semester: 4,
    credits: 3,
    structureType: 'THEORY_ONLY',
    components: { internal: 28, external: 56, assignment: 9.5, lab: 0 },
    totalMarks: 93.5,
    maxMarks: 100,
    percentage: 93.5,
    grade: 'O',
    gradePoint: 10,
    facultyRemarks: 'Exceptional comprehension of kernel scheduling and concurrency.',
    enteredBy: 'FAC-102',
    updatedAt: '2024-11-01T11:00:00Z'
  },
  {
    id: 'MRK-STU001-CS405',
    studentId: 'STU-2024-001',
    subjectId: 'CS405',
    subjectName: 'Algorithms & Data Structures Practical',
    department: 'Computer Science',
    semester: 4,
    credits: 2,
    structureType: 'LAB_ONLY',
    components: { internal: 38, external: 39, assignment: 19, lab: 0 },
    totalMarks: 96.0,
    maxMarks: 100,
    percentage: 96.0,
    grade: 'O',
    gradePoint: 10,
    facultyRemarks: 'Brilliant laboratory implementations and clean viva voce.',
    enteredBy: 'FAC-101',
    updatedAt: '2024-11-01T11:30:00Z'
  },

  // Ada Lovelace (STU-2024-001) - Semester 3 (Completed Prior Semester for CGPA evaluation)
  {
    id: 'MRK-STU001-CS301',
    studentId: 'STU-2024-001',
    subjectId: 'CS301',
    subjectName: 'Discrete Mathematical Structures',
    department: 'Computer Science',
    semester: 3,
    credits: 4,
    structureType: 'THEORY_ONLY',
    components: { internal: 27, external: 55, assignment: 9, lab: 0 },
    totalMarks: 91.0,
    maxMarks: 100,
    percentage: 91.0,
    grade: 'O',
    gradePoint: 10,
    facultyRemarks: 'Rigorous mathematical proof mastery.',
    enteredBy: 'FAC-101',
    updatedAt: '2024-05-15T10:00:00Z'
  },
  {
    id: 'MRK-STU001-CS302',
    studentId: 'STU-2024-001',
    subjectId: 'CS302',
    subjectName: 'Object Oriented Programming with Java',
    department: 'Computer Science',
    semester: 3,
    credits: 4,
    structureType: 'THEORY_LAB',
    components: { internal: 23, external: 46, assignment: 9, lab: 14 },
    totalMarks: 92.0,
    maxMarks: 100,
    percentage: 92.0,
    grade: 'O',
    gradePoint: 10,
    facultyRemarks: 'Solid architectural patterns.',
    enteredBy: 'FAC-102',
    updatedAt: '2024-05-15T10:30:00Z'
  },

  // Charles Babbage (STU-2024-002) - Semester 4
  {
    id: 'MRK-STU002-CS401',
    studentId: 'STU-2024-002',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    department: 'Computer Science',
    semester: 4,
    credits: 4,
    structureType: 'THEORY_LAB',
    components: { internal: 21, external: 42, assignment: 8, lab: 13 },
    totalMarks: 84.0,
    maxMarks: 100,
    percentage: 84.0,
    grade: 'A+',
    gradePoint: 9,
    facultyRemarks: 'Strong analytical mindset.',
    enteredBy: 'FAC-101',
    updatedAt: '2024-11-01T12:00:00Z'
  },
  {
    id: 'MRK-STU002-CS402',
    studentId: 'STU-2024-002',
    subjectId: 'CS402',
    subjectName: 'Database Management Systems',
    department: 'Computer Science',
    semester: 4,
    credits: 4,
    structureType: 'THEORY_LAB',
    components: { internal: 19, external: 39, assignment: 8, lab: 11 },
    totalMarks: 77.0,
    maxMarks: 100,
    percentage: 77.0,
    grade: 'A',
    gradePoint: 8,
    facultyRemarks: 'Good performance in relational models.',
    enteredBy: 'FAC-101',
    updatedAt: '2024-11-01T12:30:00Z'
  }
];

// Initial Demo Attendance Seed Data
export const DEMO_ATTENDANCE = [
  // Class: CS-Sem4-SecA, Course: CS401 (Design and Analysis of Algorithms)
  // Date: 2024-10-21
  {
    id: 'ATT-20241021-CS401-STU001',
    date: '2024-10-21',
    classId: 'CS-Sem4-SecA',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-001',
    studentName: 'Ada Lovelace',
    status: 'Present',
    remarks: 'Active participation in asymptotic analysis.',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-21T09:05:00Z',
    updatedAt: '2024-10-21T09:05:00Z'
  },
  {
    id: 'ATT-20241021-CS401-STU005',
    date: '2024-10-21',
    classId: 'CS-Sem4-SecA',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-005',
    studentName: 'Grace Hopper',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-21T09:05:00Z',
    updatedAt: '2024-10-21T09:05:00Z'
  },
  // Date: 2024-10-22
  {
    id: 'ATT-20241022-CS401-STU001',
    date: '2024-10-22',
    classId: 'CS-Sem4-SecA',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-001',
    studentName: 'Ada Lovelace',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-22T09:05:00Z',
    updatedAt: '2024-10-22T09:05:00Z'
  },
  {
    id: 'ATT-20241022-CS401-STU005',
    date: '2024-10-22',
    classId: 'CS-Sem4-SecA',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-005',
    studentName: 'Grace Hopper',
    status: 'Late',
    remarks: 'Late arrival (10 mins) due to transit delay.',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-22T09:15:00Z',
    updatedAt: '2024-10-22T09:15:00Z'
  },
  // Date: 2024-10-23
  {
    id: 'ATT-20241023-CS401-STU001',
    date: '2024-10-23',
    classId: 'CS-Sem4-SecA',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-001',
    studentName: 'Ada Lovelace',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-23T09:05:00Z',
    updatedAt: '2024-10-23T09:05:00Z'
  },
  {
    id: 'ATT-20241023-CS401-STU005',
    date: '2024-10-23',
    classId: 'CS-Sem4-SecA',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-005',
    studentName: 'Grace Hopper',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-23T09:05:00Z',
    updatedAt: '2024-10-23T09:05:00Z'
  },
  // Date: 2024-10-24
  {
    id: 'ATT-20241024-CS401-STU001',
    date: '2024-10-24',
    classId: 'CS-Sem4-SecA',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-001',
    studentName: 'Ada Lovelace',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-24T09:05:00Z',
    updatedAt: '2024-10-24T09:05:00Z'
  },
  {
    id: 'ATT-20241024-CS401-STU005',
    date: '2024-10-24',
    classId: 'CS-Sem4-SecA',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-005',
    studentName: 'Grace Hopper',
    status: 'Excused',
    remarks: 'Authorized Department Hackathon Representation.',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-24T09:05:00Z',
    updatedAt: '2024-10-24T09:05:00Z'
  },
  // Date: 2024-10-25
  {
    id: 'ATT-20241025-CS401-STU001',
    date: '2024-10-25',
    classId: 'CS-Sem4-SecA',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-001',
    studentName: 'Ada Lovelace',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-25T09:05:00Z',
    updatedAt: '2024-10-25T09:05:00Z'
  },
  {
    id: 'ATT-20241025-CS401-STU005',
    date: '2024-10-25',
    classId: 'CS-Sem4-SecA',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-005',
    studentName: 'Grace Hopper',
    status: 'Absent',
    remarks: 'Uninformed absence.',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-25T09:05:00Z',
    updatedAt: '2024-10-25T09:05:00Z'
  },

  // Class: CS-Sem4-SecB, Course: CS401 (Design and Analysis of Algorithms) - Shortage Demonstrations
  // Date: 2024-10-21
  {
    id: 'ATT-20241021-CS401-STU002',
    date: '2024-10-21',
    classId: 'CS-Sem4-SecB',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-002',
    studentName: 'Charles Babbage',
    status: 'Absent',
    remarks: 'Uninformed absence.',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-21T11:05:00Z',
    updatedAt: '2024-10-21T11:05:00Z'
  },
  {
    id: 'ATT-20241021-CS401-STU008',
    date: '2024-10-21',
    classId: 'CS-Sem4-SecB',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-008',
    studentName: 'Alan Kay',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-21T11:05:00Z',
    updatedAt: '2024-10-21T11:05:00Z'
  },
  // Date: 2024-10-22
  {
    id: 'ATT-20241022-CS401-STU002',
    date: '2024-10-22',
    classId: 'CS-Sem4-SecB',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-002',
    studentName: 'Charles Babbage',
    status: 'Absent',
    remarks: 'Uninformed absence.',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-22T11:05:00Z',
    updatedAt: '2024-10-22T11:05:00Z'
  },
  {
    id: 'ATT-20241022-CS401-STU008',
    date: '2024-10-22',
    classId: 'CS-Sem4-SecB',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-008',
    studentName: 'Alan Kay',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-22T11:05:00Z',
    updatedAt: '2024-10-22T11:05:00Z'
  },
  // Date: 2024-10-23
  {
    id: 'ATT-20241023-CS401-STU002',
    date: '2024-10-23',
    classId: 'CS-Sem4-SecB',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-002',
    studentName: 'Charles Babbage',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-23T11:05:00Z',
    updatedAt: '2024-10-23T11:05:00Z'
  },
  {
    id: 'ATT-20241023-CS401-STU008',
    date: '2024-10-23',
    classId: 'CS-Sem4-SecB',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-008',
    studentName: 'Alan Kay',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-23T11:05:00Z',
    updatedAt: '2024-10-23T11:05:00Z'
  },
  // Date: 2024-10-24
  {
    id: 'ATT-20241024-CS401-STU002',
    date: '2024-10-24',
    classId: 'CS-Sem4-SecB',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-002',
    studentName: 'Charles Babbage',
    status: 'Absent',
    remarks: 'Medical leave without prior notice.',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-24T11:05:00Z',
    updatedAt: '2024-10-24T11:05:00Z'
  },
  {
    id: 'ATT-20241024-CS401-STU008',
    date: '2024-10-24',
    classId: 'CS-Sem4-SecB',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-008',
    studentName: 'Alan Kay',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-24T11:05:00Z',
    updatedAt: '2024-10-24T11:05:00Z'
  },
  // Date: 2024-10-25
  {
    id: 'ATT-20241025-CS401-STU002',
    date: '2024-10-25',
    classId: 'CS-Sem4-SecB',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-002',
    studentName: 'Charles Babbage',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-25T11:05:00Z',
    updatedAt: '2024-10-25T11:05:00Z'
  },
  {
    id: 'ATT-20241025-CS401-STU008',
    date: '2024-10-25',
    classId: 'CS-Sem4-SecB',
    subjectId: 'CS401',
    subjectName: 'Design and Analysis of Algorithms',
    studentId: 'STU-2024-008',
    studentName: 'Alan Kay',
    status: 'Present',
    remarks: '',
    recordedBy: 'FAC-101',
    recordedAt: '2024-10-25T11:05:00Z',
    updatedAt: '2024-10-25T11:05:00Z'
  }
];

export const storageService = {
  // Read key with safe JSON parsing and fallback
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (err) {
      console.error(`[storageService] Error parsing key "${key}":`, err);
      return defaultValue;
    }
  },

  // Save key with serialization and event notification
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Broadcast storage change event for React components
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('srms-storage-change', { detail: { key, value } }));
      }
      return true;
    } catch (err) {
      console.error(`[storageService] Error setting key "${key}":`, err);
      return false;
    }
  },

  // Remove key
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('srms-storage-change', { detail: { key, value: null } }));
      }
      return true;
    } catch (err) {
      console.error(`[storageService] Error removing key "${key}":`, err);
      return false;
    }
  },

  // Initialize demo users
  initializeUsers: () => {
    const existing = storageService.getItem(STORAGE_KEYS.USERS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      storageService.setItem(STORAGE_KEYS.USERS, DEMO_USERS);
      return DEMO_USERS;
    }
    return existing;
  },

  // Initialize demo students
  initializeStudents: () => {
    const existing = storageService.getItem(STORAGE_KEYS.STUDENTS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      storageService.setItem(STORAGE_KEYS.STUDENTS, DEMO_STUDENTS);
      return DEMO_STUDENTS;
    }
    return existing;
  },

  // Initialize demo faculty
  initializeFaculty: () => {
    const existing = storageService.getItem(STORAGE_KEYS.FACULTY);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      storageService.setItem(STORAGE_KEYS.FACULTY, DEMO_FACULTY);
      return DEMO_FACULTY;
    }
    return existing;
  },

  // Initialize demo marks
  initializeMarks: () => {
    const existing = storageService.getItem(STORAGE_KEYS.MARKS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      storageService.setItem(STORAGE_KEYS.MARKS, DEMO_MARKS);
      return DEMO_MARKS;
    }
    return existing;
  },

  // Helper getters
  getStudents: () => {
    const existing = storageService.getItem(STORAGE_KEYS.STUDENTS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return storageService.initializeStudents();
    }
    return existing;
  },

  getFaculty: () => {
    const existing = storageService.getItem(STORAGE_KEYS.FACULTY);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return storageService.initializeFaculty();
    }
    return existing;
  },

  getMarks: () => {
    const existing = storageService.getItem(STORAGE_KEYS.MARKS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return storageService.initializeMarks();
    }
    return existing;
  },

  // Initialize demo attendance
  initializeAttendance: () => {
    const existing = storageService.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      storageService.setItem(STORAGE_KEYS.ATTENDANCE, DEMO_ATTENDANCE);
      return DEMO_ATTENDANCE;
    }
    return existing;
  },

  getAttendance: () => {
    const existing = storageService.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return storageService.initializeAttendance();
    }
    return existing;
  }
};
