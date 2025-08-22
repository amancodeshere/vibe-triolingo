import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all lessons for a language
router.get('/language/:languageId', async (req: Request, res: Response) => {
  try {
    const { languageId } = req.params;

    const lessons = await prisma.lesson.findMany({
      where: {
        languageId,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        difficulty: true,
        _count: {
          select: {
            exercises: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json({ lessons });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get lesson by ID with exercises
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id, isActive: true },
      include: {
        language: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        exercises: {
          where: { isActive: true },
          select: {
            id: true,
            type: true,
            question: true,
            options: true,
            order: true,
            points: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Get lesson with user progress
router.get('/:id/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: lessonId } = req.params;
    const userId = req.user!.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, isActive: true },
      include: {
        language: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        exercises: {
          where: { isActive: true },
          select: {
            id: true,
            type: true,
            question: true,
            options: true,
            order: true,
            points: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Get user's enrollment for this language
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        languageId: lesson.language.id,
        isActive: true
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this language' });
    }

    // Get user's progress for this lesson
    const progress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      }
    });

    const lessonWithProgress = {
      ...lesson,
      userProgress: progress,
      isUnlocked: true // For now, all lessons are unlocked
    };

    res.json({ lesson: lessonWithProgress });
  } catch (error) {
    console.error('Get lesson progress error:', error);
    res.status(500).json({ error: 'Failed to fetch lesson progress' });
  }
});

// Submit lesson completion
router.post('/:id/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: lessonId } = req.params;
    const userId = req.user!.id;
    const { score, timeSpent, answers } = req.body;

    // Validate lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, isActive: true }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Get user's enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        languageId: lesson.languageId,
        isActive: true
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this language' });
    }

    // Calculate total possible points
    const exercises = await prisma.exercise.findMany({
      where: { lessonId, isActive: true },
      select: { points: true }
    });

    const totalPoints = exercises.reduce((sum, ex) => sum + ex.points, 0);
    const finalScore = Math.min(score, totalPoints);

    // Create or update progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        score: finalScore,
        timeSpent,
        completed: true,
        completedAt: new Date()
      },
      create: {
        userId,
        lessonId,
        enrollmentId: enrollment.id,
        score: finalScore,
        timeSpent,
        completed: true,
        completedAt: new Date()
      }
    });

    // Update user experience and level
    const experienceGained = Math.floor(finalScore / 10);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { experience: true, level: true }
    });

    if (user) {
      const newExperience = user.experience + experienceGained;
      const newLevel = Math.floor(newExperience / 100) + 1;

      await prisma.user.update({
        where: { id: userId },
        data: {
          experience: newExperience,
          level: newLevel
        }
      });

      // Check for level up achievement
      if (newLevel > user.level) {
        await prisma.achievement.create({
          data: {
            userId,
            type: 'level_up',
            title: `Level ${newLevel}!`,
            description: `Congratulations! You've reached level ${newLevel}`,
            icon: '🎉'
          }
        });
      }
    }

    // Check for perfect score achievement
    if (finalScore === totalPoints) {
      const existingAchievement = await prisma.achievement.findFirst({
        where: {
          userId,
          type: 'perfect_score',
          title: `Perfect Score in ${lesson.title}`
        }
      });

      if (!existingAchievement) {
        await prisma.achievement.create({
          data: {
            userId,
            type: 'perfect_score',
            title: `Perfect Score in ${lesson.title}`,
            description: `You got a perfect score in ${lesson.title}!`,
            icon: '⭐'
          }
        });
      }
    }

    res.json({
      message: 'Lesson completed successfully',
      progress,
      experienceGained,
      newLevel: user ? Math.floor((user.experience + experienceGained) / 100) + 1 : 1
    });

  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

// Get next lesson recommendation
router.get('/:id/next', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: currentLessonId } = req.params;
    const userId = req.user!.id;

    const currentLesson = await prisma.lesson.findUnique({
      where: { id: currentLessonId },
      select: { languageId: true, order: true }
    });

    if (!currentLesson) {
      return res.status(404).json({ error: 'Current lesson not found' });
    }

    // Find next lesson in sequence
    const nextLesson = await prisma.lesson.findFirst({
      where: {
        languageId: currentLesson.languageId,
        order: { gt: currentLesson.order },
        isActive: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        difficulty: true
      },
      orderBy: { order: 'asc' }
    });

    res.json({ nextLesson });
  } catch (error) {
    console.error('Get next lesson error:', error);
    res.status(500).json({ error: 'Failed to get next lesson' });
  }
});

export default router;
