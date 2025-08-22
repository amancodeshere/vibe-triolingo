import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        level: true,
        experience: true,
        streak: true,
        avatar: true,
        lastLogin: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('avatar').optional().isURL()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const userId = req.user!.id;
    const { firstName, lastName, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        avatar
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        level: true,
        experience: true,
        streak: true,
        avatar: true,
        lastLogin: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user's enrollments and progress
    const enrollments = await prisma.enrollment.findMany({
      where: { userId, isActive: true },
      include: {
        language: {
          select: { name: true, code: true }
        },
        progress: {
          select: {
            completed: true,
            score: true,
            timeSpent: true
          }
        }
      }
    });

    // Calculate statistics
    const totalLanguages = enrollments.length;
    const totalLessons = enrollments.reduce((sum, enrollment) => 
      sum + enrollment.progress.length, 0
    );
    const completedLessons = enrollments.reduce((sum, enrollment) => 
      sum + enrollment.progress.filter(p => p.completed).length, 0
    );
    const totalScore = enrollments.reduce((sum, enrollment) => 
      sum + enrollment.progress.reduce((lessonSum, p) => lessonSum + p.score, 0), 0
    );
    const totalTimeSpent = enrollments.reduce((sum, enrollment) => 
      sum + enrollment.progress.reduce((lessonSum, p) => lessonSum + p.timeSpent, 0), 0
    );

    // Get achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      select: { type: true, title: true, unlockedAt: true }
    });

    const stats = {
      totalLanguages,
      totalLessons,
      completedLessons,
      completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
      totalScore,
      totalTimeSpent,
      totalAchievements: achievements.length,
      achievements: achievements.slice(-5) // Last 5 achievements
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get user's learning streak
router.get('/streak', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, lastLogin: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user logged in today to maintain streak
    const today = new Date();
    const lastLogin = user.lastLogin;
    
    let shouldUpdateStreak = false;
    if (lastLogin) {
      const daysSinceLastLogin = Math.floor(
        (today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastLogin === 1) {
        // User logged in yesterday, increment streak
        shouldUpdateStreak = true;
      } else if (daysSinceLastLogin > 1) {
        // User missed a day, reset streak
        await prisma.user.update({
          where: { id: userId },
          data: { streak: 0 }
        });
        user.streak = 0;
      }
    } else {
      // First time login
      shouldUpdateStreak = true;
    }

    if (shouldUpdateStreak) {
      const newStreak = user.streak + 1;
      await prisma.user.update({
        where: { id: userId },
        data: { streak: newStreak }
      });
      user.streak = newStreak;
    }

    res.json({ 
      streak: user.streak,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

export default router;
