import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));

// Serve three.js from node_modules
app.use('/lib/three', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/lib/three/addons', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Neon Rush server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
