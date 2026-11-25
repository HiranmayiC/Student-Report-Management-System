/**
 * Academic Transcript PDF Generator
 * Powered by jsPDF and jsPDF-AutoTable.
 * Constructs high-resolution, vector-based, printable official academic transcripts.
 */

import { jsPDF } from 'jspdf';
import autoTablePlugin from 'jspdf-autotable';

// Normalize autoTable function across ESM/CJS environments
const autoTable = typeof autoTablePlugin === 'function'
  ? autoTablePlugin
  : (autoTablePlugin.default || autoTablePlugin);

/**
 * Generates an official university transcript PDF.
 * @param {Object} reportData - The compiled student report data object from reportService.
 * @param {boolean} [download=true] - Whether to trigger browser file download.
 * @returns {jsPDF} The jsPDF document instance.
 */
export const exportStudentTranscriptPDF = (reportData, download = true) => {
  if (!reportData || !reportData.student) {
    throw new Error('Valid student report data is required for PDF generation.');
  }

  const { student, academic, attendance, institution } = reportData;

  // Initialize A4 portrait document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  // -------------------------------------------------------------------
  // 1. Decorative Header Bars
  // -------------------------------------------------------------------
  doc.setFillColor(30, 58, 138); // Primary Collegiate Navy
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFillColor(220, 38, 38); // Accent Crimson
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  currentY = 13;

  // -------------------------------------------------------------------
  // 2. Institutional Header & Crest Branding
  // -------------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(30, 58, 138);
  doc.text(institution.name, pageWidth / 2, currentY, { align: 'center' });

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(institution.department, pageWidth / 2, currentY, { align: 'center' });

  currentY += 4;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(institution.accreditation, pageWidth / 2, currentY, { align: 'center' });

  currentY += 4;
  doc.text(institution.address, pageWidth / 2, currentY, { align: 'center' });

  // Divider Rule
  currentY += 3.5;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // -------------------------------------------------------------------
  // 3. Document Title & Reference Metadata
  // -------------------------------------------------------------------
  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL ACADEMIC TRANSCRIPT & PERFORMANCE DOSSIER', pageWidth / 2, currentY, { align: 'center' });

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Transcript Ref: ${reportData.referenceId}`, margin, currentY);
  doc.text(`Issue Date: ${reportData.issueDate}`, pageWidth - margin, currentY, { align: 'right' });

  // -------------------------------------------------------------------
  // 4. Student Demographic Profile Box
  // -------------------------------------------------------------------
  currentY += 3.5;
  const profileBoxY = currentY;
  const profileBoxHeight = 27;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, profileBoxY, pageWidth - (margin * 2), profileBoxHeight, 2, 2, 'FD');

  const col1X = margin + 4;
  const col2X = margin + 98;
  let textY = profileBoxY + 5.5;

  doc.setFontSize(8.5);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Student Name:', col1X, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(student.fullName, col1X + 26, textY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Student ID:', col2X, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(student.studentId, col2X + 22, textY);

  // Row 2
  textY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Department:', col1X, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.department, col1X + 26, textY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Academic Year:', col2X, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.academicYear, col2X + 26, textY);

  // Row 3
  textY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Current Semester:', col1X, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Semester ${student.semester} (Section ${student.section})`, col1X + 26, textY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Class Identifier:', col2X, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.classId, col2X + 26, textY);

  // Row 4
  textY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Email Address:', col1X, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.email, col1X + 26, textY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Admission Date:', col2X, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.admissionDate || 'N/A', col2X + 26, textY);

  currentY = profileBoxY + profileBoxHeight + 5;

  // -------------------------------------------------------------------
  // 5. Academic Performance KPI Summary Bar
  // -------------------------------------------------------------------
  const kpiBoxHeight = 15;
  doc.setFillColor(239, 246, 255); // Soft blue tint
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), kpiBoxHeight, 2, 2, 'FD');

  const kpiSegmentWidth = (pageWidth - (margin * 2)) / 4;

  const kpis = [
    { label: 'CUMULATIVE CGPA', val: academic.cgpa > 0 ? `${academic.cgpa.toFixed(2)} / 10.0` : 'N/A' },
    { label: 'EARNED CREDITS', val: `${academic.totalCredits}` },
    { label: 'QUALITY POINTS', val: `${academic.totalQualityPoints.toFixed(1)}` },
    { label: 'ATTENDANCE RATE', val: `${attendance.percentage.toFixed(1)}%` }
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + (idx * kpiSegmentWidth) + (kpiSegmentWidth / 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 58, 138);
    doc.text(kpi.label, kpiX, currentY + 4.5, { align: 'center' });

    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, kpiX, currentY + 11.5, { align: 'center' });
  });

  currentY += kpiBoxHeight + 5;

  // -------------------------------------------------------------------
  // 6. Semester-by-Semester Subject Marks Tables
  // -------------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ACADEMIC EVALUATION & SEMESTER GRADE TRANSCRIPTS', margin, currentY);
  currentY += 3;

  if (!academic.semesters || academic.semesters.length === 0) {
    // Missing / Incomplete marks message
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No semester marks have been recorded for this student yet. Academic evaluation is currently pending.', margin, currentY + 4);
    currentY += 12;
  } else {
    academic.semesters.forEach((sem) => {
      // Semester Sub-header Banner
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 58, 138);
      doc.text(
        `SEMESTER ${sem.semester} — (Earned Credits: ${sem.credits} | Semester SGPA: ${sem.sgpa.toFixed(2)})`,
        margin + 3,
        currentY + 4.2
      );
      currentY += 6;

      const tableData = sem.marks.map((m) => [
        m.subjectId,
        m.subjectName,
        `${m.credits}`,
        `${m.components?.internal ?? 0}`,
        `${m.components?.external ?? 0}`,
        `${(m.components?.assignment ?? 0) + (m.components?.lab ?? 0)}`,
        `${m.totalMarks}`,
        m.grade,
        Number(m.gradePoint).toFixed(1),
        m.grade !== 'F' ? 'PASS' : 'FAIL'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Code', 'Course Title', 'Credits', 'Int', 'Ext', 'Asg/Lab', 'Total', 'Grade', 'GP', 'Status']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 7.5,
          cellPadding: 1.8,
          textColor: [15, 23, 42],
          lineColor: [226, 232, 240],
          lineWidth: 0.15
        },
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center', fontStyle: 'bold' },
          7: { halign: 'center', fontStyle: 'bold' },
          8: { halign: 'center' },
          9: { halign: 'center', fontStyle: 'bold' }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 9) {
            if (data.cell.raw === 'PASS') {
              data.cell.styles.textColor = [22, 163, 74];
            } else {
              data.cell.styles.textColor = [220, 38, 38];
            }
          }
        }
      });

      currentY = doc.lastAutoTable.finalY + 4;
    });
  }

  // Check if we need to add a page or continue
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = margin + 5;
  }

  // -------------------------------------------------------------------
  // 7. Attendance Summary Section
  // -------------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ATTENDANCE RECORD & REGULATORY STANDING', margin, currentY);
  currentY += 3;

  if (!attendance.subjectBreakdown || attendance.subjectBreakdown.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('No attendance logs have been recorded for this student. Attendance tracking is currently pending.', margin, currentY + 4);
    currentY += 10;
  } else {
    const attendanceTableData = attendance.subjectBreakdown.map((b) => [
      b.subjectId,
      b.subjectName,
      `${b.totalSessions}`,
      `${b.attendedSessions}`,
      `${b.absentSessions}`,
      `${b.percentage.toFixed(1)}%`,
      b.isShortage ? 'SHORTAGE (<75%)' : 'ELIGIBLE'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Code', 'Course Title', 'Conducted', 'Attended', 'Absent', 'Attendance %', 'Status']],
      body: attendanceTableData,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        textColor: [15, 23, 42],
        lineColor: [226, 232, 240],
        lineWidth: 0.15
      },
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center', fontStyle: 'bold' },
        6: { halign: 'center', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          if (data.cell.raw === 'ELIGIBLE') {
            data.cell.styles.textColor = [22, 163, 74];
          } else {
            data.cell.styles.textColor = [220, 38, 38];
          }
        }
      }
    });

    currentY = doc.lastAutoTable.finalY + 4;
  }

  // -------------------------------------------------------------------
  // 8. University Grading Key & Standing Box
  // -------------------------------------------------------------------
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = margin + 5;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 11, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 58, 138);
  doc.text('UNIVERSITY GRADING SCALE & EVALUATION REFERENCE:', margin + 3, currentY + 3.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'O: 90-100% (10 GP) • A+: 80-89.9% (9 GP) • A: 70-79.9% (8 GP) • B+: 60-69.9% (7 GP) • B: 50-59.9% (6 GP) • C: 40-49.9% (5 GP, Pass) • F: <40% (0 GP, Fail)',
    margin + 3,
    currentY + 7.8
  );

  currentY += 15;

  // -------------------------------------------------------------------
  // 9. Official Signatures & Institutional Verification
  // -------------------------------------------------------------------
  if (currentY > pageHeight - 32) {
    doc.addPage();
    currentY = margin + 10;
  }

  const signY = currentY + 12;

  // Left Signature
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, signY, margin + 55, signY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Dean of Academic Affairs', margin + 30, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Dr. Sarah Jenkins', margin + 30, signY + 7.5, { align: 'center' });

  // Center Security Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 58, 138);
  doc.text('[ OFFICIAL UNIVERSITY SEAL ]', pageWidth / 2, signY + 2, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Digitally Authenticated Transcript', pageWidth / 2, signY + 5.5, { align: 'center' });

  // Right Signature
  doc.line(pageWidth - margin - 55, signY, pageWidth - margin - 5, signY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Controller of Examinations', pageWidth - margin - 30, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Apex Institute of Technology', pageWidth - margin - 30, signY + 7.5, { align: 'center' });

  // -------------------------------------------------------------------
  // 10. Page Footers (Across All Generated Pages)
  // -------------------------------------------------------------------
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);

    doc.text(
      `Apex Institute of Technology • Student Report Management System (ASRMS) • Ref: ${reportData.referenceId}`,
      margin,
      pageHeight - 6
    );

    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  // Trigger browser download if requested
  if (download && typeof window !== 'undefined') {
    const filename = `Transcript_${student.studentId}_${student.fullName.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  }

  return doc;
};
