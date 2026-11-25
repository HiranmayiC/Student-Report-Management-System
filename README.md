# Advanced Student Report Management System (SRMS)

A professional, enterprise-grade, responsive Student Report Management System built with React.js, Vite, and CSS3. Designed for universities and colleges to manage academic records, attendance, faculty allocations, multi-component marks, GPA calculations, interactive analytics, and professional PDF transcript generation.

---

## 🚀 Technology Stack

### Frontend & Core
- **Framework**: React.js (v18.3.1, Functional Components, Hooks)
- **Language**: JavaScript (ES6+)
- **Build Tool**: Vite (v5.4.11)
- **Styling**: Pure CSS3 with Custom Variables, Flexbox, CSS Grid (Zero CSS frameworks)

### Approved Libraries
- **Routing**: `react-router-dom` (v6.28.1)
- **Analytics & Charts**: `recharts` (v2.15.0)
- **Icons**: `lucide-react` (v0.471.0)
- **PDF Report Generation**: `jspdf` (v2.5.2) & `jspdf-autotable` (v3.8.4)
- **CSV Import / Export**: `papaparse` (v5.4.1)
- **Notifications**: `react-toastify` (v10.0.6)
- **Persistence**: Centralized browser `localStorage`

---

## 🏛️ System Architecture & Role-Based Access Control (RBAC)

The system enforces strict permission boundaries across three roles:
1. **Administrator**:
   - Institutional oversight across all departments, courses, students, and faculty.
   - Complete student and faculty CRUD operations.
   - Assignment of courses and classes to faculty members with real-time permission sync.
   - Universal marks, attendance, and analytics access.
2. **Faculty**:
   - Access restricted strictly to **assigned classes and sections** (`assignedClasses`: e.g. `CS-Sem4-SecA`, `CS-Sem4-SecB`).
   - Marks entry permitted strictly for **assigned subjects** (`assignedSubjects`: e.g. `CS401`, `CS402`).
   - Attendance recording permitted strictly for **assigned class + subject pairs**.
   - URL parameter tampering protection: manually altering URL IDs to unassigned students triggers immediate redirection to an access denied screen.
   - Prohibited from creating, updating, or deleting faculty or student records.
3. **Student**:
   - Access restricted strictly to **personal academic records** (`studentId: STU-2024-001`).
   - Prohibited from accessing classmates' records or the institutional student/faculty directories.
   - Personal SGPA, CGPA, subject marks, attendance history, and transcript downloads.

> ⚠️ **Important Security Notice**: LocalStorage and client-side route guards provide demonstration-level access control for demonstration, evaluation, and educational purposes. In a commercial production environment, sensitive records must be protected by server-side authentication, session tokens (JWT/OAuth), and database authorization policies.

---

## 🔑 Demo Login Credentials & Scope

The application includes three pre-configured demonstration accounts with dedicated workspaces:

| Role | Username | Password | User Identity | Assigned Workspace / Scope |
| :--- | :---: | :---: | :--- | :--- |
| **Administrator** | `admin` | `password123` | Dr. Sarah Jenkins (Dean) | Full institutional access across all records |
| **Faculty Member**| `faculty1` | `password123` | Prof. Alan Turing | Assigned classes: `CS-Sem4-SecA`, `CS-Sem4-SecB`; Assigned subjects: `CS401`, `CS402` |
| **Student** | `student1` | `password123` | Ada Lovelace (`STU-2024-001`) | Personal academic profile, marks, attendance & transcript |

*Note: The login page features quick one-click auto-fill buttons for instant role switching during evaluation.*

---

## 🎓 Student Management Module (Phase 5)

The Student Management module provides comprehensive demographic and academic record oversight:
- **Directory Table**: Real-time listing with avatar, unique student ID, legal name, department, semester, section, class identifier, and contact numbers.
- **Search Engine**: Instant filtering by student name or student ID.
- **Multi-Parameter Filtering**: Simultaneous filtering across Department, Academic Year, Semester, and Section with a single-click "Clear All Filters" action.
- **Sorting**: Two-way sorting (Ascending / Descending) on Student ID, Name, Department, and Semester.
- **Pagination**: 5 records per page with record summary and pagination controls.
- **Creation & Modification Modals**:
  - `StudentFormModal.jsx`: 12 validated fields, email format verification, and strict duplicate Student ID prevention.
  - Immutability of Student ID during edit mode to preserve relational integrity.
- **Destructive Deletion**: `ConfirmDialog.jsx` modal preventing accidental record removal.
- **Service-Level Authorization**: Enforced inside `studentService.js`.

---

## 👨‍🏫 Faculty Management Module (Phase 6)

The Faculty Management module enables institutional administrators to oversee teaching appointments and course assignments:
- **Faculty Directory**: Comprehensive table displaying faculty ID, full name, avatar, email, department, designation, assigned subject badges, assigned class badges, and appointment dates.
- **Appointment & Allocation Modal (`FacultyFormModal.jsx`)**:
  - Validates unique `facultyId`, email syntax, and department allocation.
  - Interactive multi-select grid mapping courses from `COURSE_CATALOG`.
  - Interactive chip toggles assigning class rosters from `AVAILABLE_CLASSES`.
- **Dynamic RBAC Permission Synchronization**:
  - Updating a faculty member's course or class assignments immediately cascades to `srms_faculty`, `srms_users`, and `srms_auth_user`.
  - Permission to view assigned student rosters, enter marks, or record attendance updates dynamically in real time without requiring session logouts.
- **Service-Level Guarding**:
  - Faculty members are restricted to viewing only their own record and cannot mutate allocations.
  - Students are denied access to the faculty directory.

---

## 📊 Academic Assessment & Grading Policy

### Standardized Course Assessment Breakdown (100 Maximum Marks)
1. **Theory + Practical Course**:
   - Internal Assessment: 25 Marks
   - External Exam: 50 Marks
   - Assignment / Seminar: 10 Marks
   - Laboratory / Practical: 15 Marks
   - **Total Maximum**: 100 Marks (Credits: 4)

2. **Theory Only Course**:
   - Internal Assessment: 30 Marks
   - External Exam: 60 Marks
   - Assignment / Seminar: 10 Marks
   - Laboratory: 0 Marks
   - **Total Maximum**: 100 Marks (Credits: 3)

3. **Lab Only Course**:
   - Continuous Practical Evaluation: 40 Marks
   - End-Semester Practical Exam: 40 Marks
   - Lab Record & Viva-Voce: 20 Marks
   - **Total Maximum**: 100 Marks (Credits: 2)

### SGPA & Multi-Semester CGPA Formula
- **SGPA**:
  $$\text{SGPA} = \frac{\sum (C_i \times GP_i)}{\sum C_i}$$
- **CGPA**:
  $$\text{CGPA} = \frac{\sum_{\text{all semesters}} (C_i \times GP_i)}{\sum_{\text{all semesters}} C_i}$$

---

## 📈 Marks & Academic Performance Module (Phase 7)

The Marks & Academic Performance module delivers complete institutional evaluation, dynamic component validation, automated grading, credit-weighted SGPA, and multi-semester CGPA calculations:
- **Component Boundary Engine (`validateComponentMarks`)**:
  - Dynamically enforces maximum mark boundaries per course type:
    - *Theory + Lab*: Internal (25), External (50), Assignment (10), Lab (15) -> Total: 100
    - *Theory Only*: Internal (30), External (60), Assignment (10) -> Total: 100
    - *Lab Only*: Continuous Practical (40), End-Sem Exam (40), Lab Record & Viva (20) -> Total: 100
  - Instant validation feedback preventing negative marks, non-numeric values, or component overflow.
- **Automated Mathematical Results (`calculateAssessmentResults`)**:
  - Instant calculation of total marks, percentage, letter grade, and grade points according to the 10.0 scale:
    - **Grade O**: 90–100% (10.0 GP)
    - **Grade A+**: 80–89.99% (9.0 GP)
    - **Grade A**: 70–79.99% (8.0 GP)
    - **Grade B+**: 60–69.99% (7.0 GP)
    - **Grade B**: 50–59.99% (6.0 GP)
    - **Grade C**: 40–49.99% (5.0 GP)
    - **Grade F**: Below 40% (0.0 GP, Backlog/Fail)
- **Credit-Weighted SGPA & Multi-Semester CGPA**:
  - $\text{SGPA} = \frac{\sum (C_i \times GP_i)}{\sum C_i}$ for each individual semester.
  - $\text{CGPA} = \frac{\sum_{\text{all semesters}} (C_i \times GP_i)}{\sum_{\text{all semesters}} C_i}$ across all completed semesters and courses.
- **UI Components & Workflows**:
  - `GradeBadge.jsx`: Semantic color-coded grade and grade-point badges.
  - `MarksEntryModal.jsx`: Modal with course structure metadata, dynamic input bounds, and real-time live preview of total/percentage/grade.
  - `StudentTranscriptModal.jsx`: Multi-semester academic grade transcript dialog displaying semester SGPAs, total credits, quality points, and overall CGPA.
  - `Marks.jsx`:
    - **Administrator & Faculty View**: Interactive marks directory, KPI stat cards, multi-parameter search/filters, sorting, pagination, and authorization-guarded edit/delete actions.
    - **Student View**: Dedicated academic transcript center featuring semester cards, cumulative CGPA, earned credits, and subject breakdown.
- **Role-Based Authorization**:
  - Faculty can enter marks ONLY for their assigned subjects and assigned classes.
  - Students can view strictly their own academic marks and transcripts.
  - Administrators maintain full institutional marks oversight and deletion rights.

---

## 📅 Attendance Management Module (Phase 8)

The Attendance Management module delivers session-level roll marking, duplicate-free persistence, automated attendance rates, and shortage warnings:
- **Attendance Statuses**:
  - `Present`: Attended session (credited towards attendance percentage).
  - `Absent`: Unexcused absence.
  - `Late`: Delayed arrival (credited towards attendance in standard institutional grading).
  - `Excused`: Official On-Duty (OD) / Medical leave granted by department.
- **Automated Attendance Percentage Formula**:
  $$\text{Attendance \%} = \frac{\text{Attended Sessions}}{\text{Total Sessions}} \times 100$$
  where Attended Sessions = $\text{Count}(\text{Present}) + \text{Count}(\text{Late}) + \text{Count}(\text{Excused})$.
- **Shortage Threshold Monitoring**:
  - Highlights students below the mandatory 75.0% threshold with warning banners and alerts (`AttendanceShortageBadge.jsx`).
  - Enables faculty and administrators to filter records showing only students facing attendance shortages.
- **Composite Duplicate Prevention**:
  - Enforced across `date + classId + subjectId + studentId`.
  - Recording attendance for an existing session automatically updates past records in place without duplicating database entries.
- **UI Components & Workflows**:
  - `AttendanceStatusBadge.jsx`: Semantic color-coded badges for all 4 statuses.
  - `AttendanceShortageBadge.jsx`: Shortage warnings (`< 75%`) and eligibility badges.
  - `MarkAttendanceModal.jsx`: Modal for rapid daily session roll marking, fast "Mark All Present/Absent" actions, and automated detection of previously recorded sessions for corrections.
  - `EditAttendanceModal.jsx`: Single-record correction dialog for adjusting status and remarks.
  - `StudentAttendanceModal.jsx`: Comprehensive student attendance profile modal displaying overall metrics, subject-wise breakdown, and session logs.
  - `Attendance.jsx`:
    - **Administrator & Faculty View**: Interactive attendance directory, KPI stat cards (Total Entries, Average Attendance Rate %, Shortage Alert Count, Monitored Students), multi-parameter search & filters (class, course, status, date, shortage toggle), and edit/delete actions.
    - **Student View**: Dedicated personal attendance portal featuring overall attendance rate, shortage warning alert callouts, subject-wise breakdown table, and detailed session history.
- **Service-Level RBAC**:
  - Faculty members are restricted strictly to assigned classes and subjects.
  - Students are restricted strictly to personal attendance logs.
  - Administrators retain institutional oversight across all classes, subjects, and records.

---

## 📑 Report Generation & PDF Export Module (Phase 9)

The Report Generation and PDF Export module delivers publication-grade student academic transcripts and dossier exports:
- **Comprehensive Academic Report Engine (`reportService.js`)**:
  - Synthesizes student demographics, semester marks, credit-weighted SGPA, multi-semester CGPA, and attendance compliance.
  - Automatic academic standing derivation: "First Class with Exemplary Distinction" ($\ge 9.0$), "First Class with Distinction" ($\ge 8.0$), "First Class" ($\ge 6.5$), "Second Class" ($\ge 5.0$), and "Needs Academic Improvement" ($< 5.0$).
  - Missing data detection with clean "Evaluation Pending" indicators.
- **Vector PDF Generator Engine (`pdfGenerator.js`)**:
  - Engineered with `jsPDF` and `jspdf-autotable`.
  - Institutional branding header with collegiate navy and crimson accent bars, accreditation details, and campus address.
  - Two-column student demographic profile card.
  - Academic performance KPI summary bar (Cumulative CGPA, Earned Credits, Quality Points, Attendance Rate).
  - Multi-semester grade tables formatted with AutoTable grid styling, course credits, component breakdowns (internal, external, asg/lab), total score / 100, letter grade, grade points, and pass/fail indicators.
  - Attendance compliance table with conducted, attended, absent, attendance %, and shortage warning indicators.
  - University grading scale reference legend.
  - Controller of Examinations and Dean of Academic Affairs signature lines with digital institutional seal watermark.
  - Dynamic page numbering ("Page X of Y") across multi-page documents.
- **UI Components & Workflows**:
  - `ReportPreviewModal.jsx`: High-definition in-app visual preview of the transcript canvas before exporting, featuring direct "Download PDF" and "Print Transcript" actions.
  - `Reports.jsx`:
    - **Administrator & Faculty View**: Complete directory of authorized student candidates, KPI stat cards, multi-parameter search & filters (department, semester, evaluation status), one-click preview modal, and instant vector PDF downloads.
    - **Student View**: Embedded personal transcript portal with live GPA cards, semester grade sheets, attendance standing, print shortcuts, and official PDF download.
- **Role-Based Report Access**:
  - Administrators retain institutional access across all student reports.
  - Faculty can generate reports strictly for students enrolled in assigned classes.
  - Students can access strictly their personal academic transcripts.

---

## 📁 Project Structure

```
FSAD/
├── dist/                          # Production build output
├── node_modules/                  # Installed dependencies
├── public/
├── src/
│   ├── assets/                    # Static assets & SVG icons
│   ├── components/
│   │   ├── common/                # Sidebar, Navbar, Modal, ConfirmDialog, StatCard, EmptyState, DashboardLayout, ProtectedRoute
│   │   ├── dashboard/             # Dashboard charts, summaries, feeds
│   │   ├── students/              # StudentFormModal, StudentCard
│   │   ├── faculty/               # FacultyFormModal
│   │   ├── marks/                 # Marks entry grid, badges, calculators
│   │   ├── attendance/            # Attendance marking sheet, warning alerts
│   │   ├── reports/               # Transcripts, report cards, PDF generators
│   │   └── analytics/             # Recharts visualization modules
│   ├── context/                   # ThemeContext, AuthContext
│   ├── hooks/                     # Custom hooks (debounce, pagination, filter)
│   ├── pages/                     # Routed view components
│   │   ├── Login.jsx              # Portal login with demo selector
│   │   ├── Dashboard.jsx          # Role-adaptive institutional overview
│   │   ├── Students.jsx           # Student management directory
│   │   ├── StudentDetails.jsx     # Detailed student profile & self-view
│   │   ├── Faculty.jsx            # Faculty management directory
│   │   ├── Marks.jsx              # Marks & grading management
│   │   ├── Attendance.jsx         # Attendance tracking
│   │   ├── Reports.jsx            # Transcripts & PDF generator
│   │   ├── Analytics.jsx          # Institutional analytics
│   │   ├── Settings.jsx           # System configuration
│   │   ├── Unauthorized.jsx       # 403 access restricted view
│   │   └── NotFound.jsx           # 404 catch-all view
│   ├── services/                  # storageService.js, studentService.js, facultyService.js
│   ├── styles/                    # Plain CSS3 design system
│   │   ├── variables.css          # Design tokens & dark theme
│   │   ├── layout.css             # Shell, sidebar, navbar layout
│   │   ├── components.css         # Cards, badges, buttons, tables
│   │   ├── responsive.css         # Media queries for tablet & mobile
│   │   └── global.css             # Universal reset & baseline
│   ├── utils/                     # rbacRules.js, calculations.js, validators.js, formatters.js
│   ├── App.jsx                    # Root router and layout shell
│   └── main.jsx                   # React DOM entry point
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── PROJECT_PROGRESS.md
└── TASK_REPORTS.md
```

---

## 🛠️ Installation & Running the Application

### Prerequisites
- Node.js (v18.0.0 or higher recommended, verified on v22.20.0)
- npm (v9.0.0 or higher, verified on v10.9.3)

### Installation
```bash
# Clone or navigate to the project directory
cd FSAD

# Install approved dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```
