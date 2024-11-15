import { Request, Response, NextFunction } from 'express';
import fetch from "node-fetch";
import { Transaction } from '../models/transaction';

import dotenv from 'dotenv';

dotenv.config();

interface ApiResponse {
    transactions: Transaction[],
    error?: string
}

export async function verifyTx(req: Request, res: Response, next: NextFunction) {

    const { msgHash, txHash, comment } = req.body;
    console.log('msgHash , txHash, comment ', msgHash, txHash, comment);
    try {
        // hash string must be escaped one time, don't escape in the for cycle
        // first attempt is too early usually,tx needs time to be confirmed and recorded in blockchain 
        const data = await fetchTxWithRetry(encodeURIComponent(msgHash), txHash);
        // console.log('verifyTx data ', data);
        if (data) {
            // console.log('data2 ', data,  data.transactions[0].out_msgs[0].value,data.transactions[0].out_msgs[0].source);
            req.body.txData = {
                msg_value: data.value,
                sender: data.sender
            }
            next();
        } else {
            res.status(500).json({ message: 'Server error!'});
        }
    } catch (error) {
        if (error instanceof TypeError) {
            res.status(404).json({ message: 'Transaction not found or not confirmed.' });
        } else {
            res.status(500).json({ message: 'Error confirming transaction.' , error: error })
        }
    }
}
// TODO: https://docs.ton.org/develop/dapps/cookbook#how-to-find-transaction-for-a-certain-ton-connect-result
async function fetchTxWithRetry(msgHash: string, txHash: string, retries = 5, minDelay = 3000, maxDelay = 7000) {
    let delay = 3000;
    for (let attempt = 1; attempt <= retries; attempt++) {
        let response: fetch.Response;
        try {
            // console.log('fetchTxWithRetry hash ', hash);
            if (attempt % 2 === 0) {
                response = await fetch(`https://toncenter.com/api/v3/transactions?direction=in&hash=${txHash}&limit=128&offset=0`);
            } else {
                response = await fetch(`https://toncenter.com/api/v3/transactionsByMessage?direction=in&msg_hash=${msgHash}&limit=128&offset=0`);
            }

            if (response.ok) {
                const resp = (await response.json()) as ApiResponse;
                // if (data.transactions.length === 0) {
                //     throw new Error('Transaction not found');
                // }
                const data = {value: resp.transactions[0].out_msgs[0].value, sender: resp.transactions[0].out_msgs[0].source}
                console.log('success: response data ', data);
                
                return data;
                    // msg_value: data.transactions[0].out_msgs[0].value,
                    // sender: data.transactions[0].out_msgs[0].source
                
                    // If the request is successful, return the response
            } else if (response.status === 429) {
                throw new Error('Too Many Requests'); // Throw an error for status 429 to trigger retry
            } else {
                throw new Error(`Request failed with status code ${response.status}`);
            }
        } catch (error) {
            if (attempt < retries) {
                const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                console.log(`Attempt ${attempt} failed. Retrying in ${delay * 2 / 1000} seconds...`);
                console.log(error)
                delay *= 2;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.log('All attempts failed.');
                throw error; // Re-throw the error after the last attempt
            }
        }
    }
} 