import { Address, toNano } from "@ton/ton";
import { getRowsForMinter, setMintResultHash } from "../helpers/queryDb";
import dotenv from "dotenv";
import sendMintMsg from "../helpers/sendMintMsg";
dotenv.config();

function calculateJettonAmount(value: string): bigint {
  const jettonAmount = BigInt(value) / toNano(process.env.JETTON_PRICE!);
  return jettonAmount;
}

async function jettonMinter() {
  while (true) {
    const unprocessedRows = await getRowsForMinter();
    // console.log('unprocessedRows ', unprocessedRows);
    if (unprocessedRows.length === 0) {
      console.log("No unprocessed rows found, waiting...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

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
        await setMintResultHash(row.id, 'error');
        continue;
      }

      try {
        let senderAddress = Address.parse(row.sender).toString({bounceable: false});
        // console.log('senderAddress ', senderAddress);
        const sender = Address.parse(senderAddress);
        let senderNonBuonceAddress = Address.parseFriendly(senderAddress);
        // console.log('sender address ', senderNonBuonceAddress.address);
        // await sendMintMsg(senderNonBuonceAddress.address, jAmount);
        mintResult = await sendMintMsg(senderNonBuonceAddress.address, jAmount);
        console.log('jettonMinter sendMintMsg result ', mintResult);
      } catch (error) {
        console.log("Error during sending mint message: ", error);
        await setMintResultHash(row.id, 'error');
        continue;
      }
      await setMintResultHash(row, mintResult.result?.hash);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

export default jettonMinter;
