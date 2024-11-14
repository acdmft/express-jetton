import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { beginCell, Address, toNano } from "@ton/ton";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function sendMintMsg(reciever: Address, jAmount: bigint) {
  console.log('sendMintMsg');
  const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
    apiKey: "",
  });

  let mnemonics = process.env.MINTER_ADMIN!.split(" ");
  let keyPair = await mnemonicToPrivateKey(mnemonics);

  let workchain = 0; // Usually you need a workchain 0
  let minter_admin_wallet = WalletContractV4.create({
    workchain,
    publicKey: keyPair.publicKey,
  });
  let contract = client.open(minter_admin_wallet);
  const minterAdminAddress = Address.parse(process.env.MINTER_ADMIN_WALLET!);
  const j_minter = Address.parse(process.env.J_MASTER_ADDRESS!);
  const toncenterApiBaseUrl = "https://toncenter.com/api/v2";

  let seqno = await contract.getSeqno();

  const mintMsg = beginCell()
    .storeUint(21, 32)
    .storeUint(0, 64) // op, queryId
    .storeAddress(reciever) // to
    .storeCoins(jAmount) // jetton amount
    .storeCoins(toNano("0")) // forward_ton_amount
    .storeCoins(toNano("0.06")) // total_ton_amount
    .endCell();

  let transfer = contract.createTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    sendMode: 2, // TO DO define right mode
    messages: [
      internal({
        value: "0.096",
        to: j_minter, // jetton_wallet
        body: mintMsg,
        bounce: true,
      }),
    ],
  });

  let externalMessage = beginCell()
    .storeUint(0b10, 2) // 0b10 -> 10 in binary
    .storeUint(0, 2) // src -> addr_none
    .storeAddress(minterAdminAddress) // Destination address
    .storeCoins(0) // Import Fee
    .storeBit(0) // No State Init
    .storeBit(1) // We store Message Body as a reference
    .storeRef(transfer) // Store Message Body as a reference
    .endCell();

  const msgBoc = externalMessage.toBoc().toString("base64");
  // console.log('transfer boc hex', externalMessage.toBoc().toString('hex'));
  // console.log("transfer boc ", msgBoc);
  // console.log('mint msg hex', mintMsg.toBoc().toString('hex'));
  // console.log('mint msg base64', mintMsg.toBoc().toString('base64'));
  await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds before calling next function
  const result = await sendBocWithRetry(msgBoc, toncenterApiBaseUrl, 3, 3, 2000); 
  return result;
    
}

async function sendBocWithRetry(
  boc: string,
  apiUrl: string,
  retries: number,
  maxRetries: number,
  delayBetweenRetries: number
) {
  // const access_token = process.env.GETBLOCK_KEY!;
  const toncenterApiBaseUrl = "https://toncenter.com/api/v2";
  try {
    let result = await fetch(`${toncenterApiBaseUrl}/sendBocReturnHash`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boc: boc,
      }),
    });
    result = await result.json();
    console.log("sendBocWithRetries result ", result);
    if (!result.ok) {
      if (retries <= 0) {
        console.log('error during sending mint message');
        return;
      }
      console.log('sendBocWithRetry retries', retries);
      await new Promise((resolve) => setTimeout(resolve, delayBetweenRetries));
      await sendBocWithRetry(
        boc,
        apiUrl,
        retries - 1,
        maxRetries,
        delayBetweenRetries
      );
    } else {
      return result;
    }
  } catch (error) {
    console.error("Error sending BOC:", error);
    if (retries > 0) {
      console.log(`Retrying... (${maxRetries - retries + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delayBetweenRetries));
      await sendBocWithRetry(
        boc,
        apiUrl,
        retries - 1,
        maxRetries,
        delayBetweenRetries * 2 // increase delay between fetches
      );
    } else {
      console.error("Failed to send BOC after multiple attempts");
      return;
    }
  }
}

export default sendMintMsg;
// main().finally(() => {
//   setTimeout(() => {
//     console.log("Exiting ... ");
//   }, 2500);
// });
