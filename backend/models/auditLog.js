const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userEmail: {
        type: String,
        default: 'admin@cinema.com'
    },
    action: {
        type: String,
        required: true,
        enum: [
            'SHOW_CREATED',
            'SHOW_DELETED',
            'TICKET_VALIDATED',
            'BOOKING_CANCELLED',
            'BOOKING_CONFIRMED',
            'SCREEN_CREATED'
        ]
    },
    details: {
        type: String,
        required: true
    },
    entityType: {
        type: String,
        default: 'General'
    },
    entityId: {
        type: String,
        default: ''
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

