import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { betterAuth } from "better-auth";

// The workflow supplies a disposable local service. Never accept a developer's DATABASE_URL.
const db = new Pool({host:"127.0.0.1", port: Number(process.env.TEST_PG_PORT), database:"auth_contract_test", user:"postgres", password:"test-only"});
try {
  const schema = await readFile(new URL("../migrations/auth/0001_auth.sql", import.meta.url), "utf8");
  await db.query(schema);
  const url = "http://localhost:8080";
  const auth = betterAuth({database:db, baseURL:url, secret:randomBytes(32).toString("hex"), emailAndPassword:{enabled:true}});
  const user = {name:"Test Owner", email:"owner@example.test", password:randomBytes(24).toString("hex")};
  await auth.api.signUpEmail({body:user});
  const signedIn = await auth.api.signInEmail({body:{email:user.email, password:user.password}, asResponse:true});
  assert.equal(signedIn.status, 200);
  const headers = new Headers({cookie:signedIn.headers.getSetCookie().map(cookie=>cookie.split(";")[0]).join("; "), origin:url});
  assert.equal((await auth.api.getSession({headers}))?.user.email, user.email);
  await auth.api.signOut({headers});
  assert.equal(await auth.api.getSession({headers}), null);
  console.log("PostgreSQL auth schema verified by registration, sign-in, session read and sign-out.");
} finally {
  await db.end();
}
