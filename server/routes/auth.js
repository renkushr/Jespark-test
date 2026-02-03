import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerValidator, loginValidator, lineLoginValidator } from '../middleware/validator.js';

const router = express.Router();

// Register
router.post('/register', authLimiter, registerValidator, async (req, res) => {
  try {
    const { email, password, name, phone, birthDate } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const memberSince = new Date().getFullYear().toString();
    const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&size=200&background=13ec13&color=111811';

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        birth_date: birthDate || null,
        member_since: memberSince,
        avatar: defaultAvatar,
        tier: 'Member',
        points: 0,
        wallet_balance: 0
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const token = jwt.sign(
      { userId: newUser.id, email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      userId: newUser.id
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', authLimiter, loginValidator, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        memberSince: user.member_since,
        points: user.points,
        walletBalance: user.wallet_balance,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LINE Login
router.post('/line-login', authLimiter, lineLoginValidator, async (req, res) => {
  try {
    const { lineId, name, email, pictureUrl, statusMessage } = req.body;

    if (!lineId || !name) {
      return res.status(400).json({ error: 'LINE ID and name are required' });
    }

    // Find user by LINE ID
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('line_id', lineId)
      .single();

    if (!user) {
      // สร้าง user ใหม่จากข้อมูล LINE profile
      const memberSince = new Date().getFullYear().toString();
      const avatar = pictureUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&size=200&background=13ec13&color=111811';
      const defaultPassword = await bcrypt.hash('line_' + lineId, 10);

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          line_id: lineId,
          email: email || `line_${lineId}@jespark.com`,
          password: defaultPassword,
          name,
          member_since: memberSince,
          avatar: avatar,
          tier: 'Member',
          points: 0,
          wallet_balance: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;
      user = newUser;
    } else {
      // อัปเดตข้อมูล profile จาก LINE (ถ้ามีการเปลี่ยนแปลง)
      const updates = {};
      if (name && name !== user.name) updates.name = name;
      if (pictureUrl && pictureUrl !== user.avatar) updates.avatar = pictureUrl;
      if (email && email !== user.email) updates.email = email;
      
      if (Object.keys(updates).length > 0) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        user = updatedUser;
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'LINE login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        memberSince: user.member_since,
        points: user.points,
        walletBalance: user.wallet_balance,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('LINE login error:', error);
    const message = process.env.NODE_ENV === 'development' && error.message
      ? error.message
      : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

export default router;
