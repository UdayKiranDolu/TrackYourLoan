// import { Response } from 'express';
// import PDFDocument from 'pdfkit';
// import { Loan, LoanHistory, ILoan } from '../models';
// import { Types } from 'mongoose';
// import { LoanStatus } from '../types';
// import { AppError } from '../middleware/errorHandler.middleware';

// interface ExportFilters {
//     userId?: string;
//     status?: LoanStatus;
// }

// // Color palette for professional look
// const COLORS = {
//     primary: '#2563eb',
//     primaryDark: '#1e40af',
//     primaryLight: '#dbeafe',
//     secondary: '#64748b',
//     success: '#16a34a',
//     successLight: '#dcfce7',
//     warning: '#ca8a04',
//     warningLight: '#fef9c3',
//     danger: '#dc2626',
//     dangerLight: '#fee2e2',
//     text: '#1f2937',
//     textLight: '#6b7280',
//     textMuted: '#9ca3af',
//     border: '#e5e7eb',
//     borderLight: '#f3f4f6',
//     background: '#f8fafc',
//     white: '#ffffff',
// };

// export class ExportService {
//     /**
//      * Get loans for export
//      */
//     static async getLoansForExport(filters: ExportFilters): Promise<ILoan[]> {
//         const query: any = {};

//         if (filters.userId) {
//             query.ownerUserId = new Types.ObjectId(filters.userId);
//         }

//         if (filters.status) {
//             query.status = filters.status;
//         }

//         return Loan.find(query)
//             .populate('ownerUserId', 'email')
//             .sort({ createdAt: -1 });
//     }

//     /**
//      * Generate CSV content
//      */
//     static generateCSV(loans: ILoan[]): string {
//         const headers = [
//             'S.No',
//             'Borrower Name',
//             'Principal Amount (INR)',
//             'Interest Amount (INR)',
//             'Total Amount (INR)',
//             'Given Date',
//             'Due Date',
//             'Status',
//             'Notes',
//             'Created At',
//         ];

//         const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

//         const rows = loans.map((loan, index) => [
//             (index + 1).toString(),
//             escapeCsv(loan.borrowerName),
//             loan.actualAmount.toString(),
//             loan.interestAmount.toString(),
//             (loan.actualAmount + loan.interestAmount).toString(),
//             loan.givenDate.toISOString().split('T')[0],
//             loan.dueDate.toISOString().split('T')[0],
//             loan.status,
//             escapeCsv(loan.notes || ''),
//             loan.createdAt.toISOString().split('T')[0],
//         ]);

//         return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
//     }

//     /**
//      * Format currency in Indian format
//      */
//     private static formatCurrency(amount: number): string {
//         return `₹${amount.toLocaleString('en-IN')}`;
//     }

//     /**
//      * Format date in Indian format
//      */
//     private static formatDate(date: Date): string {
//         return date.toLocaleDateString('en-IN', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric',
//         });
//     }

//     /**
//      * Get status color
//      */
//     private static getStatusColor(status: string): string {
//         switch (status) {
//             case 'ACTIVE':
//                 return COLORS.primary;
//             case 'OVERDUE':
//                 return COLORS.danger;
//             case 'COMPLETED':
//                 return COLORS.success;
//             default:
//                 return COLORS.secondary;
//         }
//     }

//     /**
//      * Get status background color
//      */
//     private static getStatusBgColor(status: string): string {
//         switch (status) {
//             case 'ACTIVE':
//                 return COLORS.primaryLight;
//             case 'OVERDUE':
//                 return COLORS.dangerLight;
//             case 'COMPLETED':
//                 return COLORS.successLight;
//             default:
//                 return COLORS.borderLight;
//         }
//     }

//     /**
//      * Draw horizontal line
//      */
//     private static drawLine(
//         doc: PDFKit.PDFDocument,
//         y: number,
//         startX: number = 50,
//         endX: number = 545,
//         color: string = COLORS.border,
//         lineWidth: number = 1
//     ): void {
//         doc
//             .strokeColor(color)
//             .lineWidth(lineWidth)
//             .moveTo(startX, y)
//             .lineTo(endX, y)
//             .stroke();
//     }

//     /**
//      * Draw status badge
//      */
//     private static drawStatusBadge(
//         doc: PDFKit.PDFDocument,
//         status: string,
//         x: number,
//         y: number,
//         width: number = 70,
//         height: number = 18
//     ): void {
//         const bgColor = this.getStatusBgColor(status);
//         const textColor = this.getStatusColor(status);

//         doc
//             .roundedRect(x, y, width, height, 4)
//             .fill(bgColor);

//         doc
//             .fontSize(8)
//             .font('Helvetica-Bold')
//             .fillColor(textColor)
//             .text(status, x, y + 5, {
//                 width: width,
//                 align: 'center',
//             });
//     }

//     /**
//      * Draw compact summary card
//      */
//     private static drawCompactCard(
//         doc: PDFKit.PDFDocument,
//         x: number,
//         y: number,
//         width: number,
//         height: number,
//         label: string,
//         value: string,
//         accentColor: string = COLORS.primary
//     ): void {
//         // Card background
//         doc
//             .roundedRect(x, y, width, height, 4)
//             .fill(COLORS.background);

//         // Left accent bar
//         doc
//             .rect(x, y, 3, height)
//             .fill(accentColor);

//         // Label
//         doc
//             .fontSize(7)
//             .font('Helvetica')
//             .fillColor(COLORS.textMuted)
//             .text(label.toUpperCase(), x + 10, y + 8, { width: width - 15 });

//         // Value
//         doc
//             .fontSize(12)
//             .font('Helvetica-Bold')
//             .fillColor(COLORS.text)
//             .text(value, x + 10, y + 22, { width: width - 15 });
//     }

//     /**
//      * Draw info row
//      */
//     private static drawInfoRow(
//         doc: PDFKit.PDFDocument,
//         x: number,
//         y: number,
//         label: string,
//         value: string,
//         labelWidth: number = 100,
//         valueColor: string = COLORS.text
//     ): void {
//         doc
//             .fontSize(9)
//             .font('Helvetica')
//             .fillColor(COLORS.textLight)
//             .text(label, x, y, { width: labelWidth });

//         doc
//             .fontSize(9)
//             .font('Helvetica-Bold')
//             .fillColor(valueColor)
//             .text(value, x + labelWidth, y);
//     }

//     /**
//      * Generate multi-loan PDF report - Compact layout (multiple loans per page)
//      */
//     static async generatePDF(loans: ILoan[], res: Response): Promise<void> {
//         const doc = new PDFDocument({
//             margin: 40,
//             size: 'A4',
//             bufferPages: true,
//         });

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader(
//             'Content-Disposition',
//             `attachment; filename=loans_report_${Date.now()}.pdf`
//         );

//         doc.pipe(res);

//         // Calculate statistics
//         const totalLoans = loans.length;
//         const activeLoans = loans.filter((l) => l.status === 'ACTIVE').length;
//         const overdueLoans = loans.filter((l) => l.status === 'OVERDUE').length;
//         const completedLoans = loans.filter((l) => l.status === 'COMPLETED').length;
//         const totalPrincipal = loans.reduce((sum, l) => sum + l.actualAmount, 0);
//         const totalInterest = loans.reduce((sum, l) => sum + l.interestAmount, 0);
//         const grandTotal = totalPrincipal + totalInterest;

//         // ==================== HEADER ====================
//         // Header background
//         doc.rect(0, 0, 595, 70).fill(COLORS.primary);

//         // Logo
//         doc.circle(55, 35, 18).fill(COLORS.white);
//         doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.primary).text('LT', 47, 28);

//         // Title
//         doc.fontSize(20).font('Helvetica-Bold').fillColor(COLORS.white).text('LOAN TRACKER', 85, 20);
//         doc.fontSize(10).font('Helvetica').fillColor(COLORS.white).text('Loans Report', 85, 45);

//         // Date
//         doc.fontSize(9).font('Helvetica').fillColor(COLORS.white)
//             .text(`Generated: ${this.formatDate(new Date())}`, 400, 28, { width: 150, align: 'right' });
//         doc.text(`Total: ${totalLoans} loans`, 400, 42, { width: 150, align: 'right' });

//         let currentY = 85;

//         // ==================== SUMMARY SECTION ====================
//         doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text).text('Summary', 40, currentY);
//         currentY += 18;

//         // Summary cards row
//         const cardWidth = 82;
//         const cardHeight = 42;
//         const cardGap = 8;

//         this.drawCompactCard(doc, 40, currentY, cardWidth, cardHeight, 'Total Loans', totalLoans.toString(), COLORS.primary);
//         this.drawCompactCard(doc, 40 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 'Active', activeLoans.toString(), COLORS.primary);
//         this.drawCompactCard(doc, 40 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 'Overdue', overdueLoans.toString(), COLORS.danger);
//         this.drawCompactCard(doc, 40 + (cardWidth + cardGap) * 3, currentY, cardWidth, cardHeight, 'Completed', completedLoans.toString(), COLORS.success);

//         // Amount cards
//         const amountCardWidth = 125;
//         this.drawCompactCard(doc, 40 + (cardWidth + cardGap) * 4, currentY, amountCardWidth, cardHeight, 'Grand Total', this.formatCurrency(grandTotal), COLORS.success);

//         currentY += cardHeight + 15;

//         // ==================== LOANS TABLE ====================
//         doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text).text('Loan Details', 40, currentY);
//         currentY += 15;

//         // Table header
//         doc.rect(40, currentY, 515, 22).fill(COLORS.primaryDark);

//         doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.white);
//         doc.text('#', 45, currentY + 7, { width: 20 });
//         doc.text('BORROWER', 65, currentY + 7, { width: 110 });
//         doc.text('PRINCIPAL', 175, currentY + 7, { width: 70, align: 'right' });
//         doc.text('INTEREST', 250, currentY + 7, { width: 60, align: 'right' });
//         doc.text('TOTAL', 315, currentY + 7, { width: 70, align: 'right' });
//         doc.text('GIVEN', 390, currentY + 7, { width: 55, align: 'center' });
//         doc.text('DUE', 445, currentY + 7, { width: 55, align: 'center' });
//         doc.text('STATUS', 500, currentY + 7, { width: 50, align: 'center' });

//         currentY += 22;

//         // Table rows
//         for (let i = 0; i < loans.length; i++) {
//             const loan = loans[i];

//             // Check for new page
//             if (currentY > 780) {
//                 doc.addPage();
//                 currentY = 40;

//                 // Redraw table header
//                 doc.rect(40, currentY, 515, 22).fill(COLORS.primaryDark);
//                 doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.white);
//                 doc.text('#', 45, currentY + 7, { width: 20 });
//                 doc.text('BORROWER', 65, currentY + 7, { width: 110 });
//                 doc.text('PRINCIPAL', 175, currentY + 7, { width: 70, align: 'right' });
//                 doc.text('INTEREST', 250, currentY + 7, { width: 60, align: 'right' });
//                 doc.text('TOTAL', 315, currentY + 7, { width: 70, align: 'right' });
//                 doc.text('GIVEN', 390, currentY + 7, { width: 55, align: 'center' });
//                 doc.text('DUE', 445, currentY + 7, { width: 55, align: 'center' });
//                 doc.text('STATUS', 500, currentY + 7, { width: 50, align: 'center' });
//                 currentY += 22;
//             }

//             const rowHeight = 24;
//             const isAlternate = i % 2 === 1;

//             if (isAlternate) {
//                 doc.rect(40, currentY, 515, rowHeight).fill(COLORS.background);
//             }

//             doc.fontSize(8).font('Helvetica').fillColor(COLORS.text);
//             doc.text((i + 1).toString(), 45, currentY + 8, { width: 20 });

//             // Truncate borrower name
//             const borrowerName = loan.borrowerName.length > 18
//                 ? loan.borrowerName.substring(0, 18) + '...'
//                 : loan.borrowerName;
//             doc.font('Helvetica-Bold').text(borrowerName, 65, currentY + 8, { width: 110 });

//             doc.font('Helvetica');
//             doc.text(this.formatCurrency(loan.actualAmount), 175, currentY + 8, { width: 70, align: 'right' });
//             doc.text(this.formatCurrency(loan.interestAmount), 250, currentY + 8, { width: 60, align: 'right' });
//             doc.font('Helvetica-Bold').fillColor(COLORS.primary)
//                 .text(this.formatCurrency(loan.actualAmount + loan.interestAmount), 315, currentY + 8, { width: 70, align: 'right' });

//             doc.font('Helvetica').fillColor(COLORS.text);
//             doc.text(this.formatDate(loan.givenDate), 390, currentY + 8, { width: 55, align: 'center' });

//             const isOverdue = loan.dueDate < new Date() && loan.status !== 'COMPLETED';
//             doc.fillColor(isOverdue ? COLORS.danger : COLORS.text);
//             doc.text(this.formatDate(loan.dueDate), 445, currentY + 8, { width: 55, align: 'center' });

//             // Status badge
//             this.drawStatusBadge(doc, loan.status, 497, currentY + 4, 55, 16);

//             currentY += rowHeight;
//         }

//         // Table bottom border
//         this.drawLine(doc, currentY, 40, 555, COLORS.border);

//         // ==================== FOOTER ON ALL PAGES ====================
//         const pages = doc.bufferedPageRange();
//         for (let i = 0; i < pages.count; i++) {
//             doc.switchToPage(i);

//             // Footer line
//             this.drawLine(doc, 810, 40, 555, COLORS.border);

//             // Footer text
//             doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted);
//             doc.text('Loan Tracker - Professional Loan Management', 40, 818);
//             doc.text(`Page ${i + 1} of ${pages.count}`, 480, 818, { width: 75, align: 'right' });
//         }

//         doc.end();
//     }

//     /**
//      * Generate single loan PDF - ONE PAGE ONLY with compact layout
//      */
//     static async generateLoanDetailPDF(
//         loanId: string,
//         userId: string | null,
//         res: Response
//     ): Promise<void> {
//         const query: any = { _id: new Types.ObjectId(loanId) };
//         if (userId) {
//             query.ownerUserId = new Types.ObjectId(userId);
//         }

//         const loan = await Loan.findOne(query).populate('ownerUserId', 'email');

//         if (!loan) {
//             throw new AppError('Loan not found', 404);
//         }

//         const history = await LoanHistory.find({ loanId: new Types.ObjectId(loanId) })
//             .sort({ changedAt: -1 })
//             .limit(5)  // Limit history to 5 entries to fit on one page
//             .populate('changedByUserId', 'email');

//         const doc = new PDFDocument({
//             margin: 40,
//             size: 'A4',
//         });

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader(
//             'Content-Disposition',
//             `attachment; filename=loan_${loan.borrowerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`
//         );

//         doc.pipe(res);

//         const ownerEmail = loan.ownerUserId && typeof loan.ownerUserId === 'object'
//             ? (loan.ownerUserId as any).email
//             : null;

//         const totalAmount = loan.actualAmount + loan.interestAmount;
//         const isOverdue = loan.dueDate < new Date() && loan.status !== 'COMPLETED';
//         const duration = Math.ceil((loan.dueDate.getTime() - loan.givenDate.getTime()) / (1000 * 60 * 60 * 24));

//         // ==================== HEADER (Compact) ====================
//         doc.rect(0, 0, 595, 60).fill(COLORS.primary);

//         // Logo
//         doc.circle(50, 30, 15).fill(COLORS.white);
//         doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.primary).text('LT', 43, 24);

//         // Title
//         doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.white).text('LOAN STATEMENT', 75, 18);
//         doc.fontSize(9).font('Helvetica').fillColor(COLORS.white)
//             .text(`Generated: ${this.formatDate(new Date())}`, 75, 38);

//         // Loan ID on right
//         doc.fontSize(8).fillColor(COLORS.white)
//             .text(`ID: ${loan._id.toString().slice(-8).toUpperCase()}`, 400, 25, { width: 150, align: 'right' });

//         if (ownerEmail) {
//             doc.text(`Owner: ${ownerEmail}`, 400, 38, { width: 150, align: 'right' });
//         }

//         let currentY = 75;

//         // ==================== BORROWER SECTION ====================
//         doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight).text('BORROWER', 40, currentY);
//         currentY += 15;

//         // Borrower card
//         doc.roundedRect(40, currentY, 515, 50, 6).fill(COLORS.background);

//         // Avatar
//         doc.circle(70, currentY + 25, 18).fill(COLORS.primary);
//         doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.white)
//             .text(loan.borrowerName.charAt(0).toUpperCase(), 63, currentY + 18);

//         // Name and status
//         doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.text)
//             .text(loan.borrowerName, 100, currentY + 12, { width: 300 });

//         this.drawStatusBadge(doc, loan.status, 100, currentY + 32, 65, 16);

//         // Created date on right
//         doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted)
//             .text(`Created: ${this.formatDate(loan.createdAt)}`, 400, currentY + 20, { width: 145, align: 'right' });

//         currentY += 60;

//         // ==================== AMOUNT SECTION ====================
//         doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight).text('AMOUNT DETAILS', 40, currentY);
//         currentY += 15;

//         // Amount cards
//         const amtCardWidth = 165;
//         const amtCardHeight = 50;
//         const amtCardGap = 10;

//         this.drawCompactCard(doc, 40, currentY, amtCardWidth, amtCardHeight, 'Principal Amount', this.formatCurrency(loan.actualAmount), COLORS.primary);
//         this.drawCompactCard(doc, 40 + amtCardWidth + amtCardGap, currentY, amtCardWidth, amtCardHeight, 'Interest Amount', this.formatCurrency(loan.interestAmount), COLORS.warning);
//         this.drawCompactCard(doc, 40 + (amtCardWidth + amtCardGap) * 2, currentY, amtCardWidth, amtCardHeight, 'Total Amount', this.formatCurrency(totalAmount), COLORS.success);

//         currentY += amtCardHeight + 15;

//         // ==================== DATE SECTION ====================
//         doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight).text('TIMELINE', 40, currentY);
//         currentY += 15;

//         // Date box
//         doc.roundedRect(40, currentY, 515, 45, 6).fill(COLORS.background);

//         // Given Date
//         doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted).text('GIVEN DATE', 55, currentY + 10);
//         doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text).text(this.formatDate(loan.givenDate), 55, currentY + 24);

//         // Arrow
//         doc.fontSize(14).fillColor(COLORS.textMuted).text('→', 175, currentY + 18);

//         // Due Date
//         doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted).text('DUE DATE', 210, currentY + 10);
//         doc.fontSize(11).font('Helvetica-Bold').fillColor(isOverdue ? COLORS.danger : COLORS.text)
//             .text(this.formatDate(loan.dueDate), 210, currentY + 24);

//         // Duration
//         doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted).text('DURATION', 340, currentY + 10);
//         doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text).text(`${duration} days`, 340, currentY + 24);

//         // Days remaining/overdue
//         const today = new Date();
//         const daysRemaining = Math.ceil((loan.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

//         doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted).text('STATUS', 450, currentY + 10);
//         if (loan.status === 'COMPLETED') {
//             doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.success).text('Completed', 450, currentY + 24);
//         } else if (daysRemaining < 0) {
//             doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.danger).text(`${Math.abs(daysRemaining)}d overdue`, 450, currentY + 24);
//         } else if (daysRemaining === 0) {
//             doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.warning).text('Due today', 450, currentY + 24);
//         } else {
//             doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.success).text(`${daysRemaining}d left`, 450, currentY + 24);
//         }

//         currentY += 55;

//         // ==================== NOTES SECTION (Compact) ====================
//         if (loan.notes && loan.notes.trim()) {
//             doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight).text('NOTES', 40, currentY);
//             currentY += 15;

//             // Truncate notes if too long
//             const maxNoteLength = 200;
//             const displayNotes = loan.notes.length > maxNoteLength
//                 ? loan.notes.substring(0, maxNoteLength) + '...'
//                 : loan.notes;

//             doc.roundedRect(40, currentY, 515, 40, 6).fill(COLORS.background);
//             doc.fontSize(9).font('Helvetica').fillColor(COLORS.text)
//                 .text(displayNotes, 50, currentY + 12, { width: 495, height: 25 });

//             currentY += 50;
//         }

//         // ==================== CHANGE HISTORY (Compact) ====================
//         doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight).text('CHANGE HISTORY', 40, currentY);

//         if (history.length > 5) {
//             doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted)
//                 .text(`(Showing latest 5 of ${history.length})`, 150, currentY + 2);
//         }

//         currentY += 15;

//         if (history.length > 0) {
//             // History table header
//             doc.roundedRect(40, currentY, 515, 20, 4).fill(COLORS.primaryDark);
//             doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.white);
//             doc.text('DATE', 50, currentY + 6, { width: 80 });
//             doc.text('CHANGED BY', 130, currentY + 6, { width: 120 });
//             doc.text('FIELD', 250, currentY + 6, { width: 80 });
//             doc.text('FROM', 330, currentY + 6, { width: 100 });
//             doc.text('TO', 440, currentY + 6, { width: 100 });
//             currentY += 20;

//             // History rows
//             for (let i = 0; i < history.length && i < 5; i++) {
//                 const entry = history[i];
//                 const user = typeof entry.changedByUserId === 'object'
//                     ? (entry.changedByUserId as any).email
//                     : 'Unknown';

//                 const rowHeight = 22 * entry.changes.length;
//                 const isAlt = i % 2 === 1;

//                 if (isAlt) {
//                     doc.roundedRect(40, currentY, 515, rowHeight, 0).fill(COLORS.background);
//                 }

//                 for (let j = 0; j < entry.changes.length; j++) {
//                     const change = entry.changes[j];
//                     const rowY = currentY + (j * 22);

//                     let oldVal: string;
//                     let newVal: string;
//                     let fieldLabel: string;

//                     if (change.field === 'dueDate') {
//                         oldVal = this.formatDate(new Date(change.oldValue as Date));
//                         newVal = this.formatDate(new Date(change.newValue as Date));
//                         fieldLabel = 'Due Date';
//                     } else {
//                         oldVal = this.formatCurrency(change.oldValue as number);
//                         newVal = this.formatCurrency(change.newValue as number);
//                         fieldLabel = 'Interest';
//                     }

//                     doc.fontSize(8).font('Helvetica').fillColor(COLORS.text);

//                     if (j === 0) {
//                         doc.text(this.formatDate(entry.changedAt), 50, rowY + 7, { width: 80 });
//                         const truncatedUser = user.length > 18 ? user.substring(0, 18) + '...' : user;
//                         doc.text(truncatedUser, 130, rowY + 7, { width: 120 });
//                     }

//                     doc.text(fieldLabel, 250, rowY + 7, { width: 80 });
//                     doc.fillColor(COLORS.danger).text(oldVal, 330, rowY + 7, { width: 100 });
//                     doc.fillColor(COLORS.success).text(newVal, 440, rowY + 7, { width: 100 });
//                 }

//                 currentY += rowHeight;
//             }

//             // Table bottom border
//             this.drawLine(doc, currentY, 40, 555, COLORS.border);
//         } else {
//             doc.roundedRect(40, currentY, 515, 30, 6).fill(COLORS.background);
//             doc.fontSize(9).font('Helvetica').fillColor(COLORS.textMuted)
//                 .text('No changes have been made to this loan.', 40, currentY + 10, { width: 515, align: 'center' });
//             currentY += 35;
//         }

//         currentY += 15;

//         // ==================== SUMMARY BOX ====================
//         doc.roundedRect(40, currentY, 515, 65, 8).lineWidth(2).strokeColor(COLORS.primary).stroke();

//         // Summary title
//         doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.primary)
//             .text('LOAN SUMMARY', 40, currentY + 10, { width: 515, align: 'center' });

//         const summaryY = currentY + 30;

//         // Left column
//         doc.fontSize(9).font('Helvetica').fillColor(COLORS.textLight);
//         doc.text('Principal:', 60, summaryY);
//         doc.text('Interest:', 60, summaryY + 14);

//         doc.font('Helvetica-Bold').fillColor(COLORS.text);
//         doc.text(this.formatCurrency(loan.actualAmount), 130, summaryY);
//         doc.text(this.formatCurrency(loan.interestAmount), 130, summaryY + 14);

//         // Middle column
//         doc.font('Helvetica').fillColor(COLORS.textLight);
//         doc.text('Duration:', 240, summaryY);
//         doc.text('Status:', 240, summaryY + 14);

//         doc.font('Helvetica-Bold').fillColor(COLORS.text);
//         doc.text(`${duration} days`, 310, summaryY);
//         this.drawStatusBadge(doc, loan.status, 310, summaryY + 11, 60, 15);

//         // Right column - Total (highlighted)
//         doc.roundedRect(410, currentY + 18, 130, 40, 4).fill(COLORS.successLight);
//         doc.fontSize(8).font('Helvetica').fillColor(COLORS.success).text('TOTAL AMOUNT', 410, currentY + 25, { width: 130, align: 'center' });
//         doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.success)
//             .text(this.formatCurrency(totalAmount), 410, currentY + 38, { width: 130, align: 'center' });

//         // ==================== FOOTER ====================
//         this.drawLine(doc, 800, 40, 555, COLORS.border);

//         doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted);
//         doc.text('Loan Tracker - Professional Loan Management', 40, 808);
//         doc.text('Page 1 of 1', 490, 808, { width: 65, align: 'right' });

//         doc.end();
//     }
// }











import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { Loan, LoanHistory, ILoan } from '../models';
import { Types } from 'mongoose';
import { LoanStatus } from '../types';
import { AppError } from '../middleware/errorHandler.middleware';

interface ExportFilters {
    userId?: string;
    status?: LoanStatus;
}

// Color palette for professional look
const COLORS = {
    primary: '#2563eb',
    primaryDark: '#1e40af',
    primaryLight: '#dbeafe',
    secondary: '#64748b',
    success: '#16a34a',
    successLight: '#dcfce7',
    warning: '#ca8a04',
    warningLight: '#fef9c3',
    danger: '#dc2626',
    dangerLight: '#fee2e2',
    text: '#1f2937',
    textLight: '#6b7280',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    background: '#f8fafc',
    white: '#ffffff',
};

export class ExportService {
    /**
     * Get loans for export
     */
    static async getLoansForExport(filters: ExportFilters): Promise<ILoan[]> {
        const query: any = {};

        if (filters.userId) {
            query.ownerUserId = new Types.ObjectId(filters.userId);
        }

        if (filters.status) {
            query.status = filters.status;
        }

        return Loan.find(query)
            .populate('ownerUserId', 'email')
            .sort({ createdAt: -1 });
    }

    /**
     * Generate CSV content
     */
    static generateCSV(loans: ILoan[]): string {
        const headers = [
            'S.No',
            'Borrower Name',
            'Principal Amount (INR)',
            'Interest Amount (INR)',
            'Total Amount (INR)',
            'Given Date',
            'Due Date',
            'Status',
            'Notes',
            'Created At',
        ];

        const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

        const rows = loans.map((loan, index) => [
            (index + 1).toString(),
            escapeCsv(loan.borrowerName),
            loan.actualAmount.toString(),
            loan.interestAmount.toString(),
            (loan.actualAmount + loan.interestAmount).toString(),
            loan.givenDate.toISOString().split('T')[0],
            loan.dueDate.toISOString().split('T')[0],
            loan.status,
            escapeCsv(loan.notes || ''),
            loan.createdAt.toISOString().split('T')[0],
        ]);

        return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    }

    /**
     * Format currency in Indian format
     */
    private static formatCurrency(amount: number): string {
        return `₹${amount.toLocaleString('en-IN')}`;
    }

    /**
     * Format date in Indian format
     */
    private static formatDate(date: Date): string {
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    /**
     * Get status color
     */
    private static getStatusColor(status: string): string {
        switch (status) {
            case 'ACTIVE':
                return COLORS.primary;
            case 'OVERDUE':
                return COLORS.danger;
            case 'COMPLETED':
                return COLORS.success;
            default:
                return COLORS.secondary;
        }
    }

    /**
     * Get status background color
     */
    private static getStatusBgColor(status: string): string {
        switch (status) {
            case 'ACTIVE':
                return COLORS.primaryLight;
            case 'OVERDUE':
                return COLORS.dangerLight;
            case 'COMPLETED':
                return COLORS.successLight;
            default:
                return COLORS.borderLight;
        }
    }

    /**
     * Draw horizontal line
     */
    private static drawLine(
        doc: PDFKit.PDFDocument,
        y: number,
        startX: number = 50,
        endX: number = 545,
        color: string = COLORS.border,
        lineWidth: number = 1
    ): void {
        doc
            .strokeColor(color)
            .lineWidth(lineWidth)
            .moveTo(startX, y)
            .lineTo(endX, y)
            .stroke();
    }

    /**
     * Draw status badge - FIXED: Added lineBreak: false
     */
    private static drawStatusBadge(
        doc: PDFKit.PDFDocument,
        status: string,
        x: number,
        y: number,
        width: number = 70,
        height: number = 18
    ): void {
        const bgColor = this.getStatusBgColor(status);
        const textColor = this.getStatusColor(status);

        doc
            .roundedRect(x, y, width, height, 4)
            .fill(bgColor);

        doc
            .fontSize(8)
            .font('Helvetica-Bold')
            .fillColor(textColor)
            .text(status, x, y + 5, {
                width: width,
                align: 'center',
                lineBreak: false,  // FIX: Prevent page break
            });
    }

    /**
     * Draw compact summary card - FIXED: Added lineBreak: false
     */
    private static drawCompactCard(
        doc: PDFKit.PDFDocument,
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        value: string,
        accentColor: string = COLORS.primary
    ): void {
        // Card background
        doc
            .roundedRect(x, y, width, height, 4)
            .fill(COLORS.background);

        // Left accent bar
        doc
            .rect(x, y, 3, height)
            .fill(accentColor);

        // Label - FIX: Added lineBreak: false
        doc
            .fontSize(7)
            .font('Helvetica')
            .fillColor(COLORS.textMuted)
            .text(label.toUpperCase(), x + 10, y + 8, {
                width: width - 15,
                lineBreak: false
            });

        // Value - FIX: Added lineBreak: false
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .fillColor(COLORS.text)
            .text(value, x + 10, y + 22, {
                width: width - 15,
                lineBreak: false
            });
    }

    /**
     * Draw info row - FIXED: Added lineBreak: false
     */
    private static drawInfoRow(
        doc: PDFKit.PDFDocument,
        x: number,
        y: number,
        label: string,
        value: string,
        labelWidth: number = 100,
        valueColor: string = COLORS.text
    ): void {
        doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor(COLORS.textLight)
            .text(label, x, y, {
                width: labelWidth,
                lineBreak: false
            });

        doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .fillColor(valueColor)
            .text(value, x + labelWidth, y, {
                lineBreak: false
            });
    }

    /**
     * Generate multi-loan PDF report - FIXED: Added lineBreak: false throughout
     */
    static async generatePDF(loans: ILoan[], res: Response): Promise<void> {
        const doc = new PDFDocument({
            margin: 40,
            size: 'A4',
            bufferPages: true,
            autoFirstPage: true,  // FIX: Explicit first page control
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=loans_report_${Date.now()}.pdf`
        );

        doc.pipe(res);

        // Calculate statistics
        const totalLoans = loans.length;
        const activeLoans = loans.filter((l) => l.status === 'ACTIVE').length;
        const overdueLoans = loans.filter((l) => l.status === 'OVERDUE').length;
        const completedLoans = loans.filter((l) => l.status === 'COMPLETED').length;
        const totalPrincipal = loans.reduce((sum, l) => sum + l.actualAmount, 0);
        const totalInterest = loans.reduce((sum, l) => sum + l.interestAmount, 0);
        const grandTotal = totalPrincipal + totalInterest;

        // ==================== HEADER ====================
        doc.rect(0, 0, 595, 70).fill(COLORS.primary);

        // Logo
        doc.circle(55, 35, 18).fill(COLORS.white);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.primary)
            .text('LT', 47, 28, { lineBreak: false });

        // Title
        doc.fontSize(20).font('Helvetica-Bold').fillColor(COLORS.white)
            .text('LOAN TRACKER', 85, 20, { lineBreak: false });
        doc.fontSize(10).font('Helvetica').fillColor(COLORS.white)
            .text('Loans Report', 85, 45, { lineBreak: false });

        // Date
        doc.fontSize(9).font('Helvetica').fillColor(COLORS.white)
            .text(`Generated: ${this.formatDate(new Date())}`, 400, 28, {
                width: 150,
                align: 'right',
                lineBreak: false
            });
        doc.text(`Total: ${totalLoans} loans`, 400, 42, {
            width: 150,
            align: 'right',
            lineBreak: false
        });

        let currentY = 85;

        // ==================== SUMMARY SECTION ====================
        doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text)
            .text('Summary', 40, currentY, { lineBreak: false });
        currentY += 18;

        // Summary cards row
        const cardWidth = 82;
        const cardHeight = 42;
        const cardGap = 8;

        this.drawCompactCard(doc, 40, currentY, cardWidth, cardHeight, 'Total Loans', totalLoans.toString(), COLORS.primary);
        this.drawCompactCard(doc, 40 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 'Active', activeLoans.toString(), COLORS.primary);
        this.drawCompactCard(doc, 40 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 'Overdue', overdueLoans.toString(), COLORS.danger);
        this.drawCompactCard(doc, 40 + (cardWidth + cardGap) * 3, currentY, cardWidth, cardHeight, 'Completed', completedLoans.toString(), COLORS.success);

        // Amount cards
        const amountCardWidth = 125;
        this.drawCompactCard(doc, 40 + (cardWidth + cardGap) * 4, currentY, amountCardWidth, cardHeight, 'Grand Total', this.formatCurrency(grandTotal), COLORS.success);

        currentY += cardHeight + 15;

        // ==================== LOANS TABLE ====================
        doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text)
            .text('Loan Details', 40, currentY, { lineBreak: false });
        currentY += 15;

        // Table header
        doc.rect(40, currentY, 515, 22).fill(COLORS.primaryDark);

        doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.white);
        doc.text('#', 45, currentY + 7, { width: 20, lineBreak: false });
        doc.text('BORROWER', 65, currentY + 7, { width: 110, lineBreak: false });
        doc.text('PRINCIPAL', 175, currentY + 7, { width: 70, align: 'right', lineBreak: false });
        doc.text('INTEREST', 250, currentY + 7, { width: 60, align: 'right', lineBreak: false });
        doc.text('TOTAL', 315, currentY + 7, { width: 70, align: 'right', lineBreak: false });
        doc.text('GIVEN', 390, currentY + 7, { width: 55, align: 'center', lineBreak: false });
        doc.text('DUE', 445, currentY + 7, { width: 55, align: 'center', lineBreak: false });
        doc.text('STATUS', 500, currentY + 7, { width: 50, align: 'center', lineBreak: false });

        currentY += 22;

        // Table rows
        for (let i = 0; i < loans.length; i++) {
            const loan = loans[i];

            // Check for new page - FIX: Reduced threshold to leave room for footer
            if (currentY > 750) {
                doc.addPage();
                currentY = 40;

                // Redraw table header
                doc.rect(40, currentY, 515, 22).fill(COLORS.primaryDark);
                doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.white);
                doc.text('#', 45, currentY + 7, { width: 20, lineBreak: false });
                doc.text('BORROWER', 65, currentY + 7, { width: 110, lineBreak: false });
                doc.text('PRINCIPAL', 175, currentY + 7, { width: 70, align: 'right', lineBreak: false });
                doc.text('INTEREST', 250, currentY + 7, { width: 60, align: 'right', lineBreak: false });
                doc.text('TOTAL', 315, currentY + 7, { width: 70, align: 'right', lineBreak: false });
                doc.text('GIVEN', 390, currentY + 7, { width: 55, align: 'center', lineBreak: false });
                doc.text('DUE', 445, currentY + 7, { width: 55, align: 'center', lineBreak: false });
                doc.text('STATUS', 500, currentY + 7, { width: 50, align: 'center', lineBreak: false });
                currentY += 22;
            }

            const rowHeight = 24;
            const isAlternate = i % 2 === 1;

            if (isAlternate) {
                doc.rect(40, currentY, 515, rowHeight).fill(COLORS.background);
            }

            doc.fontSize(8).font('Helvetica').fillColor(COLORS.text);
            doc.text((i + 1).toString(), 45, currentY + 8, { width: 20, lineBreak: false });

            // Truncate borrower name
            const borrowerName = loan.borrowerName.length > 18
                ? loan.borrowerName.substring(0, 18) + '...'
                : loan.borrowerName;
            doc.font('Helvetica-Bold').text(borrowerName, 65, currentY + 8, {
                width: 110,
                lineBreak: false
            });

            doc.font('Helvetica');
            doc.text(this.formatCurrency(loan.actualAmount), 175, currentY + 8, {
                width: 70,
                align: 'right',
                lineBreak: false
            });
            doc.text(this.formatCurrency(loan.interestAmount), 250, currentY + 8, {
                width: 60,
                align: 'right',
                lineBreak: false
            });
            doc.font('Helvetica-Bold').fillColor(COLORS.primary)
                .text(this.formatCurrency(loan.actualAmount + loan.interestAmount), 315, currentY + 8, {
                    width: 70,
                    align: 'right',
                    lineBreak: false
                });

            doc.font('Helvetica').fillColor(COLORS.text);
            doc.text(this.formatDate(loan.givenDate), 390, currentY + 8, {
                width: 55,
                align: 'center',
                lineBreak: false
            });

            const isOverdue = loan.dueDate < new Date() && loan.status !== 'COMPLETED';
            doc.fillColor(isOverdue ? COLORS.danger : COLORS.text);
            doc.text(this.formatDate(loan.dueDate), 445, currentY + 8, {
                width: 55,
                align: 'center',
                lineBreak: false
            });

            // Status badge
            this.drawStatusBadge(doc, loan.status, 497, currentY + 4, 55, 16);

            currentY += rowHeight;
        }

        // Table bottom border
        this.drawLine(doc, currentY, 40, 555, COLORS.border);

        // ==================== FOOTER ON ALL PAGES - FIXED ====================
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);

            // Footer line
            this.drawLine(doc, 810, 40, 555, COLORS.border);

            // Footer text - FIX: Added lineBreak: false to prevent extra pages
            doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted);
            doc.text('Loan Tracker - Professional Loan Management', 40, 818, {
                lineBreak: false
            });
            doc.text(`Page ${i + 1} of ${pages.count}`, 480, 818, {
                width: 75,
                align: 'right',
                lineBreak: false
            });
        }

        doc.end();
    }

    /**
     * Generate single loan PDF - FIXED: Added lineBreak: false throughout
     */
    static async generateLoanDetailPDF(
        loanId: string,
        userId: string | null,
        res: Response
    ): Promise<void> {
        const query: any = { _id: new Types.ObjectId(loanId) };
        if (userId) {
            query.ownerUserId = new Types.ObjectId(userId);
        }

        const loan = await Loan.findOne(query).populate('ownerUserId', 'email');

        if (!loan) {
            throw new AppError('Loan not found', 404);
        }

        const history = await LoanHistory.find({ loanId: new Types.ObjectId(loanId) })
            .sort({ changedAt: -1 })
            .limit(5)
            .populate('changedByUserId', 'email');

        const doc = new PDFDocument({
            margin: 40,
            size: 'A4',
            autoFirstPage: true,  // FIX: Explicit control
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=loan_${loan.borrowerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`
        );

        doc.pipe(res);

        const ownerEmail = loan.ownerUserId && typeof loan.ownerUserId === 'object'
            ? (loan.ownerUserId as any).email
            : null;

        const totalAmount = loan.actualAmount + loan.interestAmount;
        const isOverdue = loan.dueDate < new Date() && loan.status !== 'COMPLETED';
        const duration = Math.ceil((loan.dueDate.getTime() - loan.givenDate.getTime()) / (1000 * 60 * 60 * 24));

        // ==================== HEADER (Compact) ====================
        doc.rect(0, 0, 595, 60).fill(COLORS.primary);

        // Logo
        doc.circle(50, 30, 15).fill(COLORS.white);
        doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.primary)
            .text('LT', 43, 24, { lineBreak: false });

        // Title
        doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.white)
            .text('LOAN STATEMENT', 75, 18, { lineBreak: false });
        doc.fontSize(9).font('Helvetica').fillColor(COLORS.white)
            .text(`Generated: ${this.formatDate(new Date())}`, 75, 38, { lineBreak: false });

        // Loan ID on right
        doc.fontSize(8).fillColor(COLORS.white)
            .text(`ID: ${loan._id.toString().slice(-8).toUpperCase()}`, 400, 25, {
                width: 150,
                align: 'right',
                lineBreak: false
            });

        if (ownerEmail) {
            doc.text(`Owner: ${ownerEmail}`, 400, 38, {
                width: 150,
                align: 'right',
                lineBreak: false
            });
        }

        let currentY = 75;

        // ==================== BORROWER SECTION ====================
        doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight)
            .text('BORROWER', 40, currentY, { lineBreak: false });
        currentY += 15;

        // Borrower card
        doc.roundedRect(40, currentY, 515, 50, 6).fill(COLORS.background);

        // Avatar
        doc.circle(70, currentY + 25, 18).fill(COLORS.primary);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.white)
            .text(loan.borrowerName.charAt(0).toUpperCase(), 63, currentY + 18, { lineBreak: false });

        // Name and status
        doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.text)
            .text(loan.borrowerName, 100, currentY + 12, { width: 300, lineBreak: false });

        this.drawStatusBadge(doc, loan.status, 100, currentY + 32, 65, 16);

        // Created date on right
        doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted)
            .text(`Created: ${this.formatDate(loan.createdAt)}`, 400, currentY + 20, {
                width: 145,
                align: 'right',
                lineBreak: false
            });

        currentY += 60;

        // ==================== AMOUNT SECTION ====================
        doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight)
            .text('AMOUNT DETAILS', 40, currentY, { lineBreak: false });
        currentY += 15;

        // Amount cards
        const amtCardWidth = 165;
        const amtCardHeight = 50;
        const amtCardGap = 10;

        this.drawCompactCard(doc, 40, currentY, amtCardWidth, amtCardHeight, 'Principal Amount', this.formatCurrency(loan.actualAmount), COLORS.primary);
        this.drawCompactCard(doc, 40 + amtCardWidth + amtCardGap, currentY, amtCardWidth, amtCardHeight, 'Interest Amount', this.formatCurrency(loan.interestAmount), COLORS.warning);
        this.drawCompactCard(doc, 40 + (amtCardWidth + amtCardGap) * 2, currentY, amtCardWidth, amtCardHeight, 'Total Amount', this.formatCurrency(totalAmount), COLORS.success);

        currentY += amtCardHeight + 15;

        // ==================== DATE SECTION ====================
        doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight)
            .text('TIMELINE', 40, currentY, { lineBreak: false });
        currentY += 15;

        // Date box
        doc.roundedRect(40, currentY, 515, 45, 6).fill(COLORS.background);

        // Given Date
        doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted)
            .text('GIVEN DATE', 55, currentY + 10, { lineBreak: false });
        doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text)
            .text(this.formatDate(loan.givenDate), 55, currentY + 24, { lineBreak: false });

        // Arrow
        doc.fontSize(14).fillColor(COLORS.textMuted)
            .text('→', 175, currentY + 18, { lineBreak: false });

        // Due Date
        doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted)
            .text('DUE DATE', 210, currentY + 10, { lineBreak: false });
        doc.fontSize(11).font('Helvetica-Bold').fillColor(isOverdue ? COLORS.danger : COLORS.text)
            .text(this.formatDate(loan.dueDate), 210, currentY + 24, { lineBreak: false });

        // Duration
        doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted)
            .text('DURATION', 340, currentY + 10, { lineBreak: false });
        doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text)
            .text(`${duration} days`, 340, currentY + 24, { lineBreak: false });

        // Days remaining/overdue
        const today = new Date();
        const daysRemaining = Math.ceil((loan.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted)
            .text('STATUS', 450, currentY + 10, { lineBreak: false });
        if (loan.status === 'COMPLETED') {
            doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.success)
                .text('Completed', 450, currentY + 24, { lineBreak: false });
        } else if (daysRemaining < 0) {
            doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.danger)
                .text(`${Math.abs(daysRemaining)}d overdue`, 450, currentY + 24, { lineBreak: false });
        } else if (daysRemaining === 0) {
            doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.warning)
                .text('Due today', 450, currentY + 24, { lineBreak: false });
        } else {
            doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.success)
                .text(`${daysRemaining}d left`, 450, currentY + 24, { lineBreak: false });
        }

        currentY += 55;

        // ==================== NOTES SECTION (Compact) ====================
        if (loan.notes && loan.notes.trim()) {
            doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight)
                .text('NOTES', 40, currentY, { lineBreak: false });
            currentY += 15;

            // Truncate notes if too long
            const maxNoteLength = 200;
            const displayNotes = loan.notes.length > maxNoteLength
                ? loan.notes.substring(0, maxNoteLength) + '...'
                : loan.notes;

            doc.roundedRect(40, currentY, 515, 40, 6).fill(COLORS.background);
            doc.fontSize(9).font('Helvetica').fillColor(COLORS.text)
                .text(displayNotes, 50, currentY + 12, {
                    width: 495,
                    height: 25,
                    lineBreak: false
                });

            currentY += 50;
        }

        // ==================== CHANGE HISTORY (Compact) ====================
        doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight)
            .text('CHANGE HISTORY', 40, currentY, { lineBreak: false });

        if (history.length > 5) {
            doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted)
                .text(`(Showing latest 5 of ${history.length})`, 150, currentY + 2, { lineBreak: false });
        }

        currentY += 15;

        if (history.length > 0) {
            // History table header
            doc.roundedRect(40, currentY, 515, 20, 4).fill(COLORS.primaryDark);
            doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.white);
            doc.text('DATE', 50, currentY + 6, { width: 80, lineBreak: false });
            doc.text('CHANGED BY', 130, currentY + 6, { width: 120, lineBreak: false });
            doc.text('FIELD', 250, currentY + 6, { width: 80, lineBreak: false });
            doc.text('FROM', 330, currentY + 6, { width: 100, lineBreak: false });
            doc.text('TO', 440, currentY + 6, { width: 100, lineBreak: false });
            currentY += 20;

            // History rows
            for (let i = 0; i < history.length && i < 5; i++) {
                const entry = history[i];
                const user = typeof entry.changedByUserId === 'object'
                    ? (entry.changedByUserId as any).email
                    : 'Unknown';

                const rowHeight = 22 * entry.changes.length;
                const isAlt = i % 2 === 1;

                if (isAlt) {
                    doc.roundedRect(40, currentY, 515, rowHeight, 0).fill(COLORS.background);
                }

                for (let j = 0; j < entry.changes.length; j++) {
                    const change = entry.changes[j];
                    const rowY = currentY + (j * 22);

                    let oldVal: string;
                    let newVal: string;
                    let fieldLabel: string;

                    if (change.field === 'dueDate') {
                        oldVal = this.formatDate(new Date(change.oldValue as Date));
                        newVal = this.formatDate(new Date(change.newValue as Date));
                        fieldLabel = 'Due Date';
                    } else {
                        oldVal = this.formatCurrency(change.oldValue as number);
                        newVal = this.formatCurrency(change.newValue as number);
                        fieldLabel = 'Interest';
                    }

                    doc.fontSize(8).font('Helvetica').fillColor(COLORS.text);

                    if (j === 0) {
                        doc.text(this.formatDate(entry.changedAt), 50, rowY + 7, {
                            width: 80,
                            lineBreak: false
                        });
                        const truncatedUser = user.length > 18 ? user.substring(0, 18) + '...' : user;
                        doc.text(truncatedUser, 130, rowY + 7, {
                            width: 120,
                            lineBreak: false
                        });
                    }

                    doc.text(fieldLabel, 250, rowY + 7, { width: 80, lineBreak: false });
                    doc.fillColor(COLORS.danger).text(oldVal, 330, rowY + 7, {
                        width: 100,
                        lineBreak: false
                    });
                    doc.fillColor(COLORS.success).text(newVal, 440, rowY + 7, {
                        width: 100,
                        lineBreak: false
                    });
                }

                currentY += rowHeight;
            }

            // Table bottom border
            this.drawLine(doc, currentY, 40, 555, COLORS.border);
        } else {
            doc.roundedRect(40, currentY, 515, 30, 6).fill(COLORS.background);
            doc.fontSize(9).font('Helvetica').fillColor(COLORS.textMuted)
                .text('No changes have been made to this loan.', 40, currentY + 10, {
                    width: 515,
                    align: 'center',
                    lineBreak: false
                });
            currentY += 35;
        }

        currentY += 15;

        // ==================== SUMMARY BOX ====================
        doc.roundedRect(40, currentY, 515, 65, 8).lineWidth(2).strokeColor(COLORS.primary).stroke();

        // Summary title
        doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.primary)
            .text('LOAN SUMMARY', 40, currentY + 10, {
                width: 515,
                align: 'center',
                lineBreak: false
            });

        const summaryY = currentY + 30;

        // Left column
        doc.fontSize(9).font('Helvetica').fillColor(COLORS.textLight);
        doc.text('Principal:', 60, summaryY, { lineBreak: false });
        doc.text('Interest:', 60, summaryY + 14, { lineBreak: false });

        doc.font('Helvetica-Bold').fillColor(COLORS.text);
        doc.text(this.formatCurrency(loan.actualAmount), 130, summaryY, { lineBreak: false });
        doc.text(this.formatCurrency(loan.interestAmount), 130, summaryY + 14, { lineBreak: false });

        // Middle column
        doc.font('Helvetica').fillColor(COLORS.textLight);
        doc.text('Duration:', 240, summaryY, { lineBreak: false });
        doc.text('Status:', 240, summaryY + 14, { lineBreak: false });

        doc.font('Helvetica-Bold').fillColor(COLORS.text);
        doc.text(`${duration} days`, 310, summaryY, { lineBreak: false });
        this.drawStatusBadge(doc, loan.status, 310, summaryY + 11, 60, 15);

        // Right column - Total (highlighted)
        doc.roundedRect(410, currentY + 18, 130, 40, 4).fill(COLORS.successLight);
        doc.fontSize(8).font('Helvetica').fillColor(COLORS.success)
            .text('TOTAL AMOUNT', 410, currentY + 25, {
                width: 130,
                align: 'center',
                lineBreak: false
            });
        doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.success)
            .text(this.formatCurrency(totalAmount), 410, currentY + 38, {
                width: 130,
                align: 'center',
                lineBreak: false
            });

        // ==================== FOOTER - FIXED ====================
        this.drawLine(doc, 800, 40, 555, COLORS.border);

        doc.fontSize(8).font('Helvetica').fillColor(COLORS.textMuted);
        doc.text('Loan Tracker - Professional Loan Management', 40, 808, { lineBreak: false });
        doc.text('Page 1 of 1', 490, 808, { width: 65, align: 'right', lineBreak: false });

        doc.end();
    }
}