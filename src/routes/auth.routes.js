const express = require('express');
const authController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerValidator, validate, authController.register);

// POST /api/auth/login
router.post('/login', loginValidator, validate, authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
