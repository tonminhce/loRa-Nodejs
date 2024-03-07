const pool = require("../../config.js").pool; 

exports.sendMessage = async (req, res) => {
    {
        // Extract necessary data from the request body
        const { chatroom_id, sender_id, message_text } = req.body;

        try {
            // Insert the message into the database
            const query = `
      INSERT INTO messages (chatroom_id, sender_id, message_text)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
            const { rows } = await pool.query(query, [chatroom_id, sender_id, message_text]);

            // Send a success response with the inserted message
            res.status(201).json({
                message: 'Message sent successfully.',
                data: rows[0]
            });
        } catch (error) {
            // Handle errors and send an error response
            console.error("[ERROR] ", error);
            res.status(500).json({
                message: 'An error occurred while sending the message.',
                error: error.message
            });
        }
    }
};

exports.getMessages = async (req, res) => {
    // Extract the chatroom_id from the request parameters
    const { chatroom_id } = req.params;

    try {
        // Retrieve messages for the specified chatroom from the database
        const query = `
      SELECT * FROM messages
      WHERE chatroom_id = $1
      ORDER BY created_at ASC
    `;
        const { rows } = await pool.query(query, [chatroom_id]);

        // Send the retrieved messages as a response
        res.status(200).json({
            data: rows
        });
    } catch (error) {
        // Handle errors and send an error response
        console.error("[ERROR] ", error);
        res.status(500).json({
            message: 'An error occurred while retrieving messages.',
            error: error.message
        });
    }
};