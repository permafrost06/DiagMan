## Installation

1. Configure the turso database url
   ```bash
   turso db show <your-db> --url
   ```
   And then store this value as a secret for production:
   ```bash
   pnpm exec wrangler secret put TURSO_DB_URL
   ```
2. Create a new file called `.dev.vars` with the following structure. Paste your authentication token in the quotation marks:
   ```toml
   TURSO_AUTH_TOKEN="<your-auth-token>"
   ```
   You can generate auth token by:
   ```bash
   turso db tokens create <your-db> -e none
   ```
   And then store the auth token as a secret for production:
   ```bash
   pnpm exec wrangler secret put TURSO_AUTH_TOKEN
   ```
