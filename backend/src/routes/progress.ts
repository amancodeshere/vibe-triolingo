import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's overall progress
router.get('/overview', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId, isActive: true },
      include: {
        language: {
          select: { name: true, code: true, flag: true }
        },
        progress: {
          select: {
            lessonId: true,
            completed: true,
            score: true,
            timeSpent: true
          }
        }
      }
    });

    const overview = enrollments.map(enrollment => {
      const totalLessons = enrollment.progress.length;
      const completedLessons = enrollment.progress.filter(p => p.completed).length;
      const totalScore = enrollment.progress.reduce((sum, p) => sum + p.score, 0);
      const totalTime = enrollment.progress.reduce((sum, p) => sum + p.timeSpent, 0);

      return {
        language: enrollment.language,
        level: enrollment.level,
        totalLessons,
        completedLessons,
        completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        totalScore,
        totalTime,
        startedAt: enrollment.startedAt
      };
    });

    res.json({ overview });
  } catch (error) {
    console.error('Get progress overview error:', error);
    res.status(500).json({ error: 'Failed to fetch progress overview' });
  }
});

// Get progress for a specific language
router.get('/language/:languageId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { languageId } = req.params;

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        languageId,
        isActive: true
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this language' });
    }

    // Get all lessons for the language
    const lessons = await prisma.lesson.findMany({
      where: { languageId, isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        difficulty: true
      },
      orderBy: { order: 'asc' }
    });

    // Get user's progress for each lesson
    const progress = await prisma.progress.findMany({
      where: {
        userId,
        lessonId: { in: lessons.map(l => l.id) }
      },
      select: {
        lessonId: true,
        completed: true,
        score: true,
        timeSpent: true,
        completedAt: true
      }
    });

    // Combine lessons with progress
    const lessonsWithProgress = lessons.map(lesson => {
      const lessonProgress = progress.find(p => p.lessonId === lesson.id);
      return {
        ...lesson,
        progress: lessonProgress || null,
        isCompleted: lessonProgress?.completed || false
      };
    });

    // Calculate language statistics
    const totalLessons = lessons.length;
    const completedLessons = lessonsWithProgress.filter(l => l.isCompleted).length;
    const totalScore = lessonsWithProgress.reduce((sum, l) => 
      sum + (l.progress?.score || 0), 0
    );
    const totalTime = lessonsWithProgress.reduce((sum, l) => 
      sum + (l.progress?.timeSpent || 0), 0
    );

    const languageProgress = {
      language: {
        id: languageId,
        level: enrollment.level
      },
      lessons: lessonsWithProgress,
      statistics: {
        totalLessons,
        completedLessons,
        completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        totalScore,
        totalTime
      }
    };

    res.json({ languageProgress });
  } catch (error) {
    console.error('Get language progress error:', error);
    res.status(500).json({ error: 'Failed to fetch language progress' });
  }
});

// Get progress for a specific lesson
router.get('/lesson/:lessonId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { lessonId } = req.params;

    const progress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      include: {
        lesson: {
          select: {
            title: true,
            language: {
              select: { name: true, code: true }
            }
          }
        }
      }
    });

    if (!progress) {
      return res.json({ 
        progress: null,
        message: 'No progress recorded for this lesson'
      });
    }

    res.json({ progress });
  } catch (error) {
    console.error('Get lesson progress error:', error);
    res.status(500).json({ error: 'Failed to fetch lesson progress' });
  }
});

// Get learning analytics
router.get('/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get progress from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProgress = await prisma.progress.findMany({
      where: {
        userId,
        completedAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        completedAt: true,
        score: true,
        timeSpent: true
      },
      orderBy: { completedAt: 'asc' }
    });

    // Group by date
    const dailyProgress = recentProgress.reduce((acc, progress) => {
      const date = progress.completedAt!.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { lessonsCompleted: 0, totalScore: 0, totalTime: 0 };
      }
      acc[date].lessonsCompleted += 1;
      acc[date].totalScore += progress.score;
      acc[date].totalTime += progress.timeSpent;
      return acc;
    }, {} as Record<string, { lessonsCompleted: number; totalScore: number; totalTime: number }>);

    // Calculate averages
    const totalLessons = recentProgress.length;
    const averageScore = totalLessons > 0 ? recentProgress.reduce((sum, p) => sum + p.score, 0) / totalLessons : 0;
    const averageTime = totalLessons > 0 ? recentProgress.reduce((sum, p) => sum + p.timeSpent, 0) / totalLessons : 0;

    const analytics = {
      period: '30 days',
      totalLessonsCompleted: totalLessons,
      averageScore: Math.round(averageScore),
      averageTimePerLesson: Math.round(averageTime),
      dailyProgress,
      learningStreak: 0 // This will be calculated separately
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
