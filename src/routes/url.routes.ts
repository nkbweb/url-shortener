import { Router } from 'express';
import { urlController } from '../controllers/url.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { shortenLimiter } from '../middleware/rateLimiter';
import { createUrlSchema, updateUrlSchema } from '../validators/url.validator';

const router = Router();

router.post(
  '/shorten',
  shortenLimiter,
  optionalAuth,
  validate(createUrlSchema),
  urlController.createShortUrl.bind(urlController),
);

router.get('/', authenticate, urlController.getUserUrls.bind(urlController));

router.get(
  '/:shortCode/analytics',
  authenticate,
  urlController.getUrlAnalytics.bind(urlController),
);

router.get('/:shortCode', urlController.redirect.bind(urlController));

router.patch(
  '/:id',
  authenticate,
  validate(updateUrlSchema),
  urlController.updateUrl.bind(urlController),
);

router.delete(
  '/:id',
  authenticate,
  urlController.deleteUrl.bind(urlController),
);

export default router;
