// src/handlers/health.ts
import { Router, Request, Response } from 'express';
// does need to check if the code is working locally or not

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  return res.status(200).json({ status: 'ok', service: 'fraud-detector' });
});

export default router;
