import pool from "../config/database";
import { TxRecord } from "../models/txRecord";

// called by jettonMinter to retrieve rows with confirmed transaction data (sender, amount)
export async function getRowsForMinter() {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE amount != '' AND sender != '' AND mint_hash = '' limit 2"
    );
    // console.log('result ', result.rows);
    return result.rows;
  } catch (err) {
    console.error("Error querying database:", err);
    return [];
  }
}

// used in txVerifier to retrieve rows that where not verified with toncenter(?) api
export async function getUnverifiedRows() {
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

// called in jettonMinter to insert hash of the mint transaction ('error' in case of failure)
export async function setMintResultHash(rowId: number, hash: string | undefined) {
  try {
    // const formattedData = formatData(row);
    const result = await pool.query(
      "UPDATE transactions SET mint_hash = $2 WHERE id = $1",
      [rowId, hash]
    );
    return result;
  } catch (err) {
    console.error(`Request setMintResultHash failed for row ${rowId}:`, err);
    return [];
  }
}

// called in txVerifier to set processed to true 
export async function setVerifData(rowId:number, sender: string, tonAmount: number | null) {
  try {
    // const formattedData = formatData(row);
    const result = await pool.query(
      "UPDATE transactions SET processed = true, sender=$2, amount = $3 WHERE id = $1",
      [rowId, sender, tonAmount]
    );
    return result;
  } catch (err) {
    console.error(`SetVerifiedToTrue Request failed for row ${rowId}: \n`, err);
    return [];
  }
}
