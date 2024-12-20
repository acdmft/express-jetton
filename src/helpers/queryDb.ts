import pool from "../config/database";
import { Transaction } from "../models/transaction";


// called by jettonMinter to retrieve rows with confirmed transaction data (sender, amount)
export async function getRowsForMinter() {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE verified = true AND processed = false"
      // "SELECT * FROM transactions WHERE amount != '' AND sender != '' AND mint_hash = '' limit 2"
    );
    // console.log('result ', result.rows);
    return result.rows;
  } catch (err) {
    console.error("Error querying database:", err);
    return [];
  }
}

// called in jettonMinter to insert hash of the mint transaction ('error' in case of failure)
export async function setMintResultHash(
  rowId: number,
  hash: string | undefined
) {
  try {
    // const formattedData = formatData(row);
    const result = await pool.query(
      "UPDATE transactions SET mint_hash = $2, processed = true WHERE id = $1",
      [rowId, hash]
    );
    return result;
  } catch (err) {
    console.error(`Request setMintResultHash failed for row ${rowId}:`, err);
    return [];
  }
}

// used in the minterMonitor to check out transactions retrieved from api with tx sent to the database by frontend 
// checks 4 times and then passes to next transactions if didn't find tx in the database
export async function collateTransactions(transactions: Transaction[], currStartTime: number) {
  let counter = 0;
  while (transactions.length > 0) {
    // iterate transactions
    let remainingTransactions = [];
    await new Promise((resolve) => setTimeout(resolve, 17000)); // set timeout before processing first transaction
    for (let tx of transactions) {
      // console.log(`transaction ${counter}: time ${tx.now} \n trace_id: ${tx.trace_id} \n in_msg sender: ${tx.in_msg?.source} \n in_msg value: ${tx.in_msg?.value} \n`);
      console.log('Number of transactions to collate with db: ', remainingTransactions.length);
      if (tx.now >= currStartTime) {
        currStartTime = tx.now;
      }
      if (counter < 4) {
        try {
          // query database to check if transaction is present
          const result = await pool.query(
            "SELECT * FROM transactions WHERE tx_hash = $1",
            [tx?.trace_id]
          );
          console.log(`Transaction with trace_id ${tx?.trace_id} found: ${result.rowCount === 1}`);
          if (result.rows.length === 0) {
            remainingTransactions.push(tx);
            continue;
          } else {
            // update row (processed=true) and remove transaction from list
            await pool.query(
              "UPDATE transactions SET verified=true, sender = $2, amount = $3 WHERE id = $1",
              [result.rows[0].id, tx.in_msg?.source, tx.in_msg?.value]
            );
          }
        } catch (e) {
          console.error("Error during interactions with database: ", e);
          continue;
        }
      } else {
        return currStartTime + 1;
      }
    }
    counter++;
    transactions = remainingTransactions;
    console.log(`There are ${transactions.length} transactions left to collate with db after ${counter} attempts`);
  }
  return currStartTime+1;
}
