import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

// Serve static files from Vite build output
app.use(express.static(distPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// SPA Fallback for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Boutique Guerreros de la Luz server running on port ${port}`);
});
