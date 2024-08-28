import { storeDocument } from '../config/vectorDbConfig.js';
import fs from 'fs/promises';
import path from 'path';

async function populateDatabase() {
  try {
    // Read the HR policy PDF content
    const pdfPath = path.join(process.cwd(), 'path/to/your/hrpolicy.pdf');
    const pdfContent = await fs.readFile(pdfPath, 'utf8');

    // Store the document in the vector database
    await storeDocument('hr_policy', pdfContent);
    console.log('HR policy successfully stored in the vector database');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populateDatabase();