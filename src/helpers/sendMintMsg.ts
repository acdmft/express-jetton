import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { beginCell, Address, toNano } from "@ton/ton";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function sendMintMsg(reciever: Address, jAmount: bigint) {
  const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
    apiKey: "",
  });

  let mnemonics = process.env.MINTER_ADMIN!.split(" ");
  let keyPair = await mnemonicToPrivateKey(mnemonics);

  let workchain = 0; // Usually you need a workchain 0
  let wallet = WalletContractV4.create({
    workchain,
    publicKey: keyPair.publicKey,
  });
  let contract = client.open(wallet);
  const wallet_a = Address.parse(process.env.WALLET_A!);
  // const wallet_b = Address.parse(process.env.WALLET_B);
  const j_minter = Address.parse(process.env.J_MASTER!);
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
    sendMode: 2,
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
    .storeAddress(wallet_a) // Destination address
    .storeCoins(0) // Import Fee
    .storeBit(0) // No State Init
    .storeBit(1) // We store Message Body as a reference
    .storeRef(transfer) // Store Message Body as a reference
    .endCell();

  const msgBoc = externalMessage.toBoc().toString("base64");
  console.log("transfer boc ", msgBoc);
  await sendBocWithRetry(msgBoc, toncenterApiBaseUrl, 3, 3, 3000);
}

async function sendBocWithRetry(
  boc: string,
  apiUrl: string,
  retries: number,
  maxRetries: number,
  delayBetweenRetries: number
) {
  const access_token = process.env.GETBLOCK_KEY!;
  try {
    const result = await fetch(
      `https://go.getblock.io/${access_token}/jsonRPC`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "sendBoc",
          id: "getblock.io",
          params: {
            boc: boc,
          },
        }),
      }
    );
    console.log("result ", await result.json());
    if (!result.ok) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenRetries));
      await sendBocWithRetry(
        boc,
        apiUrl,
        retries - 1,
        maxRetries,
        delayBetweenRetries
      );
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
        delayBetweenRetries
      );
    } else {
      console.error("Failed to send BOC after multiple attempts");
    }
  }
}

export default sendMintMsg;
// main().finally(() => {
//   setTimeout(() => {
//     console.log("Exiting ... ");
//   }, 2500);
// });
