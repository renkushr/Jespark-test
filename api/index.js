/**
 * Vercel Serverless Function — ใช้ Express app จาก server เป็น API
 * Request ไปที่ /api/* จะถูกส่งมาที่ function นี้
 */
import app from '../server/server.js';

export default function handler(req, res) {
  return app(req, res);
}
