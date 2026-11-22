import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "yaml";
import { createClient } from "@sanity/client";
import crypto from "crypto";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-03-15",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const CONTENT_DIR = path.join(process.cwd(), "content");

// Sanity requires a unique _key on every item of an array of objects.
const generateKey = () => crypto.randomBytes(8).toString("hex");

const parseMarkdownList = (text) => {
  if (!text) return [];
  return text
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.replace(/^-\s*/, "").trim());
};

const parseMarkdownText = (text) => (text ? text.trim() : "");

// The GROQ queries sort lists by these fields, so they must exist and share
// one format: "2022-09" and "2022-09-01" don't compare as the same month.
const DATE_FIELDS = {
  experience: ["startDate"],
  project: ["startDate"],
  certification: ["date"],
};

const normalizeDate = (value) => {
  // YAML parses unquoted dates into Date objects.
  const str = value instanceof Date ? value.toISOString() : String(value ?? "");
  const match = str.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!match) return null;
  const [, year, month, day = "01"] = match;
  return `${year}-${month}-${day}`;
};

const normalizeDates = (doc) => {
  for (const field of DATE_FIELDS[doc._type] ?? []) {
    const date = normalizeDate(doc[field]);
    if (!date) {
      throw new Error(
        `"${field}" is missing or invalid (format YYYY-MM or YYYY-MM-DD)`,
      );
    }
    doc[field] = date;
  }
};

// The only write path into Sanity skips the Studio's schema rules, so the
// project's Lighthouse snapshot is checked here. Unknown keys are rejected so
// a typo can't silently drop a score.
const LIGHTHOUSE_KEYS = ["measuredAt", "formFactor", "scores"];
const LIGHTHOUSE_SCORES = ["performance", "accessibility", "bestPractices", "seo"];
const FORM_FACTORS = ["mobile", "desktop"];

const unknownKeys = (obj, allowed) => Object.keys(obj).filter((k) => !allowed.includes(k));

const validateLighthouse = (doc) => {
  if (doc._type !== "project" || doc.lighthouse === undefined) return;
  const lh = doc.lighthouse;
  if (!doc.link) {
    throw new Error(`"lighthouse" requires "link": the scores describe that URL`);
  }
  if (!lh || typeof lh !== "object" || Array.isArray(lh)) {
    throw new Error(`"lighthouse" must be an object with ${LIGHTHOUSE_KEYS.join(", ")}`);
  }
  const extra = unknownKeys(lh, LIGHTHOUSE_KEYS);
  if (extra.length) throw new Error(`"lighthouse" has unknown keys: ${extra.join(", ")}`);

  // YAML parses an unquoted date into a Date at UTC midnight.
  const measuredAt = lh.measuredAt instanceof Date ? lh.measuredAt.toISOString().slice(0, 10) : lh.measuredAt;
  const isRealDate =
    typeof measuredAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(measuredAt) &&
    new Date(`${measuredAt}T00:00:00Z`).toISOString().startsWith(measuredAt);
  if (!isRealDate) {
    throw new Error(`"lighthouse.measuredAt" is missing or invalid (format YYYY-MM-DD): ${lh.measuredAt}`);
  }
  lh.measuredAt = measuredAt;

  if (!FORM_FACTORS.includes(lh.formFactor)) {
    throw new Error(`"lighthouse.formFactor" must be ${FORM_FACTORS.join(" or ")}: ${lh.formFactor}`);
  }

  const scores = lh.scores;
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    throw new Error(`"lighthouse.scores" must be an object with ${LIGHTHOUSE_SCORES.join(", ")}`);
  }
  const extraScores = unknownKeys(scores, LIGHTHOUSE_SCORES);
  if (extraScores.length) {
    throw new Error(`"lighthouse.scores" has unknown keys: ${extraScores.join(", ")}`);
  }
  for (const key of LIGHTHOUSE_SCORES) {
    const score = scores[key];
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      throw new Error(`"lighthouse.scores.${key}" must be an integer between 0 and 100: ${score}`);
    }
  }
};

async function processFile(filePath) {
  const ext = path.extname(filePath);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  let sanityDoc = {};

  if (ext === ".yaml" || ext === ".yml") {
    sanityDoc = yaml.parse(fileContent);

    // Sanity rejects arrays of objects whose items have no _key.
    if (sanityDoc._type === "skills") {
      ["technical", "soft", "languages"].forEach((field) => {
        if (Array.isArray(sanityDoc[field])) {
          sanityDoc[field] = sanityDoc[field].map((item) => ({
            ...item,
            _key: generateKey(),
          }));
        }
      });
    }
  } else if (ext === ".md") {
    const { data, content } = matter(fileContent);
    sanityDoc = { ...data };

    // Project frontmatter keeps per-locale values flat (title_es, title_en...);
    // the schema expects them nested as { es, en }.
    if (sanityDoc._type === "project") {
      sanityDoc.title = {
        es: sanityDoc.title_es || "",
        en: sanityDoc.title_en || "",
      };
      delete sanityDoc.title_es;
      delete sanityDoc.title_en;

      sanityDoc.features = {
        es: sanityDoc.features_es || [],
        en: sanityDoc.features_en || [],
      };
      delete sanityDoc.features_es;
      delete sanityDoc.features_en;

      sanityDoc.challenges = {
        es: sanityDoc.challenges_es || [],
        en: sanityDoc.challenges_en || [],
      };
      delete sanityDoc.challenges_es;
      delete sanityDoc.challenges_en;
    }

    if (content.trim()) {
      // [\s\S] spans line breaks; each section ends at the other locale's heading.
      const esMatch = content.match(/## es\s*([\s\S]*?)(?=## en|$)/);
      const enMatch = content.match(/## en\s*([\s\S]*?)(?=## es|$)/);

      const esContent = esMatch ? esMatch[1] : "";
      const enContent = enMatch ? enMatch[1] : "";

      if (sanityDoc._type === "experience") {
        sanityDoc.description = {
          es: parseMarkdownList(esContent),
          en: parseMarkdownList(enContent),
        };
      } else if (sanityDoc._type === "profile") {
        // Profile only: each blank-line-separated paragraph is one bio entry.
        sanityDoc.bio = sanityDoc.bio || {};
        sanityDoc.bio.es = esContent ? esContent.trim().split(/\n{2,}/) : [];
        sanityDoc.bio.en = enContent ? enContent.trim().split(/\n{2,}/) : [];
      } else if (sanityDoc._type === "project") {
        // Projects only: the description is a single text per locale.
        sanityDoc.description = sanityDoc.description || {};
        sanityDoc.description.es = parseMarkdownText(esContent);
        sanityDoc.description.en = parseMarkdownText(enContent);
      }
    }
  }

  if (sanityDoc.slug && typeof sanityDoc.slug === "string") {
    sanityDoc.slug = { _type: "slug", current: sanityDoc.slug };
  }

  try {
    normalizeDates(sanityDoc);
    validateLighthouse(sanityDoc);
    const result = await client.createOrReplace(sanityDoc);
    console.log(
      `✅ [${result._type}] Synced: ${result.title?.en || result.title || result._id}`,
    );
  } catch (error) {
    console.error(
      `❌ Error validating/syncing ${path.basename(filePath)}:`,
      error.message,
    );
  }
}

async function runSync() {
  console.log("🚀 Starting content-as-code sync...");

  const singletonsDir = path.join(CONTENT_DIR, "singletons");
  if (fs.existsSync(singletonsDir)) {
    const files = fs.readdirSync(singletonsDir);
    for (const file of files) await processFile(path.join(singletonsDir, file));
  }

  const collectionsDir = path.join(CONTENT_DIR, "collections");
  if (fs.existsSync(collectionsDir)) {
    const folders = fs.readdirSync(collectionsDir);
    for (const folder of folders) {
      const folderPath = path.join(collectionsDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath);
        for (const file of files)
          await processFile(path.join(folderPath, file));
      }
    }
  }

  console.log("🎉 Sync complete.");
}

runSync();
