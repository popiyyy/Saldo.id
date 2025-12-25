import { Router, Response } from 'express';
import { statsService } from '../services';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/stats/summary
router.get('/summary', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const stats = await statsService.getSummary(req.user?.id, req.user?.role);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/stats/today
router.get('/today', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const stats = await statsService.getTodayStats(req.user.id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch today stats' });
    }
});

// GET /api/stats/chart
router.get('/chart', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const chartData = await statsService.getChartData(days, req.user?.id, req.user?.role);
        res.json(chartData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

export default router;
