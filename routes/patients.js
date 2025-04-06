const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Paciente = require('../models/Paciente');
const cloudinary = require('../config/cloudinary');
// Importar el controlador
const { 
  createPaciente, 
  getPacientes, 
  getPacienteById, 
  updatePaciente, 
  deletePaciente,
  getPacientePhotos,
  deletePatientPhoto,
  getPacientesSummary,
  updateTemporaryAppointments,
  getTemporaryAppointments,
} = require('../controllers/patients');

// POST routes
router.post('/', createPaciente);
// Add temporary appointments routes BEFORE any routes with parameters
router.post('/temp-appointments', updateTemporaryAppointments);
router.get('/temp-appointments', getTemporaryAppointments);

// GET routes without parameters
router.get('/', getPacientes);
router.get('/summary', getPacientesSummary);

// Routes with parameters should come AFTER more specific routes
router.get('/:id', getPacienteById);
router.get('/:id/photos', getPacientePhotos);
router.put('/:id', updatePaciente);
router.delete('/:id', deletePaciente);
router.delete('/:id/photo', deletePatientPhoto);

// Ruta para actualizar la foto del paciente
router.put('/:id/photo', async (req, res) => {
  try {
    const { id } = req.params;
    const { base64Photo } = req.body;

    // Buscar por el campo id personalizado en vez de _id
    const paciente = await Paciente.findOne({ id: id });
    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    // Subir la imagen a Cloudinary
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Photo}`, {
      folder: `pacientes/${id}`,
      format: 'webp',
      quality: 'auto:good',
    });
    // Agregar la foto al array de fotos del paciente
    paciente.fotosDelPaciente.push(result.secure_url);
    await paciente.save();

    res.json({ message: 'Foto actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la foto:', error);
    res.status(500).json({ message: 'Error al actualizar la foto' });
  }
});

module.exports = router;