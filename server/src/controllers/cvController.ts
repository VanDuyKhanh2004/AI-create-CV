import { Request, Response } from 'express';
import CV from '../models/CV';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createCV = async (req: AuthRequest, res: Response) => {
  try {
    // ensure authenticated user exists
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const newCV = new CV({ ...req.body, owner: user._id });
    const savedCV = await newCV.save();

    // add CV reference to user
    await User.findByIdAndUpdate(user._id, { $push: { cvs: savedCV._id } });

    res.status(201).json(savedCV);
  } catch (error) {
    res.status(500).json({ error: 'Error creating CV' });
  }
};

export const getCV = async (req: AuthRequest, res: Response) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // allow if owner or admin
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (cv.owner.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(cv);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching CV' });
  }
};

export const updateCV = async (req: AuthRequest, res: Response) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) return res.status(404).json({ error: 'CV not found' });

    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (cv.owner.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    Object.assign(cv, { ...req.body, updatedAt: new Date() });
    const updatedCV = await cv.save();
    res.json(updatedCV);
  } catch (error) {
    res.status(500).json({ error: 'Error updating CV' });
  }
};

export const deleteCV = async (req: AuthRequest, res: Response) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) return res.status(404).json({ error: 'CV not found' });

    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (cv.owner.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await CV.findByIdAndDelete(req.params.id);
    // remove reference from user
    await User.findByIdAndUpdate(cv.owner, { $pull: { cvs: cv._id } });

    res.json({ message: 'CV deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting CV' });
  }
};

export const getAllCVs = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Admin can see all CVs
    if (user.role === 'admin') {
      const cvs = await CV.find().sort({ updatedAt: -1 });
      return res.json(cvs);
    }

    // Regular users only see their own CVs
    const cvs = await CV.find({ owner: user._id }).sort({ updatedAt: -1 });
    res.json(cvs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching CVs' });
  }
};

export const downloadCVPdf = async (req: Request, res: Response) => {
  try {
    const reqAuth = req as AuthRequest;
    const user = reqAuth.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    if (cv.owner.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Dynamically require PDFKit to avoid type issues if types are not installed
    // @ts-ignore
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

    // Set response headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cv-${cv._id}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Improved professional layout
    const cvAny: any = cv;
    const pInfo: any = cvAny.personalInfo || {};

    const pageWidth = doc.page.width;
    const pageMargin = 50;
    const leftColWidth = 150;
    const gap = 20;
    const rightColX = pageMargin + leftColWidth + gap;
    const rightColWidth = pageWidth - pageMargin - rightColX;

    // Header (name + contact)
    doc.fillColor('#333333').font('Helvetica-Bold').fontSize(22).text(pInfo.fullName || 'Unnamed', pageMargin, 60, { continued: false });
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(10).fillColor('gray').text([pInfo.email, pInfo.phone, pInfo.address].filter(Boolean).join(' | '), { align: 'left' });

    // Draw a subtle line under header
    doc.moveTo(pageMargin, 110).lineTo(pageWidth - pageMargin, 110).lineWidth(0.5).strokeColor('#CCCCCC').stroke();

    // Left column: contact, skills, languages
    let y = 120;
    const leftX = pageMargin;

    function renderSectionTitle(x: number, yPos: number, title: string) {
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#0B5FFF').text(title.toUpperCase(), x, yPos);
      return yPos + 16;
    }

    // Contact card
    y = renderSectionTitle(leftX, y, 'Contact');
    doc.font('Helvetica').fontSize(10).fillColor('#333333').text(pInfo.email || '', leftX, y, { width: leftColWidth });
    y += 14;
    if (pInfo.phone) { doc.text(pInfo.phone, leftX, y, { width: leftColWidth }); y += 14; }
    if (pInfo.address) { doc.text(pInfo.address, leftX, y, { width: leftColWidth }); y += 14; }
    y += 8;

    // Skills
    y = renderSectionTitle(leftX, y, 'Skills');
    try {
      const skillsArr = Array.isArray(cvAny.skills)
        ? cvAny.skills.map((s: any) => {
            if (typeof s === 'string') return s;
            if (s?.skills && Array.isArray(s.skills)) return s.skills.map((it: any) => it.name).filter(Boolean).join(', ');
            return '';
          }).filter(Boolean)
        : [];

      doc.font('Helvetica').fontSize(10).fillColor('#333333').text(skillsArr.join(', '), leftX, y, { width: leftColWidth });
    } catch (e) {
      doc.font('Helvetica').fontSize(10).text('', leftX, y, { width: leftColWidth });
    }

    // Right column: summary, experience, education, projects
    let rx = rightColX;
    let ry = 120;

    if (cvAny.summary) {
      ry = renderSectionTitle(rx, ry, 'Summary');
      doc.font('Helvetica').fontSize(11).fillColor('#333333').text(cvAny.summary, rx, ry, { width: rightColWidth });
      ry += doc.heightOfString(cvAny.summary, { width: rightColWidth }) + 8;
    }

    if (cvAny.experience && cvAny.experience.length) {
      ry = renderSectionTitle(rx, ry, 'Experience');
      cvAny.experience.forEach((exp: any) => {
        const title = `${exp.position || ''} • ${exp.company || ''}`.trim();
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#333333').text(title, rx, ry, { width: rightColWidth });
        ry += 14;
        if (exp.startDate || exp.endDate) {
          doc.font('Helvetica').fontSize(9).fillColor('gray').text(`${exp.startDate || ''} - ${exp.endDate || ''}`, rx, ry, { width: rightColWidth });
          ry += 12;
        }
        if (exp.description) {
          doc.font('Helvetica').fontSize(10).fillColor('#333333').text(exp.description, rx, ry, { width: rightColWidth });
          ry += doc.heightOfString(exp.description, { width: rightColWidth }) + 6;
        } else {
          ry += 6;
        }

        // Add page if near bottom
        if (ry > doc.page.height - 100) {
          doc.addPage();
          ry = pageMargin;
          rx = pageMargin;
        }
      });
    }

    if (cvAny.education && cvAny.education.length) {
      ry = renderSectionTitle(rx, ry, 'Education');
      cvAny.education.forEach((edu: any) => {
        const title = `${edu.degree || ''} • ${edu.school || ''}`.trim();
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#333333').text(title, rx, ry, { width: rightColWidth });
        ry += 14;
        if (edu.description) {
          doc.font('Helvetica').fontSize(10).fillColor('#333333').text(edu.description, rx, ry, { width: rightColWidth });
          ry += doc.heightOfString(edu.description, { width: rightColWidth }) + 6;
        } else {
          ry += 6;
        }
      });
    }

    if (cvAny.projects && cvAny.projects.length) {
      ry = renderSectionTitle(rx, ry, 'Projects');
      cvAny.projects.forEach((proj: any) => {
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#333333').text(proj.name || '', rx, ry, { width: rightColWidth });
        ry += 14;
        if (proj.description) {
          doc.font('Helvetica').fontSize(10).fillColor('#333333').text(proj.description, rx, ry, { width: rightColWidth });
          ry += doc.heightOfString(proj.description, { width: rightColWidth }) + 6;
        } else {
          ry += 6;
        }
      });
    }

    // Footer with page numbers for all pages
    const range = doc.bufferedPageRange(); // => { start: 0, count: 2 }
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const pageNumber = i + 1;
      doc.font('Helvetica').fontSize(9).fillColor('gray').text(`Page ${pageNumber} of ${range.count}`, pageMargin, doc.page.height - 40, { align: 'center', width: doc.page.width - pageMargin * 2 });
    }

    // Finalize PDF and end stream
    doc.end();
  } catch (error: any) {
    res.status(500).json({ error: 'Error generating PDF', details: error.message });
  }
};