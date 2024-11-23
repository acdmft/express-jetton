import fetch from "node-fetch";
import dotenv from "dotenv";
import { Transaction } from "../models/transaction";
dotenv.config();

interface AddressBookEntry {
  user_friendly: string;
}

// Define the main response interface
interface ApiResponse {
  transactions: Transaction[];
  address_book: {
    [address: string]: AddressBookEntry;
  };
}

export async function retrieveNewTransactions(startTime: number) {
  const adminAddress = process.env.MINTER_ADMIN_WALLET!;
  let resultObj: ApiResponse;
  console.log('retrieveNewTransactions startTime ', startTime);
  try {
    let result = await fetch(
      `https://toncenter.com/api/v3/transactions?account=${adminAddress}&start_utime=${startTime}&limit=4&offset=0&archival=false&sort=asc`
    );
    // console.log('fetch toncenter result ', result);
    if (result.ok) {
      resultObj = await result.json();
      // console.log('transactions ', transactions);
      return resultObj.transactions;
    } else {
      throw new Error("error during fetching toncenter");
    }
  } catch (e) {
    console.log("Fetch error : ", e);
    return [];
  }
}
