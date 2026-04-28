import express from 'express';
import { calculateArea, PI } from './math.js'

const app = express();
const port = 3000;

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

// สั่งให้ Server เริ่มทำงาน
app.listen(port, () => {
    console.log(`🚀 Server กำลังรันอยู่ที่ http://localhost:${port}`);
});
