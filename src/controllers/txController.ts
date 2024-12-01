import { Request, Response } from "express";
import pool from "../config/database";

export const processTx = async (req: Request, res: Response) => {
  const { msgHash, txHash, comment } = req.body;
  // console.log("processTx tx msgHash, txHash, comment ", msgHash, txHash, comment);
  try {
    const result = await pool.query(
      "INSERT INTO transactions (msg_hash, tx_hash, comment) \
             VALUES ($1, $2, $3) \
            ON CONFLICT (msg_hash, tx_hash) DO NOTHING \
            RETURNING created_at",
      [msgHash, txHash, comment]
    );
    // console.log('processTx result ', result);
    if (result.rowCount === 1) {
      return res.json({
        message: "Comment recorded successfully",
        dateTime: result.rows[0].created_at
      });
    } else {
      return res.status(404).json({
        error: "Transaction has been already recorded",
      });
    }
  } catch (err) {
    console.log('database insert error ', err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const echo = async (_req: Request, res: Response) => {
  return res.json({ message: "hello from server" });
};
