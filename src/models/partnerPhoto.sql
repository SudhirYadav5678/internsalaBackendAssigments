CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW()
);