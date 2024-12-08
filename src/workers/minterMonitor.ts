import { retrieveNewTransactions } from "../helpers/minterAdmin";
import dotenv from "dotenv";
import { collateTransactions } from "../helpers/queryDb";
dotenv.config();

async function minterMonitor() {
  // retrieve new transactions from minter admin address
  let startTime = parseInt(process.env.MONITOR_START_TIME!);
  while (true) {
    let initialDelay = 1000 * 60; // 1 minute
    let counter = 10;
    if (counter >= 10) {
      await new Promise((resolve) => setTimeout(resolve, initialDelay));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    const newTransactions = await retrieveNewTransactions(startTime);
    // console.log('newTransactions ', newTransactions);
    if (newTransactions && newTransactions.length > 0) {
      counter = 0;
      // iterate transactions and query database to check if they've been already inserted
      let newStartTime = await collateTransactions(newTransactions, startTime);
      if (typeof newStartTime === "number") {
        startTime = newStartTime;
      }
    } else {
      console.log("Monitor message: no new transactions detected");
      counter++;
      continue;
    }
    continue;
  }
}

export default minterMonitor;
