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

// Generador de _keys únicos obligatorios para Sanity
const generateKey = () => crypto.randomBytes(8).toString("hex");

const parseMarkdownList = (text) => {
  if (!text) return [];
  return text
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.replace(/^-\s*/, "").trim());
};

const parseMarkdownText = (text) => (text ? text.trim() : "");

async function processFile(filePath) {
  const ext = path.extname(filePath);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  let sanityDoc = {};

  if (ext === ".yaml" || ext === ".yml") {
    sanityDoc = yaml.parse(fileContent);

    // SOLUCIÓN 1: Inyectar _key en los arrays de objetos (Obligatorio en Sanity)
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

    // SOLUCIÓN 2: Re-mapear variables planas a objetos anidados para Proyectos
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
      // SOLUCIÓN 3: Regex más robusto para que soporte saltos de línea sin romperse
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
        // Lógica estricta SOLO para el Perfil
        sanityDoc.bio = sanityDoc.bio || {};
        sanityDoc.bio.es = esContent ? esContent.trim().split(/\n{2,}/) : [];
        sanityDoc.bio.en = enContent ? enContent.trim().split(/\n{2,}/) : [];
      } else if (sanityDoc._type === "project") {
        // Lógica estricta SOLO para los Proyectos
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
    const result = await client.createOrReplace(sanityDoc);
    console.log(
      `✅ [${result._type}] Sincronizado correctamente: ${result.title?.en || result.title || result._id}`,
    );
  } catch (error) {
    console.error(
      `❌ Error validando/sincronizando ${path.basename(filePath)}:`,
      error.message,
    );
  }
}

async function runSync() {
  console.log("🚀 Iniciando sincronización Content-as-Code...");

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

  console.log("🎉 Sincronización completada.");
}

runSync();
