const mysql = require("mysql2/promise");
const crypto = require("crypto");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "All fields required" }),
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await connection.execute(
      "INSERT INTO users (username, email, password, otp, is_verified) VALUES (?, ?, ?, ?, false)",
      [username, email, password, otp]
    );

    await connection.end();

    // Send OTP email
    const emailParams = {
      Destination: { ToAddresses: [email] },
      Message: {
        Body: {
          Text: { Data: `Your verification OTP is: ${otp}` },
        },
        Subject: { Data: "Your Verification Code" },
      },
      Source: "yourverifiedemail@example.com",
    };

    await ses.send(new SendEmailCommand(emailParams));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "OTP sent to email" }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Error registering user" }),
    };
  }
};
