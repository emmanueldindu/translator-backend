import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from './auth';

const GUEST_TRANSLATION_LIMIT = 3;
const TIME_WINDOW_HOURS = 24;

export const translationRateLimiter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // If user is authenticated, allow unlimited translations
    if (req.userId) {
      return next();
    }

    // For guests, check IP-based rate limiting
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    
    // Count translations from this IP in the last 24 hours
    const cutoffTime = new Date(Date.now() - TIME_WINDOW_HOURS * 60 * 60 * 1000);
    
    const translationCount = await prisma.translation.count({
      where: {
        ipAddress,
        userId: null,
        createdAt: {
          gte: cutoffTime
        }
      }
    });

    if (translationCount >= GUEST_TRANSLATION_LIMIT) {
      return res.status(429).json({
        error: 'Translation limit reached',
        message: `You've reached the limit of ${GUEST_TRANSLATION_LIMIT} free translations. Please login or register to continue.`,
        requiresAuth: true
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next();
  }
};
