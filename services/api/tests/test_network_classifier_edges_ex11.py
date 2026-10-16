"""Exercício 11.1 — casos NOVOS de borda e caminho de erro da API ICMP.

Cada teste segue Arrange–Act–Assert, usa a regra de produção verdadeira e
não depende de rede, banco de dados, relógio ou serviços externos.
"""

import pytest

from app.services.network_classifier import (
    NetworkStatus,
    classify_network_condition,
)


def test_zero_metrics_are_ok():
    # Arrange: extremos mínimos válidos para latência e perda.
    latency_ms = 0.0
    packet_loss_pct = 0.0

    # Act: classificação sem acesso a rede ou banco.
    result = classify_network_condition(latency_ms, packet_loss_pct, True)

    # Assert: o limite inferior de ambos os indicadores é válido.
    assert result == NetworkStatus.OK


def test_total_loss_overrides_success():
    # Arrange: exatamente 100% de perda e flag de sucesso inconsistente.
    packet_loss_pct = 100.0

    # Act: aplica a precedência da falha sobre a flag de sucesso.
    result = classify_network_condition(0.0, packet_loss_pct, True)

    # Assert: perda total deve ser classificada como falha.
    assert result == NetworkStatus.FAILURE


def test_rejects_infinite_loss():
    # Arrange: percentual não finito, maior que o máximo permitido.
    packet_loss_pct = float("inf")

    # Act + Assert: entrada inválida precisa ser recusada.
    with pytest.raises(ValueError, match="Packet loss must be between 0 and 100"):
        classify_network_condition(20.0, packet_loss_pct, True)


def test_invalid_latency_on_failed_ping():
    # Arrange: latência inválida mesmo diante de medição mal sucedida.
    latency_ms = -0.01

    # Act + Assert: a validação ocorre antes da classificação FAILURE.
    with pytest.raises(ValueError, match="Latency cannot be negative"):
        classify_network_condition(latency_ms, 100.0, False)
