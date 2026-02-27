const mysql = require("mysql2/promise");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { email, otp } = body;

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ? AND otp = ?",
      [email, otp]
    );

    if (rows.length === 0) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Invalid OTP" }),
      };
    }

    await connection.execute(
      "UPDATE users SET is_verified = true, otp = NULL WHERE email = ?",
      [email]
    );

    await connection.end();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Account verified successfully" }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Verification failed" }),
    };
  }
};
