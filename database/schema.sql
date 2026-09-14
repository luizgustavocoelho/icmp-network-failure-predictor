-- ============================================================
-- ICMP Network Failure Predictor
-- PostgreSQL Database Schema - v2.0
-- Generated from the current SQLAlchemy ORM models
-- ============================================================

-- Main entities:
-- 1. users
-- 2. hosts
-- 3. measurements
-- 4. predictions
-- 5. alerts

-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE users (
	id SERIAL NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id)
);

-- ============================================================
-- TABLE: hosts
-- ============================================================

CREATE TABLE hosts (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	ip_address INET NOT NULL, 
	description VARCHAR(255), 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_hosts_user_ip UNIQUE (user_id, ip_address), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: measurements
-- ============================================================

CREATE TABLE measurements (
	id SERIAL NOT NULL, 
	host_id INTEGER NOT NULL, 
	measured_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	latency_ms NUMERIC(10, 3), 
	packet_loss_pct NUMERIC(5, 2) NOT NULL, 
	success BOOLEAN NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT chk_measurements_packet_loss CHECK (packet_loss_pct >= 0 AND packet_loss_pct <= 100), 
	CONSTRAINT chk_measurements_latency CHECK (latency_ms IS NULL OR latency_ms >= 0), 
	CONSTRAINT chk_measurements_status CHECK (status IS NULL OR status IN ('OK', 'RISK', 'FAILURE')), 
	FOREIGN KEY(host_id) REFERENCES hosts (id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: predictions
-- ============================================================

CREATE TABLE predictions (
	id SERIAL NOT NULL, 
	host_id INTEGER NOT NULL, 
	generated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	forecast_for TIMESTAMP WITH TIME ZONE NOT NULL, 
	predicted_latency_ms NUMERIC(10, 3), 
	predicted_packet_loss_pct NUMERIC(5, 2), 
	predicted_status VARCHAR(20) NOT NULL, 
	confidence NUMERIC(5, 2), 
	PRIMARY KEY (id), 
	CONSTRAINT chk_predictions_latency CHECK (predicted_latency_ms IS NULL OR predicted_latency_ms >= 0), 
	CONSTRAINT chk_predictions_packet_loss CHECK (predicted_packet_loss_pct IS NULL OR (predicted_packet_loss_pct >= 0 AND predicted_packet_loss_pct <= 100)), 
	CONSTRAINT chk_predictions_status CHECK (predicted_status IN ('OK', 'RISK', 'FAILURE')), 
	CONSTRAINT chk_predictions_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100)), 
	FOREIGN KEY(host_id) REFERENCES hosts (id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: alerts
-- ============================================================

CREATE TABLE alerts (
	id SERIAL NOT NULL, 
	host_id INTEGER NOT NULL, 
	measurement_id INTEGER, 
	severity VARCHAR(20) NOT NULL, 
	message VARCHAR(500) NOT NULL, 
	is_read BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT chk_alerts_severity CHECK (severity IN ('info', 'warning', 'critical')), 
	FOREIGN KEY(host_id) REFERENCES hosts (id) ON DELETE CASCADE, 
	FOREIGN KEY(measurement_id) REFERENCES measurements (id) ON DELETE SET NULL
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE INDEX ix_hosts_user_id ON hosts (user_id);

CREATE INDEX ix_measurements_host_id ON measurements (host_id);

CREATE INDEX ix_predictions_host_id ON predictions (host_id);

CREATE INDEX ix_alerts_host_id ON alerts (host_id);

-- ============================================================
-- VALIDATION QUERY
-- ============================================================

-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
