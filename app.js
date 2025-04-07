require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const https = require('https');
// Remove the PushToken import since it's no longer needed
const app = express();

// Middlewares
app.use(cors());  // Permite solicitudes desde tu app de Expo
app.use(express.json({ limit: '10mb' }));  // Aumentar el límite de tamaño de JSON

// Añadir ruta de ping para mantener el servidor activo
app.get('/api/ping', (req, res) => {
  //console.log('Ping recibido:', new Date().toLocaleString());
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Función para hacer auto-ping cada 14 minutos
function setupAutoPing(url) {
  const interval = 14 * 60 * 1000; // 14 minutos en milisegundos
  
  setInterval(() => {
    https.get(url, (res) => {
      console.log(`Auto-ping realizado: ${new Date().toISOString()}, Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`Error en auto-ping: ${err.message}`);
    });
  }, interval);
  
  console.log(`Auto-ping configurado para ejecutarse cada 14 minutos a: ${url}`);
}

// Conectar a MongoDB
connectDB();

// Rutas
app.use('/api/patients', require('./routes/patients'));

// Iniciar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  
  // Configurar auto-ping después de que el servidor esté en funcionamiento
  // Reemplaza esta URL con la URL real de tu aplicación en Render
  const appUrl = process.env.APP_URL || 'https://pacientesbackends.onrender.com';
  setupAutoPing(`${appUrl}/api/ping`);
});