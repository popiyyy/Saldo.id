import { Router, Response } from 'express';
import { transactionService } from '../services';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/transactions
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const transactions = await transactionService.getAll(req.user?.id, req.user?.role);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// GET /api/transactions/details (with user and category info)
router.get('/details', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const transactions = await transactionService.getWithDetails();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// GET /api/transactions/today
router.get('/today', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const transactions = await transactionService.getTodayTransactions(req.user.id);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch today transactions' });
    }
});

// GET /api/transactions/:id
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const transaction = await transactionService.getById(id);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
});

// POST /api/transactions
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { categoryId, type, amount, description, proofUrl, transactionDate } = req.body;

        if (!type || !amount) {
            return res.status(400).json({ error: 'Type and amount are required' });
        }

        const transaction = await transactionService.create({
            userId: req.user!.id,
            categoryId,
            type,
            amount,
            description,
            proofUrl,
            transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// PUT /api/transactions/:id
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { categoryId, type, amount, description, proofUrl, transactionDate } = req.body;

        const transaction = await transactionService.update(id, {
            categoryId,
            type,
            amount,
            description,
            proofUrl,
            transactionDate: transactionDate ? new Date(transactionDate) : undefined,
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

// DELETE /api/transactions/:id
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await transactionService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

export default router;
