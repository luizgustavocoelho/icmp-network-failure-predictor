# ICMP Network Failure Predictor - API

FastAPI backend for authentication, multi-user ICMP monitoring, persistence, prediction and recommendations.

## Run

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Development:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger:

```text
http://localhost:8000/docs
```

## Tests

```bash
pytest -q
```

Final V2 result:

```text
101 passed
0 failed
6 warnings
```

## Main Capabilities

```text
JWT authentication
Multi-user host ownership
Host CRUD
Real ICMP monitoring
Automatic scheduler
Measurement history
Alerts
Predictions
Recommendations
PostgreSQL / Neon support
Docker-ready runtime
```

ICMP is executed from the machine/container running this backend.
