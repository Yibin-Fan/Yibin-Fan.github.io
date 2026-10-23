import { resolvePath, tokenize } from "./shell.mjs";

const sections = new Set(["research", "education", "publications", "resume"]);

// Only fixed, public actions are sent to analytics. Never send command text.
export function eventFor(command, cwd, result) {
  const [action, target] = tokenize(command.trim());
  if (!["cd", "cat", "open"].includes(action)) return null;

  const resolved = resolvePath(cwd, target ?? (action === "cd" ? "~" : ""));
  if (!resolved) return null;
  const path = `/${resolved.parts.join("/")}`;

  if (action === "cd" && result.type === "empty" && resolved.parts.length === 1 && sections.has(resolved.parts[0])) {
    return `browse-${resolved.parts[0]}`;
  }

  if (action === "cat" && result.type === "text") {
    if (path === "/about.md") return "read-about";
    if (path === "/contact.md") return "read-contact";
    if (path === "/publications/probe-exploit.md") return "read-publication";
    if (resolved.parts[0] === "research") return "read-research";
    if (resolved.parts[0] === "education") return "read-education";
    if (path === "/resume/README.md") return "read-resume";
  }

  if (action === "open" && result.type === "open" && path === "/resume/cv.pdf") return "open-cv";
  return null;
}
