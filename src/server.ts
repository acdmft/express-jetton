import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes';
import dotenv from 'dotenv';
import jettonMinter from './workers/jettonMinter'
import txVerifier from './workers/txVerifier';
dotenv.config();

const app = express();
app.use(bodyParser.json());
const corsOptions = {
    origin: process.env.ALLOWED_URL, // or use an array for multiple origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // allowed headers
    // credentials: true, // if credentials (cookies, authorization headers) are needed
  };
app.use(cors(corsOptions));

app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    txVerifier().catch((e) => console.error("txVerifier worker encountered error: ", e));
    jettonMinter().catch((e) => console.error("jettonMinter Worker encountered error: ", e));
})