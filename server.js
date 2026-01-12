const express = require('express');
const path = require('path');

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
