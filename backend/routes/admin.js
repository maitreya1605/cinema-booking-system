const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminController = require('../controllers/admin');

// Server-side Role-Based Authorization: All admin routes require valid token AND role === 'admin'
router.use(auth);
router.use(auth.adminOnly);

// Dashboard overview & occupancy reports
router.get('/overview', adminController.getAdminOverview);

// Schedule & Show Management
router.get('/shows', adminController.getAdminShows);
router.post('/shows', adminController.createAdminShow);
router.delete('/shows/:id', adminController.deleteAdminShow);

// Ticket QR / Single-use Entry Validation
router.post('/validate-ticket', adminController.validateTicket);

// Business Audit Trail
router.get('/audit-logs', adminController.getAuditLogs);

// Metadata for scheduling dropdowns
router.get('/metadata', adminController.getAdminMetadata);

module.exports = router;

