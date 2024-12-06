# Express-ton-server

## Description 
This is the back-end part of the [FFX Crypto project](https://github.com/ffx-crypto). 
The application implements an ICO functionality. Users can buy jettons by sending tons on the admin address.  

## Project structure 
- `src` source code
    - `server.ts`- application entry point 
    - `routes.ts` - contains application API endpoints
    - `config` - folder contains configuration file responsible for creating connection pool with posgtresql
    - `controllers` - encapsulates request handling logic
    - `helpers` - folder with files providing functions to interact with database and external ton api
    - `middleware` - contains function that intercepts requests and executes custom logic (verification of the request parameters)
    - `models` - folder with **data models** that represent the structure of the application data
    - `workers` - files that implement background long running tasks that are executed periodically
- `dist` compiled code

## Functionality
Server handles requests form users using **txController**. It retrieves `comment`, `txHash` and `msgHash` from the request body and then inserts them into the database.
This data will be used by two **workers**: 
1. **minterMonitor** worker sends requests to the TON blockchain using [toncenter api](https://toncenter.com/api/v3/index.html). It monitors if there are new incoming transactions on the **jetton minter admin** address. New transactions are checked in the database using `trace_id` and `txHash`. Confirmed transactions then recieve *verified=True* status. 
2. **jettonMinter** worker quries database to get rows with verified transactions records. It uses values of the *sender* and *amount* columns to compile and send a message to the **jetton minter admin**. This is done using **sendMintMsg** that assembles external message with embedded internal message containing *mint* op code, signs it with private key and transfer it using **toncenter api**, so that user recieves corresponding amount of jettons.

## Database configuration
Server uses postgresql to store data. Create database, table and user before connect application to it.
Connect to the database: `sudo -u postgres psql` and run commands:

```sql
CREATE USER username WITH PASSWORD 'secret_password';
CREATE DATABASE db_name OWNER username;
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    msg_hash VARCHAR(44),
    tx_hash VARCHAR(64),
    comment VARCHAR(328),
    sender VARCHAR(66),
    amount VARCHAR(32),
    mint_hash VARCHAR(44),
    processed BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE
);
GRANT ALL PRIVILEGES ON DATABASE db_name TO username;
```
## Example of .env file

```
PORT=3000
DATABASE_URL=postgres://username:secret_password@localhost:5432/
ALLOWED_URL=http://localhost:5173
MINTER_ADMIN=24 mnemonic words from your wallet
MINTER_ADMIN_WALLET=UQC_wf-PEh2nC6Ltn-hCkV-KXDKqJZcqbkZIxco-eU1fdjxq
J_MASTER_ADDRESS=EQBXV8kBBo781W72YKX6Rpi_V06sDzCYwgGPyhwAEVmvQdYH
JETTON_PRICE=0.005
TRANSACTION_FEES=0.08
MONITOR_START_TIME=1733064366
```

## Usage
```sh
# install dependencies
npm install
# compile code 
npx tsc 
# run the project 
npx nodemon dist/server.js
# check database connection
node dist/config/database.js
```
## Contributing
Contributions are welcomed. 
### ToDo List:
- *anti-spam and caching system* - requests from client should pass through redis before being inserted in the postgresql 
- *health check* - as for now client doesn't check if the server is alive, which can lead to problems if server is offline 
- *batch minting* - as for now **jettonMinter** prepares and sends external message to the wallet with one embedded inner message, it will be better to send multiple inner messages instead
- *support for NFT* - now only [jetton contract](https://github.com/ffx-crypto/jetton-sc) is supported, in the future application will also include NFT exchange functionality
- support for *TMA* ([telegram mini app](https://docs.ton.org/v3/guidelines/dapps/tma/overview))
- *testing* and *improvements* - there are no unit or end2end tests for the application, also i will be happy to proposed improvemens or corrections

## LICENSE 
[LICENSE](./LICENSE)






