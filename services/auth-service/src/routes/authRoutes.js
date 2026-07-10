const express = require('express');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const verifyInternalService = require('../middleware/verifyInternalService');
const authorizeRoles = require('../middleware/authorizeRoles');
const validate = require('../middleware/validate');
const { registerSchema, registerInternalSchema, loginSchema } = require('../validations/authValidation');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/register-internal', verifyToken, authorizeRoles('ADMIN'), validate(registerInternalSchema), authController.registerInternal);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', verifyToken, authController.getMe);
router.get('/internal/users/:id', verifyInternalService, authController.getUser);

module.exports = router;
