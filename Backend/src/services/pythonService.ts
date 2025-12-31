import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const callPython = <T = any>(
  script: string,
  input: any
): Promise<T> => {

  const scriptPath = path.resolve(
    process.cwd(),
    "dist",
    "python",
    script
  );

  return new Promise((resolve, reject) => {

    if (!fs.existsSync(scriptPath)) {
      return reject(`❌ Python script not found at: ${scriptPath}`);
    }

    const py = spawn("python3", [scriptPath]);

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (d) => (stdout += d.toString()));
    py.stderr.on("data", (e) => (stderr += e.toString()));

    py.on("close", (code) => {
      if (stderr) console.warn("⚠️ Python stderr:", stderr);

      if (code !== 0) {
        return reject(`❌ Python exited with code ${code}`);
      }

      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(`❌ Invalid JSON from Python: ${stdout}`);
      }
    });

    py.stdin.write(JSON.stringify(input));
    py.stdin.end();
  });
};
