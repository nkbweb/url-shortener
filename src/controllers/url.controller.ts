import { Request, Response } from 'express';
import { urlService } from '../services/url.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class UrlController {
  async createShortUrl(req: Request, res: Response) {
    try {
      const { originalUrl, shortCode } = req.body;
      const userId = (req as AuthRequest).userId;

      const url = await urlService.createShortUrl(
        originalUrl,
        shortCode,
        userId,
      );

      res.status(201).json({
        success: true,
        message: 'Short URL created successfully',
        data: url,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create short URL',
      });
    }
  }

  async redirect(req: Request, res: Response) {
    try {
      const { shortCode } = req.params;
      const code = Array.isArray(shortCode) ? shortCode[0] : shortCode;

      const url = await urlService.getUrlByShortCode(code);

      res.redirect(url.originalUrl);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'URL not found',
      });
    }
  }

  async getUserUrls(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const urls = await urlService.getUserUrls(userId);

      res.status(200).json({
        success: true,
        data: urls,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch URLs',
      });
    }
  }

  async deleteUrl(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const urlId = Array.isArray(id) ? id[0] : id;
      const result = await urlService.deleteUrl(urlId, userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete URL',
      });
    }
  }
}

export const urlController = new UrlController();
