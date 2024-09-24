import { Request, Response } from 'express';
import pool from '../config/database';

export const processTx = async (req: Request, res: Response) => {
    const { tx } = req.body;
    const { comment } = req.body; //as { hash: string };
    console.log('processTx tx, comment ', tx, comment);
    try {
        const result = await pool.query(
            'INSERT INTO transactions (hash, comment) VALUES ($1, $2)',
            [tx, comment]
        )
        return res.json({message: 'Comment recorded successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }    
}

export const echo = async (_req: Request, res: Response) => {
    return res.json({ message: 'hello from server' });
}