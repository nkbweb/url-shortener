import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
} from '../validators/auth.validator';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/reset.validator';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register.bind(authController),
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login.bind(authController),
);

router.post(
  '/refresh',
  validate(refreshSchema),
  authController.refresh.bind(authController),
);

router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword.bind(authController),
);

router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController),
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController),
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController),
);

export default router;
