import { verifyTx } from "../helpers/txVerify";
import { getUnverifiedRows, setVerifData } from "../helpers/queryDb";

async function txVerifier() {
  while (true) {
    const unVerifiedRows = await getUnverifiedRows();
    if (unVerifiedRows.length === 0) {
      console.log("No unverified rows found, waiting...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }
    // 15 sec PAUSE 
    await new Promise((resolve) => setTimeout(resolve, 15000)); // set timeout before processing first transaction
    for (const row of unVerifiedRows) {
        let data: any;
        try {
            data = await verifyTx(row.msg_hash, row.tx_hash);
            if (data) {
                await setVerifData(row.id, data.sender, data.value);
                continue;
            }
        } catch(error) {
            await setVerifData(row.id, '', null);
            continue;
        }
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

export default txVerifier;
