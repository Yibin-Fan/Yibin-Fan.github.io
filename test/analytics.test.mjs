import test from "node:test";
import assert from "node:assert/strict";
import { eventFor } from "../analytics.mjs";
import { createShell } from "../shell.mjs";

test("analytics records only successful, named public interactions", () => {
  const shell = createShell();
  const run = (command) => {
    const cwd = shell.cwd;
    return eventFor(command, cwd, shell.execute(command));
  };

  assert.equal(run("ls"), null);
  assert.equal(run("cd publications"), "browse-publications");
  assert.equal(run("cat probe-exploit.md"), "read-publication");
  assert.equal(run("cd ../resume"), "browse-resume");
  assert.equal(run("open cv.pdf"), "open-cv");
  assert.equal(run("cat cv.pdf"), null);
  assert.equal(run("cd /research"), "browse-research");
  assert.equal(run("cat equivariant-rl.md"), "read-research");
});

test("analytics never forwards arbitrary command text or invalid paths", () => {
  const shell = createShell();
  const run = (command) => {
    const cwd = shell.cwd;
    return eventFor(command, cwd, shell.execute(command));
  };

  assert.equal(run("cat private-email@example.com"), null);
  assert.equal(run("open secret.pdf"), null);
  assert.equal(run("history"), null);
  assert.equal(run("whoami"), null);
});
