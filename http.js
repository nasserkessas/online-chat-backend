import { readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv'
import express from 'express'
import bodyParser from "body-parser";
import cors from 'cors';

const app = express();

app.use(cors({origin: process.env.FRONTEND_URL}))
app.use(bodyParser.text());

dotenv.config();

const codeLen = 8;

let save_dir
if (process.env.SAVE_LOCATION == "same directory") {
    save_dir = dirname(fileURLToPath(import.meta.url));
} else {
    save_dir = "/tmp";
}

console.log(save_dir);

app.get('/code', (req, res) => {
    let code = generateCode()

    const f = readFileSync(`${save_dir}/codes.json`);
    let data = JSON.parse(f);
    console.log(data);

    data[code] = [];

    writeFileSync(`${save_dir}/codes.json`, JSON.stringify(data));

    res.status(200).send(`{"code": "${code}"}`);
})

app.post('/code', (req, res) => {
    const f = readFileSync(`${save_dir}/codes.json`);
    const data = JSON.parse(f);

    if (Object.keys(data).find(c => c === JSON.parse(req.body).code)) {
        res.status(200).send(`{"message": "valid code"}`);
    }
    else {
        res.status(403).send(`{"error": "invalid code"}`);
    }
})


const generateCode = () => {
    return "abcdefghijklmnopqrstuvwxyzABSCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('').sort(() => { return 0.5 - Math.random() }).join('').slice(0, codeLen);
}

try {
    writeFileSync(`${save_dir}/codes.json`, "{}", { flag: 'wx' })
}
catch (e) {}

app.listen(process.env.HTTP_PORT || 8000, () => { console.log(`Server is running on http://localhost:${process.env.HTTP_PORT || 8000}`)} );
