-- ============================================================
-- ICMP Network Failure Predictor
-- Initial PostgreSQL Database Schema
-- ============================================================
--
-- This schema stores:
-- 1. monitored network hosts
-- 2. ICMP measurements
-- 3. connectivity predictions
-- 4. generated alerts
--
-- Database: PostgreSQL
-- ============================================================


-- ============================================================
-- TABLE: hosts
-- ============================================================

CREATE TABLE IF NOT EXISTS hosts (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    ip_address INET NOT NULL UNIQUE,

    description VARCHAR(255),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE: measurements
-- ============================================================

CREATE TABLE IF NOT EXISTS measurements (
    id BIGSERIAL PRIMARY KEY,

    host_id BIGINT NOT NULL,

    measured_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    latency_ms NUMERIC(10, 3),

    packet_loss_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,

    success BOOLEAN NOT NULL,

    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_measurements_host
        FOREIGN KEY (host_id)
        REFERENCES hosts(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_measurements_packet_loss
        CHECK (
            packet_loss_pct >= 0
            AND packet_loss_pct <= 100
        ),

    CONSTRAINT chk_measurements_latency
        CHECK (
            latency_ms IS NULL
            OR latency_ms >= 0
        ),

    CONSTRAINT chk_measurements_status
        CHECK (
            status IN ('OK', 'RISK', 'FAILURE')
        )
);


-- ============================================================
-- TABLE: predictions
-- ============================================================

CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,

    host_id BIGINT NOT NULL,

    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    forecast_for TIMESTAMPTZ NOT NULL,

    predicted_latency_ms NUMERIC(10, 3),

    predicted_packet_loss_pct NUMERIC(5, 2),

    predicted_status VARCHAR(20) NOT NULL,

    confidence NUMERIC(5, 2),

    CONSTRAINT fk_predictions_host
        FOREIGN KEY (host_id)
        REFERENCES hosts(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_predictions_latency
        CHECK (
            predicted_latency_ms IS NULL
            OR predicted_latency_ms >= 0
        ),

    CONSTRAINT chk_predictions_packet_loss
        CHECK (
            predicted_packet_loss_pct IS NULL
            OR (
                predicted_packet_loss_pct >= 0
                AND predicted_packet_loss_pct <= 100
            )
        ),

    CONSTRAINT chk_predictions_status
        CHECK (
            predicted_status IN ('OK', 'RISK', 'FAILURE')
        ),

    CONSTRAINT chk_predictions_confidence
        CHECK (
            confidence IS NULL
            OR (
                confidence >= 0
                AND confidence <= 100
            )
        )
);


-- ============================================================
-- TABLE: alerts
-- ============================================================

CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,

    host_id BIGINT NOT NULL,

    measurement_id BIGINT,

    severity VARCHAR(20) NOT NULL,

    message VARCHAR(500) NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_alerts_host
        FOREIGN KEY (host_id)
        REFERENCES hosts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_alerts_measurement
        FOREIGN KEY (measurement_id)
        REFERENCES measurements(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_alerts_severity
        CHECK (
            severity IN ('info', 'warning', 'critical')
        )
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_measurements_host_id
    ON measurements(host_id);

CREATE INDEX IF NOT EXISTS idx_measurements_measured_at
    ON measurements(measured_at);

CREATE INDEX IF NOT EXISTS idx_measurements_host_time
    ON measurements(host_id, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_measurements_status
    ON measurements(status);

CREATE INDEX IF NOT EXISTS idx_predictions_host_id
    ON predictions(host_id);

CREATE INDEX IF NOT EXISTS idx_predictions_forecast_for
    ON predictions(forecast_for);

CREATE INDEX IF NOT EXISTS idx_predictions_host_forecast
    ON predictions(host_id, forecast_for);

CREATE INDEX IF NOT EXISTS idx_alerts_host_id
    ON alerts(host_id);

CREATE INDEX IF NOT EXISTS idx_alerts_created_at
    ON alerts(created_at);


-- ============================================================
-- OPTIONAL TEST QUERY
-- ============================================================

-- Run this after creating the tables to verify that they exist:
--
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;