import { Address, toNano } from "@ton/ton";
import { getRowsForMinter, setMintResultHash } from "../helpers/queryDb";
import dotenv from "dotenv";
import sendMintMsg from "../helpers/sendMintMsg";
dotenv.config();

function calculateJettonAmount(value: string): bigint {
  const tonsForjettons = BigInt(value) - toNano(process.env.TRANSACTION_FEES!);
  const jettonAmount = tonsForjettons / toNano(process.env.JETTON_PRICE!);
  return jettonAmount;
}

async function jettonMinter() {
  while (true) {
    let initialDelay = 1000 * 30; // 30 seconds
    let counter = 10;
    if (counter >= 10) {
      await new Promise((resolve) => setTimeout(resolve, initialDelay));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }
    const unprocessedRows = await getRowsForMinter();
    // console.log('unprocessedRows ', unprocessedRows);
    if (unprocessedRows.length === 0) {
      console.log("Minter message: No verified rows found, waiting...");
      counter++;
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }
    console.log('some processed rows counter = 0')
    for (const row of unprocessedRows) {
      let jAmount: bigint;
      let mintResult: any;
      try {
        console.log("row.amount ", row.amount);
        jAmount = calculateJettonAmount(row.amount);
        console.log("jetton amount: ", jAmount);
        // console.log("sender ", row.sender);
      } catch (e) {
        console.log("calculateJettonAmount error ");
        await setMintResultHash(row.id, "error");
        continue;
      }

      try {
        let senderAddress = Address.parse(row.sender).toString({
          bounceable: false,
        });
        // console.log('senderAddress ', senderAddress);
        // const sender = Address.parse(senderAddress);
        let senderNonBuonceAddress = Address.parseFriendly(senderAddress);
        console.log("sender address ", senderNonBuonceAddress.address);
        // await sendMintMsg(senderNonBuonceAddress.address, jAmount);
        if (jAmount > 0) {
          mintResult = await sendMintMsg(
            senderNonBuonceAddress.address,
            jAmount
          );
        } else {
          await setMintResultHash(row.id, "not_enough_tons");
        }
        console.log("jettonMinter sendMintMsg result ", mintResult);
      } catch (error) {
        console.log("Error during sending mint message: ", error);
        await setMintResultHash(row.id, "error");
        continue;
      }
      if (mintResult.result) {
        await setMintResultHash(row.id, mintResult.result?.hash);
      } else {
        await setMintResultHash(row.id, "error");
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

export default jettonMinter;
