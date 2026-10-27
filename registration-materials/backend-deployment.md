# PDCAT registration backend (2026-10-27)

The static registration page now submits to `https://101.37.245.203/api/registrations` and queries `https://101.37.245.203/api/query` from the same GitHub Pages URL.

The administrator interface is at `https://101.37.245.203/admin/`. Administrator credentials are managed outside this repository. No password, database, receipt, or server private key belongs in the static site.

Submission success means the record and receipt were saved; payment confirmation requires administrator review. Participants save their registration ID and private query code using the downloadable confirmation receipt.

Checks: local Go integration tests, local browser submission/query/review flow, real HTTPS certificate validation, real GitHub-origin CORS lookup, production administrator login/read/logout, and certificate renewal dry run. Production registration write/review tests were not run; no synthetic registration was inserted into the live database.
