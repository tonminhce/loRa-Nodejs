const pool = require("../../config.js").pool;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required for sign-in.",
    });
  }

  try {
    const query = "SELECT * FROM users WHERE email = $1";
    const { rows } = await pool.query(query, [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        message: "The email does not exist.",
      });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // Create a JWT token
      const token = jwt.sign(
        { name: user.name, email: user.email }, // Payload could include any user information that you wish to include in the token.
        secretKey,
        { expiresIn: "24h" } // Token will expire in 24 hour. You can set any time you see appropriate.
      );

      res.status(200).json({
        message: "User successfully signed in.",
        token, // Send the token to the client.
      });
    } else {
      res.status(401).json({
        message: "Password is incorrect.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while signing in.",
      error: err.message,
    });
  }
};

exports.signUp = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      message: "Email, name and password are required for sign-up.",
    });
  }

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({
        message: "There are account with this email.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // The second parameter is the saltRounds
    const newUserQuery = "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *";
    const { rows } = await pool.query(newUserQuery, [email, hashedPassword, name]);

    // Create a JWT token for the new user
    const token = jwt.sign(
      { userId: rows[0].id, email: rows[0].email },
      secretKey,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: "User successfully registered.",
      token // Send the token to the client.
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while registering the user.",
      error: err.message,
    });
  }
};