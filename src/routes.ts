import { Router } from 'express';
import { processTx, echo } from './controllers/txController';

const router = Router();
router.post('/transaction', processTx);
router.get('/echo', echo);

export default router;