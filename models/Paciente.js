const mongoose = require('mongoose');

const TurnoSchema = new mongoose.Schema({
  id: String,
  fecha: String,
  hora: String,
  pacienteId: String,
  nombre: String,
  apellido: String,
  esTemporal: Boolean
});

const PacienteSchema = new mongoose.Schema({
  // Mantener id como String separado
  id: { 
    type: String,
    required: true,
    unique: true
  },
  nombre: String,
  apellido: String,
  telefono: String,
  fechaNacimiento: String,
  edad: Number,
  email: String,
  domicilio: String,
  ocupacion: String,
  
  // Datos médicos
  bordes: String,
  humedadExudado: String,
  infeccion: String,
  tejido: String,
  derivadoPor: String,
  derivadoA: String,
  estudiosPrevios: String,
  
  // Alergias y condiciones
  alergico: Boolean,
  AlergicoA: String,
  tieneH2O: Boolean,
  cantidadDeH2O: String,
  esDiabetico: Boolean,
  diabetico: String,
  tieneTiroides: Boolean,
  antecedentesTiroideos: String,
  tieneSupraRrenal: Boolean,
  antecedentesSupraRrenales: String,
  tieneAntecedentesOvaricos: Boolean,
  antecedentesOvaricos: String,
  tieneInfectoContagiosas: Boolean,
  enfermedadesInfectoContagiosas: String,
  
  // Antecedentes
  motivoDeConsulta: String,
  seleccionarAntecedenteHereditario: String,
  antecedentesHereditarios: {
    ninguno: String,
    padres: String,
    hermanos: String,
    abuelos: String,
    otros: String
  },
  heridasGraves: String,
  valoracionDelDolor: String,
  habitos: String,
  enfermedades: String,
  escalaValidada: String,
  
  // Estilo de vida
  actividadFisica: Boolean,
  frecuenciaDeEjercitacion: String,
  consumeAlcohol: Boolean,
  frecuenciaDeConsumo: String,
  consumeTabaco: Boolean,
  frecuenciaDeConsumoDeTabaco: String,
  
  // Tratamientos
  tratamientoActualOCronico: String,
  tieneTratamientoActualOCronico: Boolean,
  consumeMedicamentos: Boolean,
  medicacionQueConsume: String,
  usaCosmeticos: Boolean,
  cosmeticosQueUsa: String,
  
  // Características de la piel
  seleccionarBiotipoCutaneo: String,
  biotipoCutaneo: {
    normal: String,
    seca: String,
    grasa: String,
    mixta: String
  },
  seleccionarFototipoCutaneo: String,
  fototipoCutaneo: {
    I: String,
    II: String,
    III: String,
    IV: String,
    V: String,
    VI: String
  },
  
  // Evaluación dermatológica
  sensibilidad: String,
  lesiones: String,
  observacionesMaculaPigmentaria: String,
  observacionesMaculaVascular: String,
  observacionesAcne: String,
  tiempoDeEvolucionDelAcne: String,
  tratamientoMedicoOCosmetologicoAnterior: String,
  tratamientoAdministrado: String,
  evolucion: String,
  tratamiento: String,
  
  // Lesiones específicas (como objeto para mejor organización)
  lesionesEspecificas: {
    eritema: Boolean,
    eritrosis: Boolean,
    telangiectasias: Boolean,
    cuperosis: Boolean,
    rosacea: Boolean,
    rinofima: Boolean,
    angiomaPlano: Boolean,
    tuberoso: Boolean,
    estelar: Boolean,
    purpura: Boolean,
    hiperpigmentadas: Boolean,
    pecas: Boolean,
    lentigos: Boolean,
    melasma: Boolean,
    vitiligo: Boolean,
    comedones: Boolean,
    papulas: Boolean,
    pustulas: Boolean,
    tuberculos: Boolean,
    nodulos: Boolean,
    arrugillas: Boolean,
    arrugas: Boolean,
    flemonoso: Boolean
  },
  
  // Ácidos usados (como objeto separado)
  acidosUsados: {
    ahas: Boolean,
    malico: Boolean,
    citrico: Boolean,
    tartarico: Boolean,
    lactico: Boolean,
    glicolico: Boolean,
    mandelico: Boolean,
    fiftico: Boolean,
    kojico: Boolean,
    bhas: Boolean,
    salicilico: Boolean,
    phas: Boolean,
    gluconolactona: Boolean,
    lactobionico: Boolean
  },
  
  // Localización del acné
  acneLocalizacion: {
    cara: Boolean,
    cuello: Boolean,
    zonaEsternal: Boolean,
    espalda: Boolean,
    brazos: Boolean,
    piernas: Boolean,
    nalgas: Boolean
  },
  
  // Multimedia y turnos
  // En el schema de Paciente
  fotosDelPaciente: {
    type: [String], // Array de strings
    default: []
  },
  turnos: [TurnoSchema]
}, { 
  _id: true // Permitir que MongoDB genere su propio _id 
});

module.exports = mongoose.model('Paciente', PacienteSchema);