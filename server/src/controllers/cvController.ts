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

    // Render an HTML template and convert to PDF using Puppeteer for pixel-perfect styling
    // @ts-ignore
    const puppeteer = require('puppeteer');

    const cvAny: any = cv;
    const pInfo: any = cvAny.personalInfo || {};

    function escapeHtml(str: any) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Build HTML that follows the attached sample: left sidebar (dark green), circular avatar, pill headings, boxed sections
    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { size: A4; margin: 0; }
          body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; margin: 0; color: #222; }
          .page { width: 210mm; min-height: 297mm; box-sizing: border-box; padding: 18mm; background: #f4f6f5; }
          .wrap { background: #fff; display:flex; border-radius: 8px; overflow: hidden; }
          .sidebar { width: 36%; background: #485a4e; color: #fff; padding: 22px; box-sizing: border-box; }
          .main { width: 64%; padding: 22px 26px; box-sizing: border-box; }
          .avatar { width: 120px; height: 120px; border-radius: 60px; object-fit: cover; border: 6px solid rgba(255,255,255,0.12); }
          .name { font-size: 20px; font-weight: 800; margin-top: 12px; }
          .role { font-size: 12px; opacity: 0.95; margin-top: 6px; }
          .muted { color: rgba(0,0,0,0.6); font-size: 12px; }
          .section { margin-bottom: 12px; }
          .pill { display:inline-block; background:#f1f1f1; color:#333; padding:6px 10px; border-radius:18px; font-weight:700; font-size:13px; }
          .box { background: #fff; padding: 10px 12px; margin-top: 8px; border-radius: 6px; border-left: 4px solid rgba(0,0,0,0.04); }
          .skill-chip { display:inline-block; background: rgba(255,255,255,0.12); color:#fff; padding:6px 8px; border-radius:14px; margin:4px 6px 4px 0; font-size:12px; }
          .contact-line { margin-top:8px; font-size:12px; color: #fff; }
          .heading { margin-bottom:6px; }
          .exp-item { margin-bottom:10px; }
          .small-muted { color:#8a8a8a; font-size:11px; }
          .footer { font-size:10px; color:#999; text-align:right; margin-top:8px; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="wrap">
            <div class="sidebar">
              <div style="display:flex; gap:16px; align-items:center;">
                ${pInfo.avatar ? `<img class="avatar" src="${escapeHtml(pInfo.avatar)}"/>` : `<div class="avatar" style="display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.12);font-weight:800;font-size:28px">${escapeHtml((pInfo.fullName||'').split(' ').slice(0,2).map(n=>n[0]).join(''))}</div>`}
                <div>
                  <div class="name">${escapeHtml(pInfo.fullName || 'Unnamed')}</div>
                  <div class="role">${escapeHtml(pInfo.jobTitle || '')}</div>
                </div>
              </div>

              <div class="section">
                <div class="pill">Thông tin</div>
                <div class="box" style="background:transparent;border-left:none;padding-left:0;margin-top:10px">
                  <div class="contact-line">📞 ${escapeHtml(pInfo.phone||'')}</div>
                  <div class="contact-line">✉️ ${escapeHtml(pInfo.email||'')}</div>
                  <div class="contact-line">🏠 ${escapeHtml(pInfo.address||'')}</div>
                  ${cvAny.personalInfo?.birthdate ? `<div class="contact-line">🎂 ${escapeHtml(cvAny.personalInfo.birthdate)}</div>` : ''}
                </div>
              </div>

              <div class="section">
                <div class="pill">Học vấn</div>
                <div class="box" style="background:transparent;border-left:none;padding-left:0;margin-top:10px">
                  ${Array.isArray(cvAny.education) ? cvAny.education.map(ed=>`<div style="margin-bottom:8px"><div style="font-weight:700">${escapeHtml(ed.school||'')}</div><div class="small-muted">${escapeHtml(ed.degree||'')} • ${escapeHtml(ed.fieldOfStudy||'')}</div></div>`).join('') : ''}
                </div>
              </div>

              <div class="section">
                <div class="pill">Kỹ năng</div>
                <div style="margin-top:10px">
                  ${(function(){ try { const skills = Array.isArray(cvAny.skills) ? cvAny.skills : []; return skills.map(s=>{ if (typeof s==='string') return `<span class="skill-chip">${escapeHtml(s)}</span>`; if (s?.skills && Array.isArray(s.skills)) return s.skills.map(it=>`<span class="skill-chip">${escapeHtml(it.name)}</span>`).join(''); return ''}).join(''); } catch(e){return ''} })()}
                </div>
              </div>

              <div style="margin-top:18px">
                <div class="pill">Người giới thiệu</div>
                <div class="box" style="background:transparent;border-left:none;padding-left:0;margin-top:10px">
                  ${escapeHtml(cvAny.referee?.name || '')}<br/>
                  <div class="small-muted">${escapeHtml(cvAny.referee?.title || '')}</div>
                </div>
              </div>

            </div>

            <div class="main">
              <div class="section">
                <div class="pill heading">Mục tiêu nghề nghiệp</div>
                <div class="box">${escapeHtml(cvAny.personalInfo?.summary || cvAny.summary || '')}</div>
              </div>

              <div class="section">
                <div class="pill heading">Kinh nghiệm làm việc</div>
                <div class="box">
                  ${Array.isArray(cvAny.experience) ? cvAny.experience.map(exp=>`<div class="exp-item"><div style="font-weight:700">${escapeHtml(exp.position||'')} — ${escapeHtml(exp.company||'')}</div><div class="small-muted">${escapeHtml(exp.startDate||'')} - ${escapeHtml(exp.endDate||'')}</div><div style="margin-top:6px">${escapeHtml(exp.description||'')}</div></div>`).join('') : ''}
                </div>
              </div>

              <div class="section">
                <div class="pill heading">Danh hiệu & Chứng chỉ</div>
                <div class="box">
                  ${Array.isArray(cvAny.certificates) ? cvAny.certificates.map(c=>`<div style="margin-bottom:6px"><div style="font-weight:700">${escapeHtml(c.name||'')}</div><div class="small-muted">${escapeHtml(c.issuer||'')} • ${escapeHtml(c.issueDate||'')}</div></div>`).join('') : ''}
                </div>
              </div>

              <div class="section">
                <div class="pill heading">Dự án</div>
                <div class="box">
                  ${Array.isArray(cvAny.projects) ? cvAny.projects.map(p=>`<div style="margin-bottom:8px"><div style="font-weight:700">${escapeHtml(p.name||'')}</div><div class="small-muted">${escapeHtml(p.role||'')} • ${escapeHtml(p.startDate||'')} - ${escapeHtml(p.endDate||'')}</div><div style="margin-top:6px">${escapeHtml(p.description||'')}</div></div>`).join('') : ''}
                </div>
              </div>

              <div class="footer">© ${new Date().getFullYear()} • Generated by AI create CV</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Launch puppeteer and render HTML to PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' } });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cv-${cv._id}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: 'Error generating PDF', details: error.message });
  }
};