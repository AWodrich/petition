DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles;
-- DROP TABLE IF EXISTS quotes;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    signature text not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER not null unique,
    city VARCHAR(300) not null,
    age VARCHAR(300) not null,
    url text not null
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR(300) not null,
    last VARCHAR(300) not null,
    email VARCHAR(300) unique not null,
    hashed_password VARCHAR(300) not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE quotes (
--     id SERIAL PRIMARY KEY,
--     text
-- )
