import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String, // URL của ảnh thumbnail
        required: true
    },
    category: {
        type: String,
        enum: ['Professional', 'Creative', 'Academic', 'Simple', 'Modern'],
        required: true
    },
    style: {
        layout: {
            type: String,
            required: true
        },
        colors: {
            primary: String,
            secondary: String,
            accent: String,
            background: String,
            text: String
        },
        fonts: {
            heading: String,
            body: String
        },
        spacing: {
            type: Map,
            of: String
        }
    },
    sections: [{
        name: String,
        isRequired: Boolean,
        order: Number,
        customFields: [{
            name: String,
            type: String,
            isRequired: Boolean
        }]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware để cập nhật updatedAt
TemplateSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Template', TemplateSchema);