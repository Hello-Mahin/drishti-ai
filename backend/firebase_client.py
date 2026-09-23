import os
import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = logging.getLogger("drishti_backend.firebase")

PROJECT_ID = "drishti-ai-b2c66"
COLLECTION_NAME = "screenings"


class FirebaseManager:
    def __init__(self):
        self.db = None
        self.mock_store: List[Dict[str, Any]] = []
        self._initialize_firestore()

    def _initialize_firestore(self):
        """
        Initializes Firebase Admin SDK and Firestore client.
        Supports:
        1. GOOGLE_APPLICATION_CREDENTIALS environment variable
        2. Local serviceAccountKey.json file
        3. Google Cloud Run Default Application Credentials (ADC)
        4. In-memory local dev mock fallback if credentials are not configured
        """
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore

            # Avoid re-initializing if app already exists
            if not firebase_admin._apps:
                cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccountKey.json")
                if os.path.exists(cred_path):
                    logger.info(f"Initializing Firebase using credentials file: {cred_path}")
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred, {"projectId": PROJECT_ID})
                else:
                    logger.info("Initializing Firebase using Application Default Credentials (ADC)...")
                    firebase_admin.initialize_app(options={"projectId": PROJECT_ID})

            self.db = firestore.client()
            logger.info(f"Firestore client connected successfully to project '{PROJECT_ID}'.")
        except Exception as e:
            logger.warning(
                f"Firestore could not be initialized with credentials ({e}). "
                "Operating in Local Dev Mock Mode: records will be cached in memory."
            )
            self.db = None

    def save_screening(self, screening_data: Dict[str, Any]) -> str:
        """
        Saves a screening record into Firestore collection 'screenings'.
        Generates unique screening_id if not present.
        Returns the screening_id.
        """
        screening_id = screening_data.get("screening_id") or f"SCR-{uuid.uuid4().hex[:8].upper()}"
        screening_data["screening_id"] = screening_id

        # Normalize timestamp
        if "timestamp" not in screening_data or screening_data["timestamp"] is None:
            screening_data["timestamp"] = datetime.utcnow().isoformat()
        elif isinstance(screening_data["timestamp"], datetime):
            screening_data["timestamp"] = screening_data["timestamp"].isoformat()

        if self.db is not None:
            try:
                # Save document with screening_id as key
                doc_ref = self.db.collection(COLLECTION_NAME).document(screening_id)
                doc_ref.set(screening_data)
                logger.info(f"Saved screening record '{screening_id}' to Firestore.")
                return screening_id
            except Exception as e:
                logger.error(f"Error writing to Firestore: {e}. Caching in memory.")

        # Fallback to local memory store
        self.mock_store.append(screening_data)
        logger.info(f"Cached screening record '{screening_id}' in local store.")
        return screening_id

    def get_worker_history(self, asha_worker_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all screening records submitted by a specific ASHA worker.
        """
        results: List[Dict[str, Any]] = []

        if self.db is not None:
            try:
                query = self.db.collection(COLLECTION_NAME).where("asha_worker_id", "==", asha_worker_id)
                docs = query.stream()
                for doc in docs:
                    data = doc.to_dict()
                    # Convert Firestore DatetimeWithNanoseconds to string if needed
                    if "timestamp" in data and hasattr(data["timestamp"], "isoformat"):
                        data["timestamp"] = data["timestamp"].isoformat()
                    results.append(data)
                return results
            except Exception as e:
                logger.error(f"Error querying Firestore for worker '{asha_worker_id}': {e}. Reading from local cache.")

        # In-memory query fallback
        for record in self.mock_store:
            if record.get("asha_worker_id") == asha_worker_id:
                results.append(record)

        return results


# Global singleton instance
firebase_client = FirebaseManager()
