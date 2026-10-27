import pytest
import pytest_asyncio
import httpx
from unittest.mock import patch, AsyncMock
from app.main import app
from app.database import init_db
from app.services.ollama_service import ollama_service

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()

@pytest.mark.asyncio
async def test_health_check():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "model" in data

@pytest.mark.asyncio
async def test_ai_status_ready():
    with patch.object(ollama_service, "get_status", new_callable=AsyncMock) as mock_status:
        mock_status.return_value = {
            "status": "ready",
            "model": "gemma4:e2b",
            "base_url": "http://localhost:11434",
            "message": "Ollama is online",
            "install_command": None,
        }
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/api/ai/status")
            assert res.status_code == 200
            assert res.json()["status"] == "ready"

@pytest.mark.asyncio
async def test_ai_status_model_missing():
    with patch.object(ollama_service, "get_status", new_callable=AsyncMock) as mock_status:
        mock_status.return_value = {
            "status": "model_missing",
            "model": "gemma4:e2b",
            "base_url": "http://localhost:11434",
            "message": "Model missing",
            "install_command": "ollama pull gemma4:e2b",
        }
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/api/ai/status")
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "model_missing"
            assert data["install_command"] == "ollama pull gemma4:e2b"

@pytest.mark.asyncio
async def test_ai_status_unreachable():
    with patch.object(ollama_service, "get_status", new_callable=AsyncMock) as mock_status:
        mock_status.return_value = {
            "status": "unreachable",
            "model": "gemma4:e2b",
            "base_url": "http://localhost:11434",
            "message": "Cannot reach Ollama",
            "install_command": None,
        }
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/api/ai/status")
            assert res.status_code == 200
            assert res.json()["status"] == "unreachable"

@pytest.mark.asyncio
async def test_empty_input_validation():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Empty string
        res = await client.post("/api/investigations/scan", json={"text": ""})
        assert res.status_code == 422

@pytest.mark.asyncio
async def test_scan_and_claim_extraction_schema_validation():
    mock_scan_json = {
        "main_claim": {
            "id": "claim-main",
            "text": "A mysterious figure was observed in the science laboratory after midnight.",
            "category": "Paranormal/Supernatural",
            "entities_and_dates": ["science laboratory", "midnight"],
            "checkable": True,
            "missing_info": "Exact date, camera model, laboratory number.",
            "ways_to_verify": ["Inspect facility security badge logs", "Check lab schedule"],
            "is_main": True
        },
        "other_claims": [
            {
                "id": "claim-sub",
                "text": "The entire floor has been haunted since 1994.",
                "category": "Paranormal/Supernatural",
                "entities_and_dates": ["1994"],
                "checkable": False,
                "missing_info": "Specific historical event documentation.",
                "ways_to_verify": ["Search local municipal archives"],
                "is_main": False
            }
        ],
        "sensational_wording": ["TERRIFYING GHOST SIGHTING", "DO NOT GO THERE"]
    }

    with patch.object(ollama_service, "get_status", new_callable=AsyncMock) as mock_status, \
         patch.object(ollama_service, "chat_json", new_callable=AsyncMock) as mock_chat:
        
        mock_status.return_value = {"status": "ready", "model": "gemma4:e2b", "base_url": "", "message": "OK"}
        mock_chat.return_value = mock_scan_json

        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post("/api/investigations/scan", json={"text": "TERRIFYING GHOST SIGHTING in the science laboratory!"})
            assert res.status_code == 200
            data = res.json()
            assert data["id"] is not None
            assert len(data["claims"]) == 2
            assert data["claims"][0]["text"] == mock_scan_json["main_claim"]["text"]
            assert data["sensational_wording"] == ["TERRIFYING GHOST SIGHTING", "DO NOT GO THERE"]

@pytest.mark.asyncio
async def test_invalid_model_output_handling():
    with patch.object(ollama_service, "get_status", new_callable=AsyncMock) as mock_status, \
         patch.object(ollama_service, "chat_json", new_callable=AsyncMock) as mock_chat:
        
        mock_status.return_value = {"status": "ready", "model": "gemma4:e2b", "base_url": "", "message": "OK"}
        mock_chat.side_effect = ValueError("Model output validation failed after retry.")

        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post("/api/investigations/scan", json={"text": "Check this claim"})
            assert res.status_code == 502
            assert "AI claim extraction failed" in res.json()["detail"]

@pytest.mark.asyncio
async def test_full_investigation_flow_with_verdicts():
    # 1. Scan
    mock_scan_json = {
        "main_claim": {
            "id": "claim-lab",
            "text": "Tomorrow's computer science classes are cancelled.",
            "category": "Academic/Campus",
            "entities_and_dates": ["Tomorrow", "Computer Science"],
            "checkable": True,
            "missing_info": "Notice signed by department head",
            "ways_to_verify": ["Check official registrar website"],
            "is_main": True
        },
        "other_claims": [],
        "sensational_wording": ["URGENT NOTICE"]
    }

    with patch.object(ollama_service, "get_status", new_callable=AsyncMock) as mock_status, \
         patch.object(ollama_service, "chat_json", new_callable=AsyncMock) as mock_chat:
        
        mock_status.return_value = {"status": "ready", "model": "gemma4:e2b", "base_url": "", "message": "OK"}
        mock_chat.return_value = mock_scan_json

        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            scan_res = await client.post("/api/investigations/scan", json={"text": "URGENT NOTICE: Tomorrow classes cancelled!"})
            assert scan_res.status_code == 200
            inv = scan_res.json()
            inv_id = inv["id"]
            claim_id = inv["claims"][0]["id"]

            # 2. Add Evidence
            evi_res = await client.post(f"/api/investigations/{inv_id}/evidence", json={
                "title": "Registrar Official Schedule",
                "source_url": "https://university.edu/classes",
                "text": "All classes remain in regular session tomorrow. No cancellations reported.",
                "notes": "Verified from university portal."
            })
            assert evi_res.status_code == 200
            inv_with_evi = evi_res.json()
            assert len(inv_with_evi["evidence"]) == 1
            evi_id = inv_with_evi["evidence"][0]["id"]

            # 3. Analyze (Mock evidence eval and verdict)
            mock_eval_json = {
                "evaluations": [
                    {
                        "evidence_id": evi_id,
                        "title": "Registrar Official Schedule",
                        "what_it_says": "Registrar confirms classes are in session.",
                        "stance": "contradicts",
                        "short_excerpt": "All classes remain in regular session tomorrow.",
                        "limitations": "Published this morning; potential late updates."
                    }
                ]
            }

            mock_verdict_json = {
                "verdict": {
                    "verdict": "CONTRADICTED",
                    "plain_explanation": "Official university schedules explicitly confirm classes are proceeding normally.",
                    "supporting_evidence": [],
                    "contradicting_evidence": ["Registrar Official Schedule"],
                    "inconclusive_evidence": [],
                    "limitations": ["Relies on registrar notice as of today."],
                    "confidence": "High",
                    "what_would_change_conclusion": "Official emergency alert sent via verified channels."
                },
                "reasoning": "The rumor claims cancellation, but official records contradict it directly.",
                "suggested_verification_steps": ["Log in to student portal"],
                "report_limitations": ["Analysis based on user-supplied document."]
            }

            # Return eval first, then verdict
            mock_chat.side_effect = [mock_eval_json, mock_verdict_json]

            analyze_res = await client.post(f"/api/investigations/{inv_id}/analyze", json={"claim_id": claim_id})
            assert analyze_res.status_code == 200
            analyzed_data = analyze_res.json()
            assert analyzed_data["verdict"]["verdict"] == "CONTRADICTED"
            assert analyzed_data["verdict"]["confidence"] == "High"
            assert analyzed_data["report"] is not None

            # 4. Get report endpoint
            report_res = await client.get(f"/api/investigations/{inv_id}/report")
            assert report_res.status_code == 200
            report_data = report_res.json()
            assert report_data["investigation_id"] == inv_id
            assert report_data["verdict"]["verdict"] == "CONTRADICTED"

            # 5. List history
            list_res = await client.get("/api/investigations")
            assert list_res.status_code == 200
            summaries = list_res.json()
            assert any(s["id"] == inv_id for s in summaries)

            # 6. Delete investigation
            del_res = await client.delete(f"/api/investigations/{inv_id}")
            assert del_res.status_code == 200

            # 7. 404 on deleted
            get_after_del = await client.get(f"/api/investigations/{inv_id}")
            assert get_after_del.status_code == 404

@pytest.mark.asyncio
async def test_unverified_verdict_when_no_evidence():
    mock_scan_json = {
        "main_claim": {
            "id": "claim-ghost",
            "text": "A ghost is haunting Room 404.",
            "category": "Paranormal/Supernatural",
            "entities_and_dates": ["Room 404"],
            "checkable": True,
            "missing_info": "Sensor readings, dates.",
            "ways_to_verify": ["Inspect room"],
            "is_main": True
        },
        "other_claims": [],
        "sensational_wording": []
    }

    with patch.object(ollama_service, "get_status", new_callable=AsyncMock) as mock_status, \
         patch.object(ollama_service, "chat_json", new_callable=AsyncMock) as mock_chat:
        
        mock_status.return_value = {"status": "ready", "model": "gemma4:e2b", "base_url": "", "message": "OK"}
        mock_chat.return_value = mock_scan_json

        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            scan_res = await client.post("/api/investigations/scan", json={"text": "A ghost is haunting Room 404."})
            inv = scan_res.json()
            inv_id = inv["id"]
            claim_id = inv["claims"][0]["id"]

            # Analyze immediately with no evidence
            analyze_res = await client.post(f"/api/investigations/{inv_id}/analyze", json={"claim_id": claim_id})
            assert analyze_res.status_code == 200
            data = analyze_res.json()
            assert data["verdict"]["verdict"] == "UNVERIFIED"
            assert data["verdict"]["confidence"] == "Low"
