DROP TABLE IF EXISTS signatures;


CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    first VARCHAR(300) not null,
    last VARCHAR (300) not null,
    signature text not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
