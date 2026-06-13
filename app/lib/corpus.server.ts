import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCorpus } from "./corpus/repo";

// Server-only Corpus singleton. The `.server` suffix guarantees this (and its
// node:fs / git dependencies) never ends up in the client bundle.
//
// Where tenant Corpus repos live: prod = a Fly volume mount (set CORPUS_ROOT);
// local = a gitignored .data/ dir. The dev default is anchored to the app
// directory, not process.cwd() — the dev server's cwd is unreliable.
const here = path.dirname(fileURLToPath(import.meta.url));
const CORPUS_ROOT =
  process.env.CORPUS_ROOT ?? path.resolve(here, "../../.data/corpus");

export const corpus = createCorpus(CORPUS_ROOT);
