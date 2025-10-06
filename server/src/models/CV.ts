import mongoose from 'mongoose';

// Template schema để lưu các mẫu CV
const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  style: {
    theme: { type: String, default: 'professional' },
    colors: {
      primary: { type: String, default: '#000000' },
      secondary: { type: String, default: '#666666' }
    },
    font: { type: String, default: 'Arial' }
  }
});

// CV Schema chính
const CVSchema = new mongoose.Schema({
  // Thông tin cá nhân
  personalInfo: {
    fullName: { type: String, required: true },
    jobTitle: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String }, // URL ảnh đại diện
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
      twitter: { type: String }
    },
    summary: { type: String } // Tóm tắt về bản thân
  },

  // Học vấn
  education: [{
    school: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String },
    location: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    gpa: { type: String },
    achievements: [String],
    description: { type: String }
  }],

  // Kinh nghiệm làm việc
  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String },
    employmentType: { type: String }, // Full-time, Part-time, Freelance, etc.
    startDate: { type: Date },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String },
    responsibilities: [String],
    achievements: [String],
    technologies: [String] // Công nghệ sử dụng trong công việc
  }],

  // Kỹ năng
  skills: [{
    category: { type: String }, // Technical, Soft Skills, etc.
    skills: [{
      name: { type: String },
      level: { type: String }, // Beginner, Intermediate, Advanced, Expert
      yearsOfExperience: { type: Number }
    }]
  }],

  // Ngôn ngữ
  languages: [{
    language: { type: String },
    proficiency: { type: String }, // Basic, Intermediate, Advanced, Native
    certificate: { type: String } // Chứng chỉ ngôn ngữ nếu có
  }],

  // Dự án
  projects: [{
    name: { type: String, required: true },
    role: { type: String },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    technologies: [String],
    link: { type: String },
    images: [String], // URLs của ảnh dự án
    achievements: [String]
  }],

  // Chứng chỉ
  certificates: [{
    name: { type: String, required: true },
    issuer: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    credentialID: { type: String },
    credentialURL: { type: String }
  }],

  // Giải thưởng & Thành tích
  awards: [{
    title: { type: String, required: true },
    issuer: { type: String },
    date: { type: Date },
    description: { type: String }
  }],

  // Hoạt động tình nguyện
  volunteer: [{
    organization: { type: String, required: true },
    role: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String }
  }],

  // Publications & Presentations
  publications: [{
    title: { type: String, required: true },
    publisher: { type: String },
    date: { type: Date },
    url: { type: String },
    description: { type: String }
  }],

  // Cài đặt mẫu CV
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },

  // Metadata
  metadata: {
    isPublic: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    lastUpdated: { type: Date },
    version: { type: Number, default: 1 },
    status: { type: String, default: 'draft' }, // draft, published
    language: { type: String, default: 'en' }
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index cho tìm kiếm
CVSchema.index({ 'personalInfo.fullName': 'text', 'personalInfo.jobTitle': 'text' });

// Middleware để tự động cập nhật updatedAt
CVSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.metadata) {
    this.metadata.lastUpdated = new Date();
  }
  next();
});

export const Template = mongoose.model('Template', TemplateSchema);
export const CV = mongoose.model('CV', CVSchema);

export default CV;