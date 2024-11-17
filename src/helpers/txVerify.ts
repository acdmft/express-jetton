import fetch from "node-fetch";
import { Transaction } from "../models/transaction";

interface ApiResponse {
  transactions: Transaction[];
  error?: string;
}

// TODO: https://docs.ton.org/develop/dapps/cookbook#how-to-find-transaction-for-a-certain-ton-connect-result
export async function verifyTx(msgHash: string, txHash: string) {
  let retries = 7;
  let delay = 3000;
  for (let attempt = 1; attempt <= retries; attempt++) {
    let response: fetch.Response;
    try {
      // console.log('fetchTxWithRetry hash ', hash);
      if (attempt % 2 === 0) {
        response = await fetch(
          `https://toncenter.com/api/v3/transactions?direction=in&hash=${txHash}&limit=128&offset=0`
        );
      } else {
        response = await fetch(
          `https://toncenter.com/api/v3/transactionsByMessage?direction=in&msg_hash=${msgHash}&limit=128&offset=0`
        );
      }

      if (response.ok) {
        const resp = (await response.json()) as ApiResponse;
        if (resp.transactions.length === 0) {
        }
        const data = {
          value: resp.transactions[0].out_msgs[0].value,
          sender: resp.transactions[0].out_msgs[0].source,
        };
        console.log("success: response data ", data);

        return data;
        // If the request is successful, return the response
      } else if (response.status === 429) {
        throw new Error("Too Many Requests"); // Throw an error for status 429 to trigger retry
      } else {
        throw new Error(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      if (attempt < retries) {
        console.log(
          `Attempt ${attempt} failed. Retrying in ${
            (delay * 2) / 1000
          } seconds...`
        );
        console.log(error);
        delay *= 2;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.log("All attempts failed.");
        throw error; // Re-throw the error after the last attempt
      }
    }
  }
}
