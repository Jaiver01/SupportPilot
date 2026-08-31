import path from "node:path";
import { promises as fs } from "node:fs";
import matter from "gray-matter";
import type { KnowledgeBaseSearcher, KnowledgeDocument } from "./types.js";

interface RawDocument {
  id: string;
  title: string;
  content: string;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function score(queryTokens: string[], targetText: string): number {
  if (queryTokens.length === 0) {
    return 0;
  }

  const target = tokenize(targetText);
  if (target.length === 0) {
    return 0;
  }

  const targetSet = new Set(target);
  const overlap = queryTokens.filter((token) => targetSet.has(token)).length;
  return overlap / queryTokens.length;
}

async function readMarkdownDocs(baseDir: string): Promise<RawDocument[]> {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const docs: RawDocument[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }

    const fullPath = path.join(baseDir, entry.name);
    const raw = await fs.readFile(fullPath, "utf8");
    const parsed = matter(raw);
    const fallbackId = entry.name.replace(/\.md$/i, "");
    const titleLine = parsed.content
      .split("\n")
      .find((line) => line.trim().startsWith("# "));

    docs.push({
      id: typeof parsed.data.id === "string" ? parsed.data.id : fallbackId,
      title:
        typeof parsed.data.title === "string"
          ? parsed.data.title
          : (titleLine?.replace(/^#\s+/, "").trim() ?? fallbackId),
      content: parsed.content
    });
  }

  return docs;
}

export class MarkdownKnowledgeBaseSearcher implements KnowledgeBaseSearcher {
  constructor(private readonly baseDir: string) {}

  async search(query: string): Promise<KnowledgeDocument[]> {
    const docs = await readMarkdownDocs(this.baseDir);
    const queryTokens = tokenize(query);

    return docs
      .map((doc) => ({
        ...doc,
        relevance: score(queryTokens, `${doc.title}\n${doc.content}`)
      }))
      .filter((doc) => doc.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }
}
