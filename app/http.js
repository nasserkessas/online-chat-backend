import * as http from 'http';
import { readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import * as dotenv from 'dotenv'

dotenv.config();

const require = createRequire(import.meta.url);

const codeLen = 8;


const requestListener = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

    switch (req.url) {
        case "/code":
            if (req.method == "GET") {
                res.writeHead(200);

                let code = generateCode()

                const f = readFileSync(require.resolve("./codes.json"));
                let data = JSON.parse(f);

                data[code] = [];

                writeFileSync(require.resolve("./codes.json"), JSON.stringify(data));

                res.end(`{"code": "${code}"}`);
            }
            else if (req.method == "POST") {

                let body = "";

                req.on('readable', () => {
                    let buff = req.read()
                    if (buff !== null) {
                        body += buff
                    }
                });

                req.on('end', () => {

                    const code = JSON.parse(body).code;

                    const f = readFileSync(require.resolve("./codes.json"));
                    const data = JSON.parse(f);

                    if (data.find((c) => c === code)) {
                        res.writeHead(200);
                        res.end(`{"message": "valid code"}`);
                    }
                    else {
                        res.writeHead(403);
                        res.end(`{"error": "invalid code"}`);
                    }
                })
                

            }
            else {
                res.writeHead(404);
                res.end(`{"error": "Cannot ${req.method} \"${req.url}\""}`)
            }
            break;
    }
};

const generateCode = () => {
    return "abcdefghijklmnopqrstuvwxyzABSCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('').sort(() => { return 0.5 - Math.random() }).join('').slice(0, codeLen);
}

const currentDir = dirname(fileURLToPath(import.meta.url));

try {
    writeFileSync(`${currentDir}/codes.json`, "{}", { flag: 'wx' })
}
catch (e) {}

const server = http.createServer(requestListener);
server.listen(process.env.HTTP_PORT || 8000, () => {
    console.log(`Server is running on http://localhost:${process.env.HTTP_PORT || 8000}`);
});
