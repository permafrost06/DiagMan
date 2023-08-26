import { Client as LibsqlClient, createClient } from "@libsql/client/web";
import { Env } from "../worker";

export const getLibsqlClient = (env: Env): LibsqlClient => {
    const url = env.TURSO_DB_URL?.trim();
    if (url === undefined) {
        throw new Error("TURSO_DB_URL env var is not defined");
    }

    const authToken = env.TURSO_AUTH_TOKEN?.trim();
    if (authToken === undefined) {
        throw new Error("TURSO_AUTH_TOKEN env var is not defined");
    }

    return createClient({ url, authToken });
}