// controllers/authController.js

const pool = require('../../config').pool
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

// Ensure the secretKey is present
if (!secretKey) {
  console.error('JWT_SECRET is not set in the environment.');
  process.exit(1);
}

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required for sign-in.',
    });
  }

  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'The email does not exist.',
      });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // Create a JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name, createdAt: user.created_at },
        secretKey,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'User successfully signed in.',
        metadata: {
          userId: user.id,
          token,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        },
      });
    } else {
      res.status(401).json({
        message: 'Password is incorrect.',
      });
    }
  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while signing in.',
      error: err.message,
    });
  }
};

exports.signUp = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      message: 'Email, name, and password are required for sign-up.',
    });
  }

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserQuery =
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await pool.query(newUserQuery, [email, hashedPassword, name]);
    const newUser = rows[0];

    // Create a JWT token for the new user
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name },
      secretKey,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User successfully registered.',
      metadata: {
        userId: newUser.id,
        token,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while registering the user.',
      error: err.message,
    });
  }
};