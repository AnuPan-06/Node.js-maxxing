# 1. ใช้ Node.js เวอร์ชันล่าสุด (แก้ปัญหาเรื่อง crypto ที่คุณเจอ)
FROM node:20-slim

# 2. สร้างโฟลเดอร์สำหรับเก็บแอปใน Container
WORKDIR /app

# 3. ก๊อปปี้ไฟล์ใบสั่งของ (package.json) เข้าไปก่อน
# ที่ต้องก๊อปปี้แยก เพราะ Docker จะได้จำ Cache ของการลง Library ไว้ (เร็วขึ้น)
COPY package*.json ./

# 4. ติดตั้ง Library ทั้งหมด
RUN npm install

# 5. ก๊อปปี้ไฟล์ที่เหลือทั้งหมดในโปรเจกต์เข้าไป
COPY . .

# 6. บอกว่าแอปเราจะรันที่ Port 3000
EXPOSE 3000

# 7. คำสั่งที่ใช้เริ่มรันแอป
CMD ["node", "server.js"]