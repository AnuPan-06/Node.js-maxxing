import 'dotenv/config';
import express from 'express';
import { calculateArea, PI } from './math.js'
import mongoose from 'mongoose';

const app = express();

const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB } = process.env;
if (!MONGO_USER || !MONGO_PASS || !MONGO_HOST) {
    console.error("❌ ขาดการตั้งค่า Environment Variables ในไฟล์ .env");
    process.exit(1); 
}
const user = encodeURIComponent(MONGO_USER);
const pass = encodeURIComponent(MONGO_PASS);
const mongoURI = `mongodb://${user}:${pass}@${MONGO_HOST}:27017/${MONGO_DB}?authSource=admin`;

//Logs/models
const logSchema = new mongoose.Schema({
    experiment: String,
    radius: Number,
    result: Number,
    createdAt: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB...'))
    .catch(err => console.error('❌ Could not connect to MongoDB...', err));

const PORT = process.env.PORT;

app.use(express.json());



// Middleware สำหรับ Log ข้อมูล
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] มีคนเรียกเข้าที่: ${req.url}`);
    next(); // สำคัญมาก! ต้องเรียก next() เพื่อให้ไปทำงานที่ Route ต่อไป
});


app.use(express.static('public'));


// ลองสร้าง Route ใหม่สำหรับคำนวณฟิสิกส์ง่ายๆ
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
    const { username, password } = req.body; // ดึงค่าจากสิ่งที่ส่งมา
    if (username === 'admin' && password === '1234') {
        res.send('ล็อกอินสำเร็จ!');
    } else {
        res.status(401).send('รหัสผ่านผิด!');
    }
});

app.post('/compute-physics', (req, res) => {
    // รับค่าจาก Body (สมมติว่าเป็นมวลกับความเร่ง)
    const { mass, acceleration } = req.body;
    
    // คำนวณกฎของนิวตัน F = ma
    const force = mass * acceleration;
    
    res.json({
        formula: "F = ma",
        result: force,
        unit: "Newton",
        message: `แรงที่ใช้คือ ${force} นิวตัน`
    });
});

app.post('/api/calculate', async (req, res) => {
    const { radius } = req.body;

    if (!radius || radius <= 0) {
        return res.status(400).json({ error: "Invalid radius" });
    }

    const area = calculateArea(radius);

    try {
        // 3. บันทึกลง MongoDB
        const newLog = new Log({
            experiment: "Circle Area Calculation",
            radius: radius,
            result: area
        });
        
        await newLog.save(); // บันทึกจริงลง DB

        // 4. ส่งคำตอบกลับไปหน้าบ้าน
        res.json({ result: area, status: "Saved to DB" });
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }

});



// ดึงข้อมูลทั้งหมดจาก MongoDB ออกมา
app.get('/api/history', async (req, res) => {
    try {
        const history = await Log.find().sort({ createdAt: -1 }); // ดึงข้อมูลและเรียงจากใหม่ไปเก่า
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// สั่งให้ Server เริ่มทำงาน
app.listen(PORT, () => {
    console.log(`🚀 Server กำลังรันอยู่ที่ http://localhost:${PORT}`);
});
