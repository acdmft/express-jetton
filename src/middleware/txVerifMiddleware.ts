import { Request, Response, NextFunction } from 'express';

export async function verifyTx(req: Request, res: Response, next: NextFunction) {

    const { msgHash, txHash, comment } = req.body;
    // console.log('msgHash , txHash, comment ', msgHash, txHash, comment);
    if (msgHash.length !== 44 || txHash.length !== 44 || comment.length > 328) {
        return res.status(500).json({ error: 'Malformed transaction. Maximum number of letters for comment - 328' })
    }
    next();
}

