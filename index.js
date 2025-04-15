const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path"); // Corrected path require
const pm2 = require('pm2');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    maxHttpBufferSize: 10 * 1024 * 1024, // 10MB limit for buffer size
    /*cors: {
        origin: "*", // Allow all origins for simplicity, adjust as needed for security
        methods: ["GET", "POST"]
    }*/
});

app.use(cors()); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// --- PM2 Setup ---
// Map to store relationship between process name (data.num) and socket ID
const processSocketMap = new Map();

// Connect to PM2 once when the application starts
pm2.connect((err) => {
    if (err) {
        console.error('PM2 connection error:', err);
        process.exit(2);
    }
    console.log('Connected to PM2');

    // --- PM2 Message Bus Listener ---
    // Listen for messages from any PM2 process managed by this instance
    pm2.launchBus((err, bus) => {
        if (err) {
            console.error("PM2 Bus error:", err);
            return; // Exit if bus fails
        }
        console.log('PM2 Bus connected');

        bus.on("process:msg", (packet) => {
            // packet contains { process: { pm_id, name }, raw: data }
            const processName = packet.process.name;
            const messageData = packet.raw; // Data sent from log.js using process.send()

            console.log(`Message from PM2 process [${processName}]:`, messageData);
            if(messageData.end){
                pm2.delete(processName, (err) => {
                    if (err) {
                        console.error(`last............ 🛑 Error deleting process:`, err);
                    } else {
                        console.log(`✅ Process deleted successfully.`);
                        
                    }
                    });

                return
            }
            // Find the socket associated with this process name
            const socketId = processSocketMap.get(processName);

            if (socketId) {
                if(messageData.msg == 1){
                   // io.to(socketId).emit("code", { msg: 'Successfully updated Whatsapp profile picture☺👍', re:true });
                   pm2.delete(processName, (err) => {
                    if (err) {
                        console.error(`🛑 Error deleting process:`, err);
                    } else {
                        console.log(`✅ Process deleted successfully.`);
                        pm2.start({
                            script: 'send.js', // Path to the child script
                            name: processName, // Use data.num as the unique name
                            args: [processName], // Pass arguments (will be process.argv[2] and [3] in log.js)
                            autorestart: true, // Disable auto-restart, manage manually if needed
                            exec_mode: 'fork', // Use fork mode for single instance per start command
                            // max_memory_restart: '100M' // Optional: Limit memory
                        }, (startErr, apps) => { // Note: apps is an array
                            if (startErr) {
                                console.error(`Error starting bot ${processName}:`, startErr);
                                // Send error back to the specific client
                                io.to(socketId).emit("error", { message: `Failed to start bot ${processName}.` });
                            } else {
                                console.log(`Bot [${processName}] started successfully for socket [${socketId}]. PM2 ID: ${apps[0].pm2_env.pm_id}`);
                                // Store the mapping between process name and socket ID
                                //processSocketMap.set(processName, socketId);
                                setInterval(() => {
                                        pm2.delete(processName);
                                        io.to(socketId).emit("code", { msg: `Successfully updated Whatsapp profile picture☺👍 (reload and reuse)` });

                                }, 30000);
                                // Send success confirmation back to the client
                                io.to(socketId).emit("code", { msg: `Successfully updated Whatsapp profile picture☺👍 (loading...)` });
                            }
                        });
                    }
                    });

                   return
                }
                // Emit the message specifically to the correct client socket
                io.to(socketId).emit("code", messageData); // Use a general 'message' event
                console.log(`Emitted message to socket [${socketId}]`);
            } else {
                console.warn(`No active socket found for process name [${processName}]. Message ignored.`);
                // Optional: Stop the orphaned process if no socket is found
                // pm2.stop(processName, (stopErr) => { ... });
            }
        });

        // Listen for process exit events to clean up the map
        /*bus.on('process:event', (packet) => {
            if (packet.event === 'exit' && packet.process && packet.process.name) {
                const processName = packet.process.name;
                if (processSocketMap.has(processName)) {
                    console.log(`PM2 process [${processName}] exited. Removing from map.`);
                    processSocketMap.delete(processName);
                }
            }
        });*/
    });
});

// Function to start a PM2 process for a given task
function pm2start(data, socketId) {
    // Use data.num as the unique process name
    const processName = String(data.num); // Ensure it's a string

    // Check if a process with this name is already running
    pm2.describe(processName, (err, description) => {
        if (err && !err.message.includes('process name not found')) { // Ignore 'not found' error, handle others
             console.error(`Error describing PM2 process [${processName}]:`, err);
             io.to(socketId).emit("error", { message: `Failed to check status for bot ${processName}.` });
             return;
        }

        if (description && description.length > 0 && description[0].pm2_env.status === 'online') {
            //console.log(`Bot [${processName}] is already running.`);
            //io.to(socketId).emit("status", { message: `Bot ${processName} is already running.` });
            // Update map in case the socket reconnected
            //processSocketMap.set(processName, socketId);
            //return; // Don't start if already running
        }

        // Start the new process
        console.log(`Attempting to start PM2 process [${processName}] for socket [${socketId}]`);
        const base64Image = data.img.split(',')[1];
        const imgBuffer = Buffer.from(base64Image, 'base64');
        const dir = path.join(__dirname, 'temp');
        const imgPath = path.join(dir, `${data.num}.jpg`);
        fs.writeFileSync(imgPath, imgBuffer);
        pm2.start({
            script: 'log.js', // Path to the child script
            name: processName, // Use data.num as the unique name
            args: [data.num, imgPath], // Pass arguments (will be process.argv[2] and [3] in log.js)
            autorestart: true, // Disable auto-restart, manage manually if needed
            exec_mode: 'fork', // Use fork mode for single instance per start command
            // max_memory_restart: '100M' // Optional: Limit memory
        }, (startErr, apps) => { // Note: apps is an array
            if (startErr) {
                console.error(`Error starting bot ${processName}:`, startErr);
                // Send error back to the specific client
                io.to(socketId).emit("error", { message: `Failed to start bot ${processName}.` });
            } else {
                console.log(`Bot [${processName}] started successfully for socket [${socketId}]. PM2 ID: ${apps[0].pm2_env.pm_id}`);
                // Store the mapping between process name and socket ID
                processSocketMap.set(processName, socketId);
                // Send success confirmation back to the client
                io.to(socketId).emit("status", { message: `Bot ${processName} started successfully.` });
            }
        });
    });
}



// --- Socket.IO Connection Handling ---
io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // Listener for starting the bot process
    socket.on("start", (data) => {
        console.log(`Received 'start' event from [${socket.id}] with data:`, data);
        if (data && data.num) {
            pm2start(data, socket.id); // Pass socket.id for mapping
        } else {
            socket.emit("error", { message: "Missing 'num' in start data." });
        }
    });

    
    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
        // Find if this socket was associated with any process and stop it
        /*let associatedProcessName = null;
        for (const [name, id] of processSocketMap.entries()) {
            if (id === socket.id) {
                associatedProcessName = name;
                break;
            }
        }

        if (associatedProcessName) {
            console.log(`Socket [${socket.id}] disconnected, stopping associated process [${associatedProcessName}]`);
            //pm2stop(associatedProcessName, null); // Stop the process, don't need to emit back to disconnected socket
        } else {
             console.log(`Socket [${socket.id}] disconnected, no associated process found.`);
        }*/
    });
});



// --- Server Start ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
