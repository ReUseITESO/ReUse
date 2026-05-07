import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// ==============================
// CONFIGURACIÓN
// ==============================

// Cambia esta ruta a tu archivo
const INPUT_FILE = "./requirements.md";

// Archivo de salida
const OUTPUT_FILE = "./plan-de-pruebas.md";

// Inicializar cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==============================
// Leer archivo
// ==============================

function readRequirements(filePath) {
  try {
    return fs.readFileSync(path.resolve(filePath), "utf-8");
  } catch (error) {
    console.error("Error leyendo archivo:", error.message);
    process.exit(1);
  }
}

// ==============================
// Generar plan de pruebas
// ==============================

async function generateTestPlan(requirements) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
    });

    const prompt = `
Eres un experto en QA.

Lee los siguientes requisitos y genera un Plan de Pruebas EXHAUSTIVO en formato Markdown.

Debe incluir:

1. Estrategia de pruebas
2. Escenarios de prueba detallados (paso a paso)
3. Pruebas negativas
4. Casos edge
5. Criterios de aceptación

IMPORTANTE:
- Usa tablas para los casos de prueba
- Incluye ID, descripción, pasos y resultado esperado
- Sé claro, estructurado y profesional

REQUISITOS:
${requirements}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error("Error con Gemini:", error.message);
    process.exit(1);
  }
}

// ==============================
// Guardar resultado
// ==============================

function saveTestPlan(content, filePath) {
  try {
    fs.writeFileSync(path.resolve(filePath), content, "utf-8");
    console.log(`Plan generado en: ${filePath}`);
  } catch (error) {
    console.error("Error guardando archivo:", error.message);
  }
}

// ==============================
// MAIN
// ==============================

async function main() {
  console.log("Leyendo requisitos...");
  const requirements = readRequirements(INPUT_FILE);

  console.log("Generando plan de pruebas con Gemini...");
  const testPlan = await generateTestPlan(requirements);

  console.log("Guardando resultado...");
  saveTestPlan(testPlan, OUTPUT_FILE);
}

main();