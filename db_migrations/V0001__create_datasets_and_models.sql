CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    size_bytes BIGINT DEFAULT 0,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    task VARCHAR(50) NOT NULL,
    base_model VARCHAR(255) NOT NULL,
    epochs INTEGER DEFAULT 5,
    dataset_url TEXT,
    status VARCHAR(50) DEFAULT 'created',
    progress INTEGER DEFAULT 0,
    notebook_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_models_created ON models(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_datasets_created ON datasets(created_at DESC);