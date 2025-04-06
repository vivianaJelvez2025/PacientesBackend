const mongoose = require('mongoose');

const TemporaryAppointmentSchema = new mongoose.Schema({
  id: {
    type: String,
    default: 'temp_appointments',
    required: true
  },
  turnos: [{
    id: String,
    fecha: String,
    hora: String,
    pacienteId: String,
    nombre: String,
    apellido: String,
    esTemporal: Boolean,
    observaciones: String
  }]
});

module.exports = mongoose.model('TemporaryAppointment', TemporaryAppointmentSchema);