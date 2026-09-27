import { filesystem } from "./content.mjs";

const commandHelp = [
  ["ls [path]", "List files and directories"],
  ["cd [path]", "Change directory (try cd .. to go back)"],
  ["cat <file>", "Read a text file"],
  ["open <file>", "Open a PDF in a new tab"],
  ["pwd", "Show the current path"],
  ["tree [path]", "Show a directory tree"],
  ["history", "Show commands used in this visit"],
  ["whoami", "Show who is using this terminal"],
  ["clear", "Clear terminal output"],
  ["help", "Show this guide"],
];

export function tokenize(input) {
  const tokens = [];
  const expression = /"([^"]*)"|'([^']*)'|(\S+)/g;
  for (const match of input.matchAll(expression)) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }
  return tokens;
}

export function displayPath(parts) {
  return parts.length ? `~/${parts.join("/")}` : "~";
}

export function resolvePath(cwd, rawPath = ".") {
  const input = rawPath || ".";
  const absolute = input.startsWith("/") || input.startsWith("~");
  const base = absolute ? [] : [...cwd];
  const segments = input.replace(/^~/, "").split("/");
  for (const segment of segments) {
    if (!segment || segment === ".") continue;
    if (segment === "..") base.pop();
    else base.push(segment);
  }
  let node = filesystem;
  for (const segment of base) {
    if (node.type !== "directory" || !Object.hasOwn(node.children, segment)) return null;
    node = node.children[segment];
  }
  return { parts: base, node };
}

function itemsFor(node) {
  return Object.entries(node.children).map(([name, child]) => ({
    name,
    type: child.type,
    label: child.label,
  }));
}

function treeLines(node, prefix = "") {
  const entries = Object.entries(node.children);
  return entries.flatMap(([name, child], index) => {
    const last = index === entries.length - 1;
    const line = `${prefix}${last ? "└── " : "├── "}${name}${child.type === "directory" ? "/" : ""}`;
    return child.type === "directory"
      ? [line, ...treeLines(child, `${prefix}${last ? "    " : "│   "}`)]
      : [line];
  });
}

export function createShell() {
  let cwd = [];
  const history = [];

  function execute(rawInput) {
    const input = rawInput.trim();
    if (!input) return { type: "empty" };
    history.push(input);
    const [command, ...args] = tokenize(input);
    const target = args[0] ?? ".";

    if (command === "help") return { type: "help", commands: commandHelp };
    if (command === "clear") return { type: "clear" };
    if (command === "pwd") return { type: "text", text: `/${cwd.join("/")}` || "/" };
    if (command === "whoami") return { type: "text", text: "visitor — exploring Yibin Fan's site" };
    if (command === "history") return { type: "text", text: history.map((entry, index) => `${String(index + 1).padStart(3)}  ${entry}`).join("\n") };

    if (command === "cd") {
      const path = args[0] ?? "~";
      const resolved = resolvePath(cwd, path);
      if (!resolved) return { type: "error", text: `cd: no such directory: ${path}` };
      if (resolved.node.type !== "directory") return { type: "error", text: `cd: not a directory: ${path}` };
      cwd = resolved.parts;
      return { type: "empty" };
    }

    if (command === "ls") {
      const path = args.find((arg) => !arg.startsWith("-")) ?? ".";
      const resolved = resolvePath(cwd, path);
      if (!resolved) return { type: "error", text: `ls: no such file or directory: ${path}` };
      if (resolved.node.type !== "directory") return { type: "list", items: [{ name: resolved.parts.at(-1), type: resolved.node.type }], path: resolved.parts.slice(0, -1) };
      return { type: "list", items: itemsFor(resolved.node), path: resolved.parts };
    }

    if (command === "tree") {
      const resolved = resolvePath(cwd, target);
      if (!resolved) return { type: "error", text: `tree: no such directory: ${target}` };
      if (resolved.node.type !== "directory") return { type: "error", text: `tree: not a directory: ${target}` };
      return { type: "text", text: `${displayPath(resolved.parts)}\n${treeLines(resolved.node).join("\n")}` };
    }

    if (command === "cat" || command === "open") {
      if (!args.length) return { type: "error", text: `${command}: missing file operand` };
      const resolved = resolvePath(cwd, args[0]);
      if (!resolved) return { type: "error", text: `${command}: no such file: ${args[0]}` };
      if (resolved.node.type === "directory") return { type: "error", text: `${command}: is a directory: ${args[0]}` };
      if (resolved.node.type === "pdf") {
        return command === "open"
          ? { type: "open", href: resolved.node.href, label: resolved.node.label }
          : { type: "error", text: `cat: ${args[0]} is a PDF. Use "open ${args[0]}" instead.` };
      }
      return command === "cat"
        ? { type: "text", text: resolved.node.content }
        : { type: "error", text: `open: ${args[0]} is a text file. Use "cat ${args[0]}" instead.` };
    }

    return { type: "error", text: `${command}: command not found. Type "help" for available commands.` };
  }

  function completions(input) {
    const tokens = tokenize(input);
    const endsWithSpace = /\s$/.test(input);
    if (!tokens.length) return ["help", "ls", "cd", "cat", "pwd", "tree", "open", "clear"];
    if (tokens.length === 1 && !endsWithSpace) {
      return [...commandHelp.map(([name]) => name.split(" ")[0]), "whoami"].filter((command) => command.startsWith(tokens[0]));
    }
    const command = tokens[0];
    if (!["ls", "cd", "cat", "open", "tree"].includes(command)) return [];
    const partial = endsWithSpace ? "" : tokens.at(-1);
    const slash = partial.lastIndexOf("/");
    const parent = slash >= 0 ? partial.slice(0, slash + 1) : "";
    const start = slash >= 0 ? partial.slice(slash + 1) : partial;
    const resolved = resolvePath(cwd, parent || ".");
    if (!resolved || resolved.node.type !== "directory") return [];
    return Object.entries(resolved.node.children)
      .filter(([name, node]) => name.startsWith(start) && (command !== "cd" || node.type === "directory"))
      .map(([name, node]) => `${parent}${name}${node.type === "directory" ? "/" : ""}`);
  }

  return {
    execute,
    completions,
    get cwd() { return [...cwd]; },
    get history() { return [...history]; },
  };
}
