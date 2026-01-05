# Server API (minimal)

This folder contains simple PHP endpoints used by the demo Angular app.

Files of interest:
- `server/api/saveUser.php` — save or update user records `{ email, uid, role }` in `server/data/users.json`.
- `server/api/enrollCourse.php` — store enrollments in `server/data/enrollments.json` (requires uid via Authorization Bearer token or body uid for dev).
- `server/api/getMyCourses.php` — return enrolled course IDs for a user (Authorization Bearer token or `?uid=` for dev).
- `server/api/adminLogin.php` — admin login that stores hashed passwords in `server/data/admins.json`. The default password `welcome` will bootstrap the first admin for an email.
- `server/api/adminChangePassword.php` — change an admin's password (requires current password).
- `server/api/verifyToken.php` — helper for verifying Firebase ID tokens (optional; requires composer packages).

Quick setup
1. Ensure PHP is installed on the server and the web server user can read/write `server/data/`.
2. Make `server/data` writable by the web server (example for Apache on Ubuntu):

```bash
sudo chown -R www-data:www-data server/data
sudo chmod -R 775 server/data
```

3. (Optional) To enable robust Firebase ID token verification, install composer dependencies in the repo root:

```bash
composer require guzzlehttp/guzzle firebase/php-jwt
```

`verifyToken.php` expects those packages. If they are not present, token verification will be skipped and endpoints will operate in permissive/dev mode (they still accept `uid` in the body or `?uid=` for dev).

Security notes
- These endpoints are minimal and intended for local development. Do NOT expose them publicly without adding proper authentication.
- Replace the admin default-password bootstrapping with a secure onboarding flow before production.
If you want, I can add a small PHP snippet to the top of admin endpoints that enforces secure cookie settings and regenerates session IDs on login.

MySQL support
- A MySQL schema is provided at `server/data/schema.sql`. To create the database and tables:

```sql
CREATE DATABASE royalsandnobles CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE royalsandnobles;
SOURCE server/data/schema.sql;
```

- Configure DB credentials by editing `server/api/db.php` or setting environment variables `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` before running PHP.

CSRF protection
- CSRF helper functions are available in `server/api/csrf.php`. The admin login endpoint now generates a CSRF token returned in the JSON response under the `csrf` field after successful login. State-changing admin endpoints (approve, change-password) validate the CSRF token which can be sent in the header `X-CSRF-Token` or in the POST JSON body as `csrf`.

MySQL-backed endpoints
- New endpoints with `mysql_` prefix store/read data from MySQL: `mysql_saveUser.php`, `mysql_enrollCourse.php`, `mysql_getMyCourses.php`, `mysql_listCourses.php`, `mysql_listPendingCourses.php`, `mysql_approveCourse.php`, `mysql_uploadCourse.php`.

	- `session.use_strict_mode = 1` (reject uninitialized session IDs)
	- `session.cookie_samesite = "Lax"` or `"Strict"` to reduce CSRF risk
- Regenerate session ID after login: the provided `adminLogin.php` starts a session, consider calling `session_regenerate_id(true)` after successful login to prevent fixation.
- Limit session lifetime: set `session.gc_maxlifetime` appropriately and/or implement server-side session expiration and logout.
- Consider binding sessions to client characteristics (IP or user-agent) carefully — balance security vs legitimate client changes.

If you want, I can add a small PHP snippet to the top of admin endpoints that enforces secure cookie settings and regenerates session IDs on login.

If you'd like, I can:
- Add a frontend admin login form that calls `adminLogin.php` and stores a session cookie.
- Add CSRF protections, session handling, or integrate with Firebase custom claims.
