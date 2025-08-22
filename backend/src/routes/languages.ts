import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all available languages
router.get('/', async (req: Request, res: Response) => {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        flag: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({ languages });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

// Get language by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const language = await prisma.language.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        flag: true,
        description: true,
        lessons: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            difficulty: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!language) {
      return res.status(404).json({ error: 'Language not found' });
    }

    res.json({ language });
  } catch (error) {
    console.error('Get language error:', error);
    res.status(500).json({ error: 'Failed to fetch language' });
  }
});

// Enroll user in a language
router.post('/:id/enroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: languageId } = req.params;
    const userId = req.user!.id;

    // Check if language exists
    const language = await prisma.language.findUnique({
      where: { id: languageId, isActive: true }
    });

    if (!language) {
      return res.status(404).json({ error: 'Language not found' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_languageId: {
          userId,
          languageId
        }
      }
    });

    if (existingEnrollment) {
      if (existingEnrollment.isActive) {
        return res.status(400).json({ error: 'Already enrolled in this language' });
      } else {
        // Reactivate enrollment
        await prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { isActive: true, startedAt: new Date() }
        });

        return res.json({ message: 'Enrollment reactivated' });
      }
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        languageId,
        level: 1,
        isActive: true
      }
    });

    res.status(201).json({
      message: 'Successfully enrolled in language',
      enrollment
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Enrollment failed' });
  }
});

// Get user's language enrollments
router.get('/enrollments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        language: {
          select: {
            id: true,
            name: true,
            code: true,
            flag: true,
            description: true
          }
        },
        progress: {
          select: {
            lessonId: true,
            completed: true,
            score: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = enrollments.map(enrollment => {
      const totalLessons = enrollment.progress.length;
      const completedLessons = enrollment.progress.filter(p => p.completed).length;
      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      return {
        ...enrollment,
        progressPercentage: Math.round(progressPercentage),
        totalLessons,
        completedLessons
      };
    });

    res.json({ enrollments: enrollmentsWithProgress });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Unenroll from a language
router.delete('/:id/enroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: languageId } = req.params;
    const userId = req.user!.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_languageId: {
          userId,
          languageId
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Soft delete by setting isActive to false
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { isActive: false }
    });

    res.json({ message: 'Successfully unenrolled from language' });
  } catch (error) {
    console.error('Unenrollment error:', error);
    res.status(500).json({ error: 'Unenrollment failed' });
  }
});

export default router;
