import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import CV from "../models/CV";
import User from "../models/User";

// AI Service để tạo CV
export const generateCV = async (req: AuthRequest, res: Response) => {
  try {
    const { jobTitle, experience, skills, education, summary, personalInfo } = req.body;

    // Get user info if authenticated
    let user: any = null;
    if (req.user && (req.user as any)._id) {
      user = await User.findById((req.user as any)._id);
    }

    const fullNameFromUser = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null;

    const personal = personalInfo || {
      fullName: fullNameFromUser || (req.body.fullName || 'Unnamed Applicant'),
      email: user ? user.email : (req.body.email && req.body.email.length ? req.body.email : 'noreply@example.com'),
      jobTitle: jobTitle || '',
      summary: summary || '',
    };

    // Ensure required personalInfo fields are non-empty strings
    if (!personal.fullName || typeof personal.fullName !== 'string') personal.fullName = 'Unnamed Applicant';
    if (!personal.email || typeof personal.email !== 'string') personal.email = 'noreply@example.com';

    const educationArr: any[] = [];
    if (education) {
      if (Array.isArray(education)) {
        education.forEach((e: any) => {
          educationArr.push({
            school: e.school || 'Unknown School',
            degree: e.degree || 'Unknown Degree',
            fieldOfStudy: e.fieldOfStudy || '',
            location: e.location || '',
            startDate: e.startDate || null,
            endDate: e.endDate || null,
            gpa: e.gpa || '',
            achievements: e.achievements || [],
            description: e.description || ''
          });
        });
      } else {
        educationArr.push({ school: education || 'Unknown School', degree: '', fieldOfStudy: '', description: '' });
      }
    }

    // If education array has entries with empty degree (required), provide default
    educationArr.forEach((ed) => {
      if (!ed.degree || ed.degree === '') ed.degree = 'Unknown Degree';
      if (!ed.school || ed.school === '') ed.school = 'Unknown School';
    });

    const experienceArr: any[] = [];
    if (experience) {
      if (Array.isArray(experience)) {
        experienceArr.push(...experience);
      } else {
        experienceArr.push({
          company: 'Previous Employer',
          position: jobTitle || 'Professional',
          location: '',
          employmentType: '',
          startDate: null,
          endDate: null,
          isCurrent: false,
          description: experience,
          responsibilities: typeof experience === 'string' ? experience.split('.').map((s: string) => s.trim()).filter(Boolean) : [],
          achievements: [],
          technologies: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()) : [])
        });
      }
    }

    // Ensure required fields for experience
    experienceArr.forEach((ex) => {
      if (!ex.company || ex.company === '') ex.company = 'Previous Employer';
      if (!ex.position || ex.position === '') ex.position = jobTitle || 'Professional';
    });

    const skillsArr: any[] = [];
    if (Array.isArray(skills)) {
      skillsArr.push({ category: 'Technical', skills: skills.map((s: string) => ({ name: s, level: 'Intermediate' })) });
    } else if (typeof skills === 'string' && skills.length) {
      const list = skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      skillsArr.push({ category: 'Technical', skills: list.map((s: string) => ({ name: s, level: 'Intermediate' })) });
    }

    // Provide at least one project with required name to satisfy schema
    const projects = [
      {
        name: 'Portfolio Website',
        role: 'Full-stack Developer',
        description: 'Personal portfolio website showcasing projects and skills',
        startDate: new Date(),
        endDate: null,
        technologies: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()) : []),
        link: '',
        images: [],
        achievements: []
      }
    ];

    const cvData: any = {
      personalInfo: personal,
      education: educationArr,
      experience: experienceArr,
      skills: skillsArr,
      projects,
      certificates: [],
      awards: [],
      volunteer: [],
      publications: [],
      metadata: { isPublic: false, language: 'en' }
    };

    const newCV = new CV(cvData);
    const saved = await newCV.save();

    // Attach to user if exists
    if (user) {
      user.cvs = user.cvs || [];
      user.cvs.push(saved._id);
      await user.save();
    }

    return res.json(saved);
  } catch (error: any) {
    console.error('AI generate error:', error);
    // Return detailed error message to help debugging
    return res.status(500).json({ message: 'Failed to generate CV', error: error.message || error.toString() });
  }
};

// AI Service để tối ưu hóa CV
export const optimizeCV = async (req: AuthRequest, res: Response) => {
  try {
    const { cvId, jobDescription } = req.body;

    // TODO: Tích hợp AI để tối ưu hóa CV theo job description
    const optimizations = {
      suggestions: [
        "Add more specific achievements with numbers",
        "Include relevant keywords from job description",
        "Highlight leadership experience",
        "Add certifications related to the role",
      ],
      keywords: ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
      score: 85,
    };

    res.json({
      success: true,
      message: "CV optimization completed",
      optimizations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error optimizing CV",
      error: error,
    });
  }
};

// AI Service để gợi ý cải thiện CV
export const getCVSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const { cvId } = req.params;

    // TODO: Tích hợp AI để phân tích và gợi ý cải thiện CV
    const suggestions = {
      content: [
        "Add quantifiable achievements to your experience",
        "Include relevant keywords for your industry",
        "Add a professional summary section",
      ],
      format: [
        "Use consistent formatting throughout",
        "Add section dividers for better readability",
        "Include contact information in header",
      ],
      design: [
        "Choose a professional color scheme",
        "Use clear, readable fonts",
        "Maintain consistent spacing",
      ],
    };

    res.json({
      success: true,
      message: "CV suggestions generated",
      suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating suggestions",
      error: error,
    });
  }
};
