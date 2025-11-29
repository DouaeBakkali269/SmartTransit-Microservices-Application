Route Service - To Add / Notes

Items for other teams / future work:

- Implement a proper `Line` lookup by `lineNumber` and return GeoJSON `route` shapes for `GET /api/v1/lines/{lineNumber}/route`.
- Add comprehensive `Station` management endpoints for admin and a service layer with syncing to `geolocation-service` via Kafka events (e.g. `station.created`).
- Support route calculation (`POST /api/v1/admin/lines/{lineId}/route/calculate`) using routing engine (OSRM/GraphHopper) and persist GeoJSON shapes.

Current changes: added minimal `Station` entity/repository and v1 station endpoints. These are simple and intended as a starting point.
