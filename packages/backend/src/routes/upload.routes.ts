import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// POST /api/upload - Upload file
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Get base64 data from request body
        const { file, filename, mimetype } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Generate unique filename
        const ext = path.extname(filename || '.jpg');
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        const filePath = path.join(uploadsDir, uniqueName);

        // Convert base64 to buffer and save
        const base64Data = file.replace(/^data:.*?;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);

        // Return the URL
        const fileUrl = `/uploads/${uniqueName}`;
        res.json({ url: fileUrl, filename: uniqueName });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

export default router;
