const express = require('express');
const { getHealth } = require('../controllers/health.controller');

const router = express.Router();

// Maps to GET /api/health (mounted under /health in index.js)
router.get('/', getHealth);

module.exports = router;
