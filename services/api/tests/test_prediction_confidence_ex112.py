"""Exercício 11.2 — testes da confiança de previsão na API ICMP original.

A massa CSV é material externo de referência, não arquivo importado pela API.
O projeto original usa `Prediction.confidence` opcional, validado pelo banco na
faixa 0..100, e NÃO o campo Java `model_confidence` na escala 0..1.
Os testes chamam a API real para criar host e ler a previsão, e usam o ORM
real para verificar restrições de persistência no PostgreSQL de testes.
"""

import csv
from datetime import datetime, timezone
from pathlib import Path

import pytest
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models.prediction import Prediction
from tests.conftest import TestingSessionLocal


DATA_CSV = (
    Path(__file__).parent
    / "resources"
    / "exercicio-11-2-predictions.csv"
)


def _csv_row(prediction_id: str) -> dict[str, str]:
    with DATA_CSV.open(encoding="utf-8", newline="") as stream:
        return next(
            item for item in csv.DictReader(stream)
            if item["prediction_id"] == prediction_id
        )


@pytest.fixture
def host_id(client) -> int:
    response = client.post(
        "/hosts",
        json={"name": "Coverage EX11.2", "ip_address": "8.8.8.8"},
    )
    assert response.status_code == 201
    return response.json()["id"]


def _insert_prediction(host_id: int, confidence: object) -> None:
    with TestingSessionLocal() as db:
        db.add(
            Prediction(
                host_id=host_id,
                forecast_for=datetime(2026, 11, 20, tzinfo=timezone.utc),
                predicted_latency_ms=25.0,
                predicted_packet_loss_pct=0.0,
                predicted_status="OK",
                confidence=confidence,
            )
        )
        db.commit()


def _latest_confidence(client, host_id: int):
    response = client.get(f"/hosts/{host_id}/predictions/latest")
    assert response.status_code == 200
    return response.json()["confidence"]


@pytest.mark.parametrize(
    ("prediction_id", "expected"),
    [
        ("mock-a-1", 0.82),
        ("mock-a-3", 0.0),
        ("mock-a-4", 1.0),
        ("mock-a-5", 1.5),  # Válido na API ICMP (0..100), não na API Java (0..1).
        ("mock-b-1", 0.92),
        ("mock-zz-1", 0.5),
    ],
)
def test_confidence_from_fixture_is_persisted_and_read_by_api(
    client, host_id, prediction_id, expected,
):
    # Arrange: valor real da massa CSV fornecida pelo professor.
    value = float(_csv_row(prediction_id)["model_confidence"])

    # Act: persiste pelo modelo de produção e consulta pela rota verdadeira.
    _insert_prediction(host_id, value)
    actual = _latest_confidence(client, host_id)

    # Assert: mantém o valor de confiança na unidade percentual da API ICMP.
    assert actual == pytest.approx(expected)


def test_empty_confidence_in_fixture_is_null_in_api(client, host_id):
    # Arrange: campo opcional vazio no arquivo disponibilizado.
    value = _csv_row("mock-a-2")["model_confidence"]
    assert value == ""

    # Act: ausência é representada por None no modelo do projeto.
    _insert_prediction(host_id, None)
    actual = _latest_confidence(client, host_id)

    # Assert: o endpoint devolve JSON null, e não zero ou string vazia.
    assert actual is None


def test_negative_csv_confidence_is_rejected_by_database(host_id):
    # Arrange: -0.1 fora do limite real 0..100 do projeto.
    invalid_value = float(_csv_row("mock-a-7")["model_confidence"])

    # Act + Assert: restrição real de banco chk_predictions_confidence.
    with pytest.raises(IntegrityError, match="chk_predictions_confidence"):
        _insert_prediction(host_id, invalid_value)


def test_non_numeric_csv_confidence_is_rejected_on_persistence(host_id):
    # Arrange: "abc" é inadequado a uma coluna Numeric.
    invalid_value = _csv_row("mock-a-6")["model_confidence"]

    # Act + Assert: erro do ORM/driver; não existe importador com descarte.
    with pytest.raises(SQLAlchemyError):
        _insert_prediction(host_id, invalid_value)


def test_confidence_at_upper_real_limit_is_accepted(client, host_id):
    # Arrange: a API ICMP aceita até 100, diferentemente da referência Java.
    value = 100.0

    # Act
    _insert_prediction(host_id, value)
    actual = _latest_confidence(client, host_id)

    # Assert
    assert actual == pytest.approx(100.0)


def test_confidence_above_real_upper_limit_is_rejected(host_id):
    # Arrange: caso complementar, 101 > limite real de 100.
    invalid_value = 101.0

    # Act + Assert
    with pytest.raises(IntegrityError, match="chk_predictions_confidence"):
        _insert_prediction(host_id, invalid_value)
