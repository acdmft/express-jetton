import { Router } from 'express';
import { processTx, echo } from './controllers/txController';
import { verifyTx } from './middleware/txVerifMiddleware';

const router = Router();
router.post('/transaction', verifyTx, processTx);
router.get('/echo', echo);

export default router;