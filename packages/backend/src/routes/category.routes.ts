import { Router, Response } from 'express';
import { categoryService } from '../services';
import { authMiddleware, ownerOnly, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/categories
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { type } = req.query;

        if (type && (type === 'income' || type === 'expense')) {
            const categories = await categoryService.getByType(type);
            return res.json(categories);
        }

        const categories = await categoryService.getAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/categories/:id
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const category = await categoryService.getById(id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// POST /api/categories (Owner only)
router.post('/', authMiddleware, ownerOnly, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }

        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ error: 'Type must be income or expense' });
        }

        const category = await categoryService.create({ name, type });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PUT /api/categories/:id (Owner only)
router.put('/:id', authMiddleware, ownerOnly, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { name, type } = req.body;

        if (type && type !== 'income' && type !== 'expense') {
            return res.status(400).json({ error: 'Type must be income or expense' });
        }

        const category = await categoryService.update(id, { name, type });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE /api/categories/:id (Owner only)
router.delete('/:id', authMiddleware, ownerOnly, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await categoryService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

export default router;
