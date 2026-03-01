CREATE DATABASE IF NOT EXISTS user_id;
USE user_id;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
INSERT INTO users (username, password)
VALUES ('admin@example.com', 'password123'),
    ('test@example.com', '12345'),
    ('user@example.com', 'password'),
    ('student@example.com', '1234');