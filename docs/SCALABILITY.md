# Scalability Recommendations

- **Ingestion pipeline:** Move external fire/weather API pulls to queue-driven workers (BullMQ + Redis).
- **Geo queries:** Introduce geospatial indexing (BigQuery GIS or PostGIS mirror) for high-volume route/risk operations.
- **Model serving:** Host AI service with autoscaling + model versioning + shadow traffic for safe rollouts.
- **Caching:** Cache fire intelligence and route matrix in Redis with short TTL to reduce API latency.
- **Streaming:** Replace single-node ws with pub/sub fanout (Redis, NATS, or managed WebSocket gateway).
- **Notifications:** Use reliable event bus and dead-letter queues for SMS/push retries.
- **Security posture:** Add KMS-backed key management for location encryption keys and rotate quarterly.
- **Resilience:** Multi-region failover and graceful degradation when one data source fails.
