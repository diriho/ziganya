// Starts the mock backend and Vite together so the app runs with zero configuration.
import { spawn } from "node:child_process";

const MOCK_PORT = process.env.MOCK_PORT ?? "54321";
const env = {
  ...process.env,
  VITE_SUPABASE_URL: `http://localhost:${MOCK_PORT}`,
  VITE_API_KEY: "mock-anon-key-not-a-real-secret",
};

const mock = spawn(process.execPath, [new URL("./server.mjs", import.meta.url).pathname], { stdio: "inherit", env });
const vite = spawn("npx", ["vite", ...process.argv.slice(2)], { stdio: "inherit", env, shell: process.platform === "win32" });

const stop = () => {
  mock.kill();
  vite.kill();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
vite.on("exit", stop);
mock.on("exit", (code) => {
  if (code && code !== 0) {
    console.error(`[mock] exited with code ${code}`);
    stop();
  }
});
