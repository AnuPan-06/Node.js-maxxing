import 'dotenv/config';
import express from 'express';
import { calculateArea, PI } from './math.js'
// import mongoose from 'mongoose';
import mysql from 'mysql2/promise'

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT;

// const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB } = process.env;
// if (!MONGO_USER || !MONGO_PASS || !MONGO_HOST) {
//     console.error("❌ ขาดการตั้งค่า Environment Variables ในไฟล์ .env");
//     process.exit(1); 
// }
// const user = encodeURIComponent(MONGO_USER);
// const pass = encodeURIComponent(MONGO_PASS);
// const mongoURI = `mongodb://${user}:${pass}@${MONGO_HOST}:27017/${MONGO_DB}?authSource=admin`;

// //Logs/models
// const logSchema = new mongoose.Schema({
//     experiment: String,
//     radius: Number,
//     result: Number,
//     createdAt: { type: Date, default: Date.now }
// });

// const Log = mongoose.model('Log', logSchema);

// mongoose.connect(mongoURI)
//     .then(() => console.log('✅ Connected to MongoDB...'))
//     .catch(err => console.error('❌ Could not connect to MongoDB...', err));


const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10
});

pool.getConnection()
    .then(() => console.log('✅ Connected to MySQL Database Successfully!'))
    .catch(err => console.error('❌ MySQL Connection Failed:', err));

async function initDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL Database Successfully!');
        
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                radius DOUBLE NOT NULL,
                result DOUBLE NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createTableSQL);
        console.log('✅ MySQL Table "logs" is ready!');
        
        connection.release();
    } catch (err) {
        console.error('❌ MySQL Initialization Failed:', err);
    }
}

initDatabase();

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] มีคนเรียกเข้าที่: ${req.url}`);
    next();
});


app.get('/status', (req, res) => {
    res.json({
        status: "online",
        message: "Server is running smoothly",
        timestamp: new Date()
    });
});

app.get('/calculate/:radius', (req,res) => {
    const r =  req.params.radius;
    const area = calculateArea(r);
    res.send(`Circle radius ${r} has an area ${area}`);

});

app.post('/login', (req, res) => {
    const { username, password } = req.body; 
    if (username === 'admin' && password === '1234') {
        res.send('ล็อกอินสำเร็จ!');
    } else {
        res.status(401).send('รหัสผ่านผิด!');
    }
});

app.post('/compute-physics', (req, res) => {
    const { mass, acceleration } = req.body;
    
    const force = mass * acceleration;
    
    res.json({
        formula: "F = ma",
        result: force,
        unit: "Newton",
        message: `แรงที่ใช้คือ ${force} นิวตัน`
    });
});

// app.post('/api/calculate', async (req, res) => {
//     const { radius } = req.body;

//     if (!radius || radius <= 0) {
//         return res.status(400).json({ error: "Invalid radius" });
//     }

//     const area = calculateArea(radius);

//     try {
        
//         const newLog = new Log({
//             experiment: "Circle Area Calculation",
//             radius: radius,
//             result: area
//         });
        
//         await newLog.save();

//         res.json({ result: area, status: "Saved to DB" });
//     } catch (error) {
//         res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
//     }

// });

// app.get('/api/history', async (req, res) => {
//     try {
//         const history = await Log.find().sort({ createdAt: -1 });
//         res.json(history);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

app.post('/api/calculate', async (req, res) => {
    const { radius } = req.body;
    if (!radius || radius <= 0) return res.status(400).json({ error: "Invalid radius" });

    const area = calculateArea(radius);

    try {
        const sql = 'INSERT INTO `logs` (`radius`, `result`) VALUES (?, ?)';
        await pool.query(sql, [radius, area]);

        res.json({ result: area, status: "Saved to MySQL" });
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }
});

app.get('/api/history', async (req, res) => {
    try {

        const [rows] = await pool.query('SELECT * FROM logs ORDER BY createdAt');
        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server กำลังรันอยู่ที่ http://localhost:${PORT}`);
});
