import test from "node:test";
import assert from "node:assert/strict";
import { createShell, resolvePath } from "../shell.mjs";

test("the public directory tree contains the agreed sections and excludes private materials", () => {
  const shell = createShell();
  const names = shell.execute("ls").items.map((item) => item.name);
  assert.deepEqual(names, ["about.md", "research", "education", "publications", "resume", "contact.md"]);
  assert.equal(names.includes("projects"), false);
  assert.equal(names.includes("Transcripts"), false);
});

test("navigation, relative paths, and absolute paths work together", () => {
  const shell = createShell();
  assert.equal(shell.execute("pwd").text, "/");
  assert.equal(shell.execute("cd research").type, "empty");
  assert.equal(shell.execute("pwd").text, "/research");
  assert.match(shell.execute("cat ../publications/probe-exploit.md").text, /Yibin Fan and Qi Zhang/);
  assert.match(shell.execute("cat /about.md").text, /North Carolina State University/);
  assert.equal(shell.execute("cd /education").type, "empty");
  assert.match(shell.execute("cat /education/nc-state.md").text, /May 2027 \(expected\)/);
  assert.equal(shell.execute("cd ~").type, "empty");
  assert.equal(shell.execute("pwd").text, "/");
});

test("the paper has its accepted workshop status and no download target", () => {
  const paper = resolvePath([], "/publications/probe-exploit.md").node;
  assert.match(paper.content, /Accepted at NeurReps 2026: Symmetry and Geometry in Neural Representations \(NeurIPS Workshop\)/);
  assert.doesNotMatch(paper.content, /under review/i);
  assert.equal(paper.href, undefined);
});

test("the CV can be opened but not printed as text", () => {
  const shell = createShell();
  assert.equal(shell.execute("cat resume/cv.pdf").type, "error");
  assert.deepEqual(shell.execute("open resume/cv.pdf"), {
    type: "open",
    href: "assets/Yibin_Fan_CV.pdf",
    label: "Yibin Fan — Curriculum Vitae",
  });
});

test("clear removes output without changing the current directory", () => {
  const shell = createShell();
  shell.execute("cd research");
  assert.equal(shell.execute("clear").type, "clear");
  assert.equal(shell.execute("pwd").text, "/research");
});

test("tab completion and invalid paths give useful results", () => {
  const shell = createShell();
  assert.deepEqual(shell.completions("cd rese"), ["research/"]);
  assert.deepEqual(shell.completions("cat publications/pro"), ["publications/probe-exploit.md"]);
  assert.match(shell.execute("cd missing").text, /no such directory/);
  assert.match(shell.execute("unknown").text, /command not found/);
  assert.equal(resolvePath([], "constructor"), null);
});
