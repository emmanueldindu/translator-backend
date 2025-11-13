import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { translationRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Validation schema
const translateSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  sourceLang: z.string(),
  targetLang: z.string()
});

// Check remaining translations for guest users
router.get('/remaining', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    // If user is authenticated, they have unlimited translations
    if (req.userId) {
      return res.json({ remaining: -1, unlimited: true });
    }

    // For guests, check IP-based translations
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const translationCount = await prisma.translation.count({
      where: {
        ipAddress,
        userId: null,
        createdAt: {
          gte: cutoffTime
        }
      }
    });

    const remaining = Math.max(0, 3 - translationCount);
    
    res.json({ 
      remaining, 
      unlimited: false,
      total: 3 
    });
  } catch (error) {
    console.error('Check remaining error:', error);
    res.status(500).json({ error: 'Failed to check remaining translations' });
  }
});

// Record translation (this would be called after successful translation)
router.post('/record', optionalAuth, translationRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { text, sourceLang, targetLang, result } = req.body;

    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    await prisma.translation.create({
      data: {
        text,
        sourceLang,
        targetLang,
        result,
        userId: req.userId || null,
        ipAddress: req.userId ? null : ipAddress
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Record translation error:', error);
    res.status(500).json({ error: 'Failed to record translation' });
  }
});

// Get user's translation history (authenticated only)
router.get('/history', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const translations = await prisma.translation.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        text: true,
        sourceLang: true,
        targetLang: true,
        result: true,
        createdAt: true
      }
    });

    res.json({ translations });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get translation history' });
  }
});

export default router;
