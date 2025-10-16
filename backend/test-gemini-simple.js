const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyC-CgILJvJgqegvx7-z_6urDPf-WxqHcbc';
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  const models = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro', 'embedding-001'];
  
  for (const modelName of models) {
    try {
      console.log(`\nTrying: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello');
      console.log(`✅ ${modelName} WORKS!`);
      console.log('Response:', result.response.text());
      break;
    } catch (e) {
      console.log(`❌ ${modelName} failed: ${e.message.substring(0, 80)}`);
    }
  }
}

test();
