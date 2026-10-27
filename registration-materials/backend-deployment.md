# PDCAT registration backend

Registration: https://pdcat2026.github.io/pdcatconf-site/2026/registration-form.html

Payment query: https://pdcat2026.github.io/pdcatconf-site/2026/registration-query.html

The registration instructions page shows separate registration and query buttons. Query uses only the registered email and returns payment status and amounts for each matching registration. It does not return names, paper details, phone numbers, receipts, internal review notes or full registration records. Anyone who knows the email can see these limited payment summaries.

API: `https://101.37.245.203`. Go stores registration details and payment receipt bytes atomically in MariaDB. Amounts are integer RMB cents; reported paid amounts remain separate from amounts confirmed by administrator review. Email lookup is case-insensitive. A random request key is used internally only to make submission retries idempotent.

Admin: https://101.37.245.203/admin/ . Credentials and data are not in this repository. Production uses an OS-authenticated local MariaDB socket account with only SELECT/INSERT/UPDATE on its own database. Daily backups use mariadb-dump with a consistent transaction and receipt blobs.

Local MariaDB integration and real-browser tests cover submission, email query, multiple records, admin login, receipt download, review and logout. Production verification uses read-only queries and preserves existing registrations.
