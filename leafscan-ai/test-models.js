// Test script to list available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Read API key from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const apiKey = envContent.match(/GEMINI_API_KEY=(.*)/)[1].trim();

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('🔍 Fetching available Gemini models...\n');
    
    // Try to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.models) {
      console.log('✅ Available Models:\n');
      data.models.forEach(model => {
        console.log(`📦 ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Description: ${model.description}`);
        console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
      
      // Find models that support generateContent
      const visionModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      console.log('\n🎯 Models that support image analysis (generateContent):\n');
      visionModels.forEach(model => {
        console.log(`   ✓ ${model.name.replace('models/', '')}`);
      });
    } else {
      console.error('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Error fetching models:', error.message);
  }
}

listModels();
