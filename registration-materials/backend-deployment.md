# PDCAT registration backend

Registration: https://pdcat2026.github.io/pdcatconf-site/2026/registration-form.html

Payment query: https://pdcat2026.github.io/pdcatconf-site/2026/registration-query.html

The registration instructions page shows separate registration and query buttons. Query uses only the registered email and returns payment status and amounts for each matching registration. It does not return names, paper details, phone numbers, receipts, internal review notes or full registration records. Anyone who knows the email can see these limited payment summaries.

API: `https://101.37.245.203`. Go stores registration details and payment receipt bytes atomically in MariaDB. Amounts are integer RMB cents; reported paid amounts remain separate from amounts confirmed by administrator review. Email lookup is case-insensitive. A random request key is used internally only to make submission retries idempotent.

Admin: https://101.37.245.203/admin/ . Credentials and data are not in this repository. Production uses an OS-authenticated local MariaDB socket account with only SELECT/INSERT/UPDATE on its own database. Daily backups use mariadb-dump with a consistent transaction and receipt blobs.

Local MariaDB integration and real-browser tests cover submission, email query, multiple records, admin login, receipt download, review and logout. Production verification uses read-only queries and preserves existing registrations.

## 2026-10-27 fee and screenshot update

USD author/attendee fees are 510/270; USD extra-page fee remains 150. CNY fees remain 3400/1800, plus 1000 per extra page for authors. CN/HK/MO/TW use CNY; all other listed countries/regions use USD. Online, on-site and poster participation use the same fee schedule. The existing cross-border bank account accepts RMB and USD; domestic transfer and QR payments remain RMB only.

The registration form and its messages are English-only. Country/region is a dropdown; attendance mode and a JPG/PNG payment screenshot are required. Amounts are read-only, computed again by the server, and stored with an explicit currency. Historical registrations keep their prior amounts and default to CNY. Payment confirmation still requires administrator review.

Image previews require an authenticated admin session. Existing PDF receipts remain downloadable; new submissions require screenshots. Public email queries include currency with the limited payment summary, never receipt images or full registration fields.
