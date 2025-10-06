import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: false // not required because users can sign up via Google
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // allow multiple docs without googleId
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    profileImage: {
        type: String
    },
    cvs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CV'
    }],
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware để cập nhật updatedAt trước khi lưu
UserSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('User', UserSchema);