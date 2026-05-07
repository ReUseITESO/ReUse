import { chromium } from "playwright";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const MAX_ITERATIONS = 20;
const errorLogs = [];

async function runBot(startUrl, objective, email, password) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // ==============================
  // DETECCIÓN DE ERRORES
  // ==============================

  page.on("response", (response) => {
    const status = response.status();
    if (status >= 400) {
      errorLogs.push({
        type: "HTTP_ERROR",
        status,
        url: response.url(),
      });
    }
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errorLogs.push({
        type: "JS_ERROR",
        message: msg.text(),
      });
    }
  });

  await page.goto(startUrl);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: { responseMimeType: "application/json" },
  });

  let history = [];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    console.log(`\n--- Iteración ${i + 1} ---`);

    await page.waitForLoadState("networkidle").catch(() => false);
    // Give it a small extra wait for any dynamic rendering
    await page.waitForTimeout(1500);

    // Escanear elementos interactivos
    const interactables = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll("a, button, input, textarea, select")
      );
      return elements
        .map((el, index) => {
          let type = el.tagName.toLowerCase();
          if (type === "input") type += `[type=${el.type}]`;

          // Clean up text
          const text = (
            el.innerText ||
            el.value ||
            el.placeholder ||
            el.getAttribute("aria-label") ||
            el.name ||
            ""
          )
            .trim()
            .replace(/\s+/g, " ")
            .substring(0, 80);

          const href = el.getAttribute("href") || "";

          // Verificar si es visible
          const rect = el.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;

          if (isVisible && (text || href || type.includes("input") || type.includes("textarea"))) {
            // Assign custom ID for Playwright interaction
            el.setAttribute("data-qa-id", index.toString());
            return {
              id: index,
              tag: type,
              text: text,
              href: href,
            };
          }
          return null;
        })
        .filter((el) => el !== null);
    });

    if (interactables.length === 0) {
      console.log("No se encontraron elementos interactivos visibles.");
      history.push("La página no tiene elementos interactivos, no hay nada que hacer.");
      break;
    }

    const stateDesc = JSON.stringify(interactables, null, 2);

    const prompt = `
Eres un bot de QA autónomo llamado Antigravity. Tu objetivo es probar el siguiente caso de uso en la aplicación:
"${objective}"

Credenciales de prueba disponibles para hacer login si es necesario:
Email: ${email}
Password: ${password}

Historial de tus acciones previas en esta sesión:
${history.map((a, i) => `${i + 1}. ${a}`).join("\n")}

A continuación, la lista de elementos interactivos visibles en la página web actual (representados como un JSON):
${stateDesc}

INSTRUCCIONES:
1. Evalúa el estado actual de la página.
2. Compara tu progreso actual con el objetivo. Si ya se cumplió o es obvio que se ha completado (por ejemplo, ves un mensaje de éxito que esperabas), responde con "action": "done". Si estás bloqueado o hubo un error insuperable, "action": "fail".
3. Si aún debes continuar, elige el "id" del próximo elemento a interactuar.
4. Si el elemento es un input o textarea y requiere escritura, devuelve "action": "fill" y proporciona "fill_value" con los datos a escribir. Si necesitas escribir la contraseña, usa la que se te proporcionó.
5. Si el elemento es un botón o link, devuelve "action": "click".

Responde ÚNICAMENTE en formato JSON estricto con la siguiente estructura:
{
  "reason": "Explica tu razonamiento de por qué eliges esta acción y cómo te acerca a tu objetivo.",
  "action": "click" | "fill" | "done" | "fail",
  "element_id": <id numérico del elemento, usa null si action es done o fail>,
  "fill_value": "<valor a ingresar si action es fill, null en caso contrario>",
  "done_message": "<si completaste o fallaste, explica brevemente por qué>"
}
`;

    try {
      const result = await model.generateContent(prompt);
      let responseText = await result.response.text();
      
      // Strip markdown code block if present
      if (responseText.startsWith("```json")) {
          responseText = responseText.substring(7);
          if (responseText.endsWith("```")) {
              responseText = responseText.substring(0, responseText.length - 3);
          }
      } else if (responseText.startsWith("```")) {
          responseText = responseText.substring(3);
          if (responseText.endsWith("```")) {
              responseText = responseText.substring(0, responseText.length - 3);
          }
      }
      responseText = responseText.trim();
      
      const decision = JSON.parse(responseText);

      console.log(`🤖 Pensamiento: ${decision.reason}`);
      console.log(`🔹 Acción: ${decision.action}`);

      if (decision.action === "done") {
        console.log(`✅ OBJETIVO COMPLETADO: ${decision.done_message}`);
        break;
      } else if (decision.action === "fail") {
        console.log(`❌ OBJETIVO FALLIDO: ${decision.done_message}`);
        break;
      }

      if (decision.element_id === null || decision.element_id === undefined) {
          console.log("El LLM no devolvió un ID de elemento válido.");
          history.push("Error: el LLM intentó una acción sin especificar element_id.");
          continue;
      }

      const targetSelector = `[data-qa-id="${decision.element_id}"]`;
      const element = await page.$(targetSelector);

      if (!element) {
        console.log(`⚠️ Elemento con ID ${decision.element_id} no encontrado en el DOM, reintentando.`);
        history.push(`Intenté interactuar con el ID ${decision.element_id} pero no lo encontré en el DOM.`);
        continue;
      }

      // Interacción
      if (decision.action === "click") {
        // Remover target="_blank" si lo tiene
        await element.evaluate((el) => el.removeAttribute("target")).catch(() => {});

        await Promise.all([
          page.waitForNavigation({ timeout: 5000 }).catch(() => {}),
          element.click({ force: true }).catch((e) => console.error("Error al hacer click:", e.message)),
        ]);
        history.push(`Click en el elemento ID ${decision.element_id}`);
      } else if (decision.action === "fill") {
        const tagName = await element.evaluate(e => e.tagName.toLowerCase()).catch(() => "unknown");
        if (tagName === "input" || tagName === "textarea") {
          // Limpiar input primero y luego llenar
          await element.fill("");
          await element.fill(decision.fill_value);
          history.push(`Escribí "${decision.fill_value}" en el elemento ID ${decision.element_id}`);
        } else {
          console.log(`⚠️ El elemento ID ${decision.element_id} no es un input/textarea. Forzando click en su lugar.`);
          await element.click({ force: true }).catch(() => {});
          history.push(`Intenté escribir en ID ${decision.element_id} pero no era un input. Le hice click en su lugar.`);
        }
      }
      
    } catch (e) {
      console.error("⚠️ Error consultando a Gemini o ejecutando la acción JSON:", e.message);
      history.push(`Ocurrió un error inesperado de parseo o ejecución.`);
    }
  }

  console.log("\n=====================");
  console.log("⚠️ Errores de Consola/Red detectados en la sesión:");
  console.log(errorLogs.length > 0 ? errorLogs : "Ninguno.");
  
  await browser.close();
}

// ==============================
// EJECUCIÓN
// ==============================

const targetUrl = process.argv[2] || "http://localhost:3000";
const objective = process.argv[3] || "Inicia sesión y navega a tu perfil";
const email = process.argv[4] || "";
const password = process.argv[5] || "";

runBot(targetUrl, objective, email, password);