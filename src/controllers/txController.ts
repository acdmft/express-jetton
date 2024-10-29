import { Request, Response } from "express";
import pool from "../config/database";

export const processTx = async (req: Request, res: Response) => {
  const { msgHash, txData } = req.body;
  const { comment } = req.body; //as { hash: string };
  console.log("processTx tx, comment ", msgHash, comment);
  try {
    const result = await pool.query(
      "INSERT INTO transactions (hash, comment, sender, amount) \
             VALUES ($1, $2, $3, $4) \
            ON CONFLICT (hash) DO NOTHING \
            RETURNING hash",
      [msgHash, comment, txData.sender, txData.msg_value]
    );
    console.log('result ', result);
    if (result.rowCount === 1) {
      return res.json({
        message: "Comment recorded successfully",
        sender: txData.sender,
        msg_value: txData.msg_value,
      });
    } else {
      return res.status(404).json({
        error: "Transaction has been already recorded",
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const echo = async (_req: Request, res: Response) => {
  return res.json({ message: "hello from server" });
};
