require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
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

// Remove the push token registration route since notifications are now handled client-side

// Conectar a MongoDB
connectDB();

// Remove the "Start scheduled tasks" comment since there are no scheduled tasks anymore

// Rutas
app.use('/api/patients', require('./routes/patients'));

// Iniciar servidor
// Modificar la línea de inicio del servidor
const PORT = process.env.PORT || 5000;

/* app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://192.168.0.16:${PORT}`); */
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});