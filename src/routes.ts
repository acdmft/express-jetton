import { Router } from 'express';
import { processTx, echo } from './controllers/txController';
import { verifyTx } from './middleware/txVerifMiddleware';

const router = Router();
// verifyTx - checks that the tx_hash, msg_hash and comment have valid length (64, 44 and 328)
router.post('/transaction', verifyTx, processTx);
router.get('/echo', echo);

export default router;