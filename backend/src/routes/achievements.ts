import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's achievements
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        icon: true,
        unlockedAt: true
      },
      orderBy: { unlockedAt: 'desc' }
    });

    // Group achievements by type
    const groupedAchievements = achievements.reduce((acc, achievement) => {
      if (!acc[achievement.type]) {
        acc[achievement.type] = [];
      }
      acc[achievement.type].push(achievement);
      return acc;
    }, {} as Record<string, typeof achievements>);

    res.json({ 
      achievements,
      groupedAchievements,
      totalCount: achievements.length
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get achievement statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      select: { type: true, unlockedAt: true }
    });

    // Count by type
    const typeCounts = achievements.reduce((acc, achievement) => {
      acc[achievement.type] = (acc[achievement.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent achievements (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAchievements = achievements.filter(
      achievement => achievement.unlockedAt >= sevenDaysAgo
    ).length;

    const stats = {
      totalAchievements: achievements.length,
      typeCounts,
      recentAchievements,
      achievementRate: achievements.length > 0 ? achievements.length / 30 : 0 // per month average
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get achievement stats error:', error);
    res.status(500).json({ error: 'Failed to fetch achievement statistics' });
  }
});

// Get available achievements (not yet unlocked)
router.get('/available', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user's current stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        experience: true,
        streak: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId, isActive: true },
      include: {
        progress: {
          select: {
            completed: true,
            score: true
          }
        }
      }
    });

    // Calculate potential achievements
    const availableAchievements = [];

    // Level-based achievements
    const nextLevel = user.level + 1;
    if (user.level < 10) {
      availableAchievements.push({
        type: 'level_up',
        title: `Reach Level ${nextLevel}`,
        description: `Continue learning to reach level ${nextLevel}`,
        icon: '🎯',
        progress: user.level,
        target: nextLevel,
        progressPercentage: (user.level / nextLevel) * 100
      });
    }

    // Streak achievements
    const streakTargets = [7, 14, 30, 60, 100];
    const nextStreakTarget = streakTargets.find(target => target > user.streak);
    if (nextStreakTarget) {
      availableAchievements.push({
        type: 'streak',
        title: `${nextStreakTarget} Day Streak`,
        description: `Maintain your learning streak for ${nextStreakTarget} days`,
        icon: '🔥',
        progress: user.streak,
        target: nextStreakTarget,
        progressPercentage: (user.streak / nextStreakTarget) * 100
      });
    }

    // Language completion achievements
    const totalLessons = enrollments.reduce((sum, enrollment) => 
      sum + enrollment.progress.length, 0
    );
    const completedLessons = enrollments.reduce((sum, enrollment) => 
      sum + enrollment.progress.filter(p => p.completed).length, 0
    );

    if (totalLessons > 0) {
      const lessonTargets = [10, 25, 50, 100];
      const nextLessonTarget = lessonTargets.find(target => target > completedLessons);
      if (nextLessonTarget) {
        availableAchievements.push({
          type: 'lesson_complete',
          title: `Complete ${nextLessonTarget} Lessons`,
          description: `Complete ${nextLessonTarget} lessons to unlock this achievement`,
          icon: '📚',
          progress: completedLessons,
          target: nextLessonTarget,
          progressPercentage: (completedLessons / nextLessonTarget) * 100
        });
      }
    }

    // Perfect score achievements
    const perfectScores = enrollments.reduce((sum, enrollment) => 
      sum + enrollment.progress.filter(p => p.completed && p.score >= 90).length, 0
    );
    const perfectScoreTargets = [5, 10, 20, 50];
    const nextPerfectScoreTarget = perfectScoreTargets.find(target => target > perfectScores);
    if (nextPerfectScoreTarget) {
      availableAchievements.push({
        type: 'perfect_score',
        title: `${nextPerfectScoreTarget} Perfect Scores`,
        description: `Get ${nextPerfectScoreTarget} perfect scores in lessons`,
        icon: '⭐',
        progress: perfectScores,
        target: nextPerfectScoreTarget,
        progressPercentage: (perfectScores / nextPerfectScoreTarget) * 100
      });
    }

    res.json({ availableAchievements });
  } catch (error) {
    console.error('Get available achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch available achievements' });
  }
});

// Get achievement leaderboard (optional - for social features)
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const topUsers = await prisma.user.findMany({
      select: {
        username: true,
        level: true,
        experience: true,
        streak: true,
        _count: {
          select: {
            achievements: true
          }
        }
      },
      orderBy: [
        { experience: 'desc' },
        { streak: 'desc' }
      ],
      take: 10
    });

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      level: user.level,
      experience: user.experience,
      streak: user.streak,
      achievementCount: user._count.achievements
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
