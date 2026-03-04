CREATE DATABASE IF NOT EXISTS user_id;
USE user_id;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
INSERT INTO users (email, password)
VALUES ('admin@example.com', 'password123');

SELECT *
FROM users
WHERE email = 'admin@example.com';