const mysql = require("mysql2/promise");

exports.handler = async (event) => {

    try {
        const body = JSON.parse(event.body || "{}");
        const username = body.username;

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows] = await connection.execute(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        await connection.end();

        if (rows.length > 0) {
            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    success: true,
                    message: "Login successful"
                })
            };
        }

        return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                success: false,
                message: "User not found"
            })
        };

    } catch (error) {

        console.log("ERROR:", error);

        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: error.message })
        };
    }
};
