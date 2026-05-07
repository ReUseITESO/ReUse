const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ==========================================
// CONFIGURACIÓN (Cambia estos valores)
// ==========================================
const API_KEY = 'AIzaSyD5FvsgWmI8GybobnmP7ruhSbYcllZ2vMk'; // Reemplaza con tu API Key de Google Gemini
const REQUIREMENTS_FILE_PATH = './requisitos.md'; // Ruta de tu archivo de requisitos
const OUTPUT_FILE_PATH = './plan-de-pruebas.md'; // Archivo donde se guardará el plan

async function generateQAPlan() {
    try {
        // 1. Leer el archivo de requisitos
        if (!fs.existsSync(REQUIREMENTS_FILE_PATH)) {
            console.error(`❌ Error: No se encontró el archivo en la ruta: ${REQUIREMENTS_FILE_PATH}`);
            console.log('💡 Por favor, asegúrate de que el archivo existe o cambia la ruta en REQUIREMENTS_FILE_PATH.');
            return;
        }
        
        console.log(`📄 Leyendo requisitos desde: ${REQUIREMENTS_FILE_PATH}`);
        const requirementsContent = fs.readFileSync(REQUIREMENTS_FILE_PATH, 'utf-8');

        // 2. Inicializar el SDK de Gemini
        // Si prefieres usar OpenAI, deberás cambiar esta sección por el SDK de OpenAI ('openai')
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Usamos gemini-2.5-flash por ser rápido y excelente para texto
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // 3. Preparar el prompt con el rol específico solicitado
        const prompt = `Eres un experto en QA. Lee estos requisitos y genera un Plan de Pruebas exhaustivo en formato Markdown, incluyendo: Estrategia, Escenarios de Prueba paso a paso, Pruebas Negativas y Criterios de Aceptación.

Requisitos de la aplicación:
---
${requirementsContent}
---
`;

        console.log('🤖 Generando Plan de Pruebas con Inteligencia Artificial...');
        
        // 4. Enviar la petición al modelo
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 5. Guardar la respuesta generada en el archivo local
        fs.writeFileSync(OUTPUT_FILE_PATH, text, 'utf-8');
        console.log(`\n✅ ¡Éxito! Plan de Pruebas generado y guardado en: ${OUTPUT_FILE_PATH}`);

    } catch (error) {
        console.error('\n❌ Ocurrió un error al intentar generar el plan de pruebas:');
        console.error(error.message);
    }
}

// Ejecutar la función principal
generateQAPlan();
