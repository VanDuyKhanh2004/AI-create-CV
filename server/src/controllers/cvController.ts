import { Request, Response } from 'express';
import CV from '../models/CV';

export const createCV = async (req: Request, res: Response) => {
  try {
    const newCV = new CV(req.body);
    const savedCV = await newCV.save();
    res.status(201).json(savedCV);
  } catch (error) {
    res.status(500).json({ error: 'Error creating CV' });
  }
};

export const getCV = async (req: Request, res: Response) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(cv);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching CV' });
  }
};

export const updateCV = async (req: Request, res: Response) => {
  try {
    const updatedCV = await CV.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedCV) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(updatedCV);
  } catch (error) {
    res.status(500).json({ error: 'Error updating CV' });
  }
};

export const deleteCV = async (req: Request, res: Response) => {
  try {
    const deletedCV = await CV.findByIdAndDelete(req.params.id);
    if (!deletedCV) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json({ message: 'CV deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting CV' });
  }
};

export const getAllCVs = async (req: Request, res: Response) => {
  try {
    const cvs = await CV.find().sort({ updatedAt: -1 });
    res.json(cvs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching CVs' });
  }
};

export const downloadCVPdf = async (req: Request, res: Response) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // Dynamically require PDFKit to avoid type issues if types are not installed
    // @ts-ignore
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers for download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="cv-${cv._id}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Simple styling and layout
    const pInfo: any = cv.personalInfo || {};

    doc.fontSize(20).text(pInfo.fullName || 'Unnamed', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor('gray').text([pInfo.email, pInfo.phone, pInfo.address].filter(Boolean).join(' | '), {
      align: 'center'
    });

    doc.moveDown();

    if (cv.summary) {
      doc.fillColor('black').fontSize(14).text('Summary');
      doc.moveDown(0.2);
      doc.fontSize(11).text(cv.summary);
      doc.moveDown();
    }

    if (cv.experience && cv.experience.length) {
      doc.fontSize(14).text('Experience');
      doc.moveDown(0.2);
      cv.experience.forEach((exp: any) => {
        doc.fontSize(12).text(`${exp.position || ''} - ${exp.company || ''}`);
        if (exp.startDate || exp.endDate) {
          doc.fontSize(10).fillColor('gray').text(`${exp.startDate || ''} - ${exp.endDate || ''}`);
        }
        if (exp.description) {
          doc.moveDown(0.1);
          doc.fontSize(11).fillColor('black').text(exp.description);
        }
        doc.moveDown();
      });
    }

    if (cv.education && cv.education.length) {
      doc.fontSize(14).text('Education');
      doc.moveDown(0.2);
      cv.education.forEach((edu: any) => {
        doc.fontSize(12).text(`${edu.degree || ''} - ${edu.school || ''}`);
        if (edu.startDate || edu.endDate) {
          doc.fontSize(10).fillColor('gray').text(`${edu.startDate || ''} - ${edu.endDate || ''}`);
        }
        if (edu.description) {
          doc.moveDown(0.1);
          doc.fontSize(11).fillColor('black').text(edu.description);
        }
        doc.moveDown();
      });
    }

    if (cv.skills && cv.skills.length) {
      doc.fontSize(14).text('Skills');
      doc.moveDown(0.2);
      doc.fontSize(11).text((cv.skills as string[]).join(', '));
      doc.moveDown();
    }

    if (cv.projects && cv.projects.length) {
      doc.fontSize(14).text('Projects');
      doc.moveDown(0.2);
      cv.projects.forEach((proj: any) => {
        doc.fontSize(12).text(`${proj.name || ''}`);
        if (proj.description) doc.fontSize(11).fillColor('black').text(proj.description);
        doc.moveDown();
      });
    }

    // Finalize PDF and end stream
    doc.end();
  } catch (error: any) {
    res.status(500).json({ error: 'Error generating PDF', details: error.message });
  }
};