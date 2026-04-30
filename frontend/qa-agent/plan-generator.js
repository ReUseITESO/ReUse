'use strict';

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('./utils/env');

/**
 * PlanGenerator — Usa IA para transformar historias de usuario
 * en un Plan de Pruebas estructurado y profesional.
 */
async function generatePlan() {
  console.log('🤖 Generador de Planes de Prueba con IA');
  
  if (!env.GOOGLE_API_KEY || env.GOOGLE_API_KEY === 'TU_API_KEY_AQUI') {
    console.error('❌ Error: No se encontró GOOGLE_API_KEY en .env.playwright');
    console.log('Por favor, obtén una en https://aistudio.google.com/ y agrégala a tu archivo .env.playwright');
    process.exit(1);
  }

  const storiesPath = path.join(__dirname, 'stories', 'equipo-asignado.txt');
  if (!fs.existsSync(storiesPath)) {
    console.error('❌ Error: No se encontró el archivo de historias en ' + storiesPath);
    process.exit(1);
  }

  const storiesContent = fs.readFileSync(storiesPath, 'utf8');
  if (storiesContent.length < 10) {
    console.error('❌ Error: El archivo de historias parece estar vacío.');
    process.exit(1);
  }

  console.log('📖 Leyendo historias de usuario...');
  
  const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });




  const prompt = `
    Eres un experto en QA Automation y Software Testing. 
    Tu tarea es generar un "Plan de Pruebas" profesional basado en las siguientes Historias de Usuario de una aplicación web llamada "ReUse" (una plataforma de marketplace circular para estudiantes).

    HISTORIAS DE USUARIO:
    ${storiesContent}

    El plan de pruebas debe estar en formato MARKDOWN y debe incluir:
    1. INTRODUCCIÓN (Breve resumen del alcance).
    2. ESTRATEGIA DE PRUEBAS (Enfoque automatizado con Playwright + Agente IA).
    3. ESCENARIOS DE PRUEBA (Para cada historia de usuario, detalla pasos y resultados esperados).
    4. PRUEBAS NEGATIVAS Y DE BORDE (Considera qué podría fallar).
    5. CRITERIOS DE ACEPTACIÓN.

    Usa un tono formal y profesional. El documento será entregado a un profesor universitario.
  `;

  try {
    console.log('🧠 IA Pensando (Gemini)...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

    const outputPath = path.join(reportsDir, `test-plan-${timestamp}.md`);
    fs.writeFileSync(outputPath, text);

    console.log('\n✅ Plan de Pruebas generado con éxito!');
    console.log(`📄 Archivo: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error al generar el plan:', error.message);
  }
}

generatePlan();
