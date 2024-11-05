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

function formatData(row: TxRecord) {
  return `ID: ${row.id}, Sender: ${row.sender}, Value: ${row.amount}, Date: ${row.created_at}`;
}

export async function setProcToTrue(row: TxRecord) {
  try {
    const formattedData = formatData(row);
    // console.log(`Formatted Data: ${formattedData}`);

    //   const response = await fetch('https://your-api-url.com/api-endpoint', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ sender: row.sender, value: row.value }),
    //   });
    const result = await pool.query(
      "UPDATE transactions SET processed = true WHERE id = $1",
      [row.id]
    );

    //   if (response.ok) {
    //     console.log(`Row processed successfully: ${row.id}`);
    //     await markRowAsProcessed(row.id);
    //   } else {
    //     console.error(`API error for row ${row.id}: ${response.statusText}`);
    //   }
    return result;
  } catch (err) {
    console.error(`Request failed for row ${row.id}:`, err);
    return [];
  }
}

// async function jettonMinter() {
//   while (true) {
//     const unprocessedRows = await getUnprocessedRows();

//     if (unprocessedRows.length === 0) {
//       console.log("No unprocessed rows found, waiting...");
//       await new Promise((resolve) => setTimeout(resolve, 5000));
//       continue;
//     }

//     for (const row of unprocessedRows) {
//       await setProcToTrue(row);
//     }

//     await new Promise((resolve) => setTimeout(resolve, 5000));
//   }
// }

// export default jettonMinter;
