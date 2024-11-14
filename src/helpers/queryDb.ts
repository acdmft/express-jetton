import pool from "../config/database";
import { TxRecord } from "../models/txRecord";

export async function getUnprocessedRows() {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE processed = false limit 2"
    );
    // console.log('result ', result.rows);
    return result.rows;
  } catch (err) {
    console.error("Error querying database:", err);
    return [];
  }
}

// function formatData(row: TxRecord) {
//   return `ID: ${row.id}, Sender: ${row.sender}, Value: ${row.amount}, Date: ${row.created_at}`;
// }

export async function setProcToTrue(row: TxRecord, hash: string | undefined) {
  try {
    // const formattedData = formatData(row);
    const result = await pool.query(
      "UPDATE transactions SET processed = true, mint_hash = $2 WHERE id = $1",
      [row.id, hash]
    );
    return result;
  } catch (err) {
    console.error(`Request failed for row ${row.id}:`, err);
    return [];
  }
}
