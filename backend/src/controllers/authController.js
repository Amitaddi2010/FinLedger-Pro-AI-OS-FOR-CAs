import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

export const authController = {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: 'User already exists' });

      const user = await User.create({ name, email, passwordHash: password, role: 'CA' });
      
      if (user) {
        generateToken(res, user._id);
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, activeCompanyId: user.activeCompanyId });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async logout(req, res) {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
  },

  async getMe(req, res) {
    res.json(req.user);
  },

  async inviteClient(req, res) {
    try {
      const { name, email, password, companyId } = req.body;
      
      // Only CAs or Admins can invite clients
      if (req.user.role === 'CLIENT') {
        return res.status(403).json({ message: 'Unauthorized. Only CAs can invite clients.' });
      }

      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: 'A user with this email already exists.' });

      const clientUser = await User.create({
        name,
        email,
        passwordHash: password,
        role: 'CLIENT',
        activeCompanyId: companyId
      });

      res.status(201).json({ 
        message: 'Client portal access granted successfully.',
        clientParams: { name: clientUser.name, email: clientUser.email, companyAssigned: companyId }
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
