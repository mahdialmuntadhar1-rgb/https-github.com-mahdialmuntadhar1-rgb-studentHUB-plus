import fs from "node:fs";

const backend = process.env.VITE_BACKEND_URL || "https://rafid-api.mahdialmuntadhar1.workers.dev";
let failed = false;

function check(ok, msg) {
  console.log((ok ? "OK  " : "FAIL ") + msg);
  if (!ok) failed = true;
}

function read(path) {
  return fs.readFileSync(path, "utf8").replace(/^\uFEFF/, "");
}

const mustFiles = ["package.json", "index.html", "wrangler.toml", "src/App.tsx", "src/lib/api.ts", "src/components/AuthModal.tsx", "src/components/HomeFeed.tsx", "src/components/SocialHub.tsx"];
for (const f of mustFiles) check(fs.existsSync(f), "exists: " + f);

const pkg = JSON.parse(read("package.json"));
check(pkg.name !== "react-example", "package name cleaned");
check(pkg.scripts && pkg.scripts.build === "vite build", "frontend build script cleaned");
check(pkg.scripts && pkg.scripts["mvp:check"], "mvp:check script exists");

const html = read("index.html");
check(!html.includes("My Google AI Studio App"), "index title cleaned");

const api = read("src/lib/api.ts");
const auth = read("src/components/AuthModal.tsx");
const home = read("src/components/HomeFeed.tsx");
const app = read("src/App.tsx");
const social = read("src/components/SocialHub.tsx");

check(api.includes("VITE_BACKEND_URL"), "backend URL configurable");
check(auth.includes("authUser"), "AuthModal returns backend user object");
check(home.includes("await onAddNewPost"), "HomeFeed waits for backend publishing result");
check(app.includes("resolvedRole"), "App maps admin/staff role after login");
check(app.includes("/api/posts"), "App publishes posts to backend /api/posts");
check(app.includes("governorate: finalGovernorate"), "App sends backend post governorate");
check(app.includes("institution: finalInstitution"), "App sends backend post institution");
check(app.includes("institution_id: finalInstitutionId"), "App sends backend post institution_id");

if (social.includes("demoFriendRequests") || social.includes("demoMessageRequests")) {
  console.log("WARN SocialHub still contains demo fallback data. This is acceptable only for visual MVP, not real social MVP.");
}

async function ping(path) {
  try {
    const res = await fetch(backend + path);
    check(res.status < 500, "backend reachable " + path + " -> " + res.status);
  } catch (e) {
    check(false, "backend unreachable " + path + " -> " + e.message);
  }
}

await ping("/api/health");
await ping("/api/institutions?limit=1&offset=0");
await ping("/api/opportunities?limit=1");

if (failed) {
  console.error("");
  console.error("Final MVP preflight failed. Fix the FAIL items before deployment.");
  process.exit(1);
}

console.log("");
console.log("Final MVP preflight passed.");