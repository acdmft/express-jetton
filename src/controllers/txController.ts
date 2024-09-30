import { Request, Response } from 'express';
import pool from '../config/database';

export const processTx = async (req: Request, res: Response) => {
    const { msgHash, txData } = req.body;
    const { comment } = req.body; //as { hash: string };
    console.log('processTx tx, comment ', msgHash, comment);
    try {
        const result = await pool.query(
            'INSERT INTO transactions (hash, comment) VALUES ($1, $2)',
            [msgHash, comment]
        )
        return res.json({
            message: 'Comment recorded successfully', 
            sender: txData.sender,
            msg_value: txData.msg_value
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }    
}

export const echo = async (_req: Request, res: Response) => {
    return res.json({ message: 'hello from server' });
}