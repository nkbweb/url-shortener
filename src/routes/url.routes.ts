import { Router } from 'express';
import { urlController } from '../controllers/url.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { createUrlSchema } from '../validators/url.validator';

const router = Router();

/**
 * @swagger
 * /url/shorten:
 *   post:
 *     summary: Create a short URL
 *     tags: [URL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalUrl
 *             properties:
 *               originalUrl:
 *                 type: string
 *                 format: uri
 *                 description: The URL to shorten
 *               shortCode:
 *                 type: string
 *                 description: Optional custom short code
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *       400:
 *         description: Validation error or invalid URL
 */
router.post(
  '/shorten',
  optionalAuth,
  validate(createUrlSchema),
  urlController.createShortUrl.bind(urlController),
);

/**
 * @swagger
 * /url/{shortCode}:
 *   get:
 *     summary: Redirect to original URL
 *     tags: [URL]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code to redirect
 *     responses:
 *       302:
 *         description: Redirect to original URL
 *       404:
 *         description: Short URL not found
 */
router.get('/:shortCode', urlController.redirect.bind(urlController));

/**
 * @swagger
 * /url:
 *   get:
 *     summary: Get all URLs for authenticated user
 *     tags: [URL]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of URLs
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, urlController.getUserUrls.bind(urlController));

/**
 * @swagger
 * /url/{id}:
 *   delete:
 *     summary: Delete a URL
 *     tags: [URL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL ID to delete
 *     responses:
 *       200:
 *         description: URL deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: URL not found
 */
router.delete(
  '/:id',
  authenticate,
  urlController.deleteUrl.bind(urlController),
);

export default router;
