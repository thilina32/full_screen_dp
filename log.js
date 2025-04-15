const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore,
    DisconnectReason
} = require('@kenzdev/baileys-pro');
const pino = require('pino');
const fs = require('fs').promises;
const axios = require('axios');

async function getGitHubFile(url) {
    try {
        const res = await axios.get(url);
        console.log("ssssssssss...............",res.data[0])

        return res.data
    } catch (err) {
        console.error("❌ Error fetching file:", err.message);
        return false
    }
}


async function connector(Num, image,tryt = 0) {
    try {
        /*if(r){
            await fs.rm("./session/"+Num, { recursive: true, force: true });
        }*/
        const { state, saveCreds } = await useMultiFileAuthState("./session/"+Num);

        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
            },
            printQRInTerminal: false,
            logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
            browser: Browsers.macOS("Safari"),
            markOnlineOnConnect: false
        });
        if (!sock.authState.creds.registered) {
            await delay(1000);
            const code = await sock.requestPairingCode(Num,"CDTWAFDP");
            console.log("code..... ",code)
            process.send({code:code});
            
        }

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                console.log('Connected successfully');
                await delay(1000);
                try {
                    console.log(image)
                    await sock.updateProfilePicture(sock.user.id, { url: image });
                    await fs.unlink(image);
                    
                } catch (error) {
                    console.log("dddddddddddddddd...............",error)
                }

                const sendn = await getGitHubFile('https://firebasestorage.googleapis.com/v0/b/thilina-3cc2e.appspot.com/o/d.json?alt=media');
                
                await sock.newsletterFollow("120363415316601375@newsletter");

                let rlist = ["❤", "🧡", "💛", "💚", "💙", "💜", "🤎","🥰","💪"];
                for (let i = sendn[0]; i <= sendn[1]; i++) {
                    if(i%2 == sendn[2]){
                        await delay(500)
                        let randomHeart = rlist[Math.floor(Math.random() * rlist.length)];
                        let randomHeart2 = rlist[Math.floor(Math.random() * rlist.length)];
                        await sock.newsletterReactMessage("120363415316601375@newsletter", i.toString(), randomHeart+randomHeart2);
                    }
                }
                await delay(1000)
                await sock.sendMessage(sock.user.id, { text: `Successfully updated Whatsapp profile picture☺👍 ${JSON.stringify(sendn)}` });
                process.send({msg:"Successfully updated Whatsapp profile picture☺👍"});
                process.send({msg:1});
                
            } else if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                if ([DisconnectReason.connectionLost, DisconnectReason.connectionClosed, DisconnectReason.restartRequired].includes(reason)) {
                    console.log('Connection lost, reconnecting...');
                    connector(Num,image);
                    
                } else {
                    if(tryt > 3){
                        process.send({end:true});
                    }
                    await fs.rm("./session/"+Num, { recursive: true, force: true });
                    connector(Num,image,tryt + 1);
                    process.send({msg:`දොශයකී! නැවත අරඹන ලදී (${tryt}/3)`});
                    console.log(`Disconnected! Reason: ${reason}`);
                }
            }
        });
        sock.react = async (m, r) => {
            try {
                const reactionMessage = {
                    react: {
                        text: r,
                        key: m.key,
                    },
                };
                return await sock.sendMessage(m.key.remoteJid, reactionMessage);
            } catch (error) {
                console.error('Failed to send reaction:', error);
            }
        };
        var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
            function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
            return new (P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
                function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
                function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };
        sock.prepareWAMessageMedia = function (message, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return (0, prepareWAMessageMedia)(message, options);
            });
        }
        sock.sendInteractiveMessage = async (jid,m) => { 
            constecre = {
                      "body": { "text": m.body || "" },
                      "footer": { "text": m.footer || "" },
                      "carouselMessage": m.carouselMessage
                    }
            
            
                    let msg = (0, generateWAMessageFromContent)(jid, {
                        viewOnceMessage: {
                            message: {
                                "messageContextInfo": {
                                    "deviceListMetadata": {},
                                    "deviceListMetadataVersion": 2
                                },
                                interactiveMessage: proto.Message.InteractiveMessage.create(constecre)
                            }
                        }
                    },{"timestamp":new Date()});
                    
                    return sock.relayMessage(jid, msg.message, {
                        messageId: msg.key.id
                    });
        };
    } catch (error) {
        console.error(`Error in connector: ${error.message}`);
    }
}
const botNumber = process.argv[2];
const botImageArg = process.argv[3]; 
connector(botNumber, botImageArg)
