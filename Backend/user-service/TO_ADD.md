User Service - To Add / Notes

Notes and missing pieces:

- Search history persistence endpoints (`POST /api/v1/users/me/searches`) are currently returned as empty lists by the lightweight controller; implement storing in `UserSearches` table and wire to `UserService`.
- Wallet and subscription endpoints mentioned in the spec (`/api/v1/users/me/wallet`, `/api/v1/users/me/subscription`) are left as stubs and should be implemented by the payments/subscription teams.
- Avatar file storage (S3/MinIO) integration: the current `/api/v1/users/me/avatar` returns a synthetic URL; please implement actual file storage and user DTO changes (add `avatar` field) to persist the URL.
