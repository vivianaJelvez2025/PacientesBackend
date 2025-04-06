const Paciente = require('../models/Paciente');
const TemporaryAppointment = require('../models/TemporaryAppointment');
const mongoose = require('mongoose');


exports.createPaciente = async (req, res) => {
  try {
    if (req.body._id === '') delete req.body._id;
    const newPaciente = new Paciente(req.body);
    const savedPaciente = await newPaciente.save();
    res.status(201).json(savedPaciente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.find();
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add these new controller methods

exports.getPacienteById = async (req, res) => {
  try {
    const paciente = await Paciente.findOne({ id: req.params.id });
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPacientePhotos = async (req, res) => {
  try {
    const paciente = await Paciente.findOne({ id: req.params.id }, 'fotosDelPaciente');
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json({ photos: paciente.fotosDelPaciente });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePaciente = async (req, res) => {
  try {
    console.log(`Recibida solicitud para actualizar paciente con ID: ${req.params.id}`);
    console.log('Datos recibidos, incluyendo turnos:', JSON.stringify(req.body.turnos));
    
    // Asegurarse de que todos los campos, incluidos los turnos, se actualicen
    const paciente = await Paciente.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true, overwrite: false }
    );
    
    if (!paciente) {
      console.log(`Paciente con ID ${req.params.id} no encontrado`);
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    console.log('Paciente actualizado con turnos:', JSON.stringify(paciente.turnos));
    res.json(paciente);
  } catch (error) {
    console.error(`Error al actualizar paciente: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

/* exports.deletePaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findOneAndDelete({ id: req.params.id });
    
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; */
exports.deletePaciente = async (req, res) => {
  try {
    // Primero, obtener el paciente para acceder a sus fotos
    const paciente = await Paciente.findOne({ id: req.params.id });
    
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    // Eliminar todas las fotos de Cloudinary si existen
    if (paciente.fotosDelPaciente && paciente.fotosDelPaciente.length > 0) {
      const cloudinary = require('cloudinary').v2;
      
      for (const photoUrl of paciente.fotosDelPaciente) {
        if (photoUrl.includes('cloudinary.com')) {
          try {
            // Extraer el public_id de la URL de Cloudinary usando la misma lógica que en deletePatientPhoto
            let cleanUrl = photoUrl;
            if (photoUrl.includes('/upload/')) {
              const parts = photoUrl.split('/upload/');
              if (parts.length >= 2) {
                const afterUpload = parts[1];
                if (afterUpload.includes('/')) {
                  const transformEnd = afterUpload.indexOf('/');
                  if (transformEnd > 0) {
                    cleanUrl = parts[0] + '/upload/' + afterUpload.substring(transformEnd + 1);
                  }
                }
              }
            }
            
            const urlParts = cleanUrl.split('/');
            
            let publicId = '';
            for (let i = 0; i < urlParts.length; i++) {
              if (urlParts[i].startsWith('v') && /^v\d+$/.test(urlParts[i])) {
                publicId = urlParts.slice(i + 1).join('/');
                publicId = publicId.substring(0, publicId.lastIndexOf('.'));
                break;
              }
            }
            
            if (!publicId) {
              const pacientesIndex = urlParts.findIndex(part => part === 'pacientes');
              if (pacientesIndex >= 0) {
                publicId = urlParts.slice(pacientesIndex).join('/');
                publicId = publicId.substring(0, publicId.lastIndexOf('.'));
              }
            }
            
            console.log(`Eliminando imagen de Cloudinary con public_id: ${publicId}`);
            
            if (publicId) {
              const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
              console.log('Resultado de Cloudinary:', cloudinaryResult);
            }
          } catch (cloudinaryError) {
            console.error('Error al eliminar foto de Cloudinary:', cloudinaryError);
            // Continuamos aunque falle la eliminación en Cloudinary
          }
        }
      }
    }
    
    // Ahora eliminar el paciente de MongoDB
    await Paciente.findOneAndDelete({ id: req.params.id });
    
    res.json({ message: 'Paciente y sus fotos eliminados correctamente' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ error: error.message });
  }
};


// Añadir esta función si no existe o corregirla si ya existe
// Add this function to delete photos from both MongoDB and Cloudinary
exports.deletePatientPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { photoUrl } = req.body;
    
    console.log(`Intentando eliminar foto: ${photoUrl} del paciente: ${id}`);
    
    // Buscar el paciente por su ID personalizado
    const paciente = await Paciente.findOne({ id: id });
    if (!paciente) {
      console.log(`Paciente con ID ${id} no encontrado`);
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    
    // Verificar si la foto existe en el array
    if (!paciente.fotosDelPaciente.includes(photoUrl)) {
      console.log(`Foto ${photoUrl} no encontrada en el paciente ${id}`);
      return res.status(404).json({ message: 'Foto no encontrada' });
    }
    
    // Extraer el public_id de Cloudinary de la URL
    try {
      const cloudinary = require('cloudinary').v2;
      
      // Extraer el public_id de la URL de Cloudinary
      // Ejemplo: https://res.cloudinary.com/dhdcdvh6l/image/upload/w_500,c_limit/v1742570043/pacientes/54451/n1eu249rva9byzdrwfzq.webp
      
      // Primero, eliminar las transformaciones (w_500,c_limit)
      let cleanUrl = photoUrl;
      if (photoUrl.includes('/upload/')) {
        const parts = photoUrl.split('/upload/');
        if (parts.length >= 2) {
          // Eliminar transformaciones si existen
          const afterUpload = parts[1];
          if (afterUpload.includes('/')) {
            // Si hay transformaciones, están entre /upload/ y el siguiente /
            const transformEnd = afterUpload.indexOf('/');
            if (transformEnd > 0) {
              cleanUrl = parts[0] + '/upload/' + afterUpload.substring(transformEnd + 1);
            }
          }
        }
      }
      
      // Ahora extraer el public_id
      // Formato esperado: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
      const urlParts = cleanUrl.split('/');
      
      // Encontrar la parte después de v1234567890/
      let publicId = '';
      for (let i = 0; i < urlParts.length; i++) {
        if (urlParts[i].startsWith('v') && /^v\d+$/.test(urlParts[i])) {
          // Encontramos la versión, el public_id es todo lo que sigue
          publicId = urlParts.slice(i + 1).join('/');
          // Quitar la extensión del archivo
          publicId = publicId.substring(0, publicId.lastIndexOf('.'));
          break;
        }
      }
      
      if (!publicId) {
        // Si no encontramos la versión, intentar extraer el public_id de otra manera
        // Buscar 'pacientes' en la URL
        const pacientesIndex = urlParts.findIndex(part => part === 'pacientes');
        if (pacientesIndex >= 0) {
          publicId = urlParts.slice(pacientesIndex).join('/');
          publicId = publicId.substring(0, publicId.lastIndexOf('.'));
        }
      }
      
      console.log(`Intentando eliminar imagen de Cloudinary con public_id: ${publicId}`);
      
      if (publicId) {
        // Eliminar la imagen de Cloudinary
        const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
        console.log('Resultado de Cloudinary:', cloudinaryResult);
      } else {
        console.log('No se pudo extraer el public_id de la URL:', photoUrl);
      }
    } catch (cloudinaryError) {
      console.error('Error al eliminar de Cloudinary:', cloudinaryError);
      // Continuamos aunque falle la eliminación en Cloudinary
    }
    
    // Eliminar la URL de la foto del array de fotos del paciente
    paciente.fotosDelPaciente = paciente.fotosDelPaciente.filter(photo => photo !== photoUrl);
    await paciente.save();
    
    console.log(`Foto eliminada correctamente del paciente ${id}`);
    
    res.json({ 
      message: 'Foto eliminada correctamente',
      remainingPhotos: paciente.fotosDelPaciente
    });
  } catch (error) {
    console.error('Error al eliminar la foto:', error);
    res.status(500).json({ message: 'Error al eliminar la foto', error: error.message });
  }
};

// Add this new controller function after getPacientes
exports.getPacientesSummary = async (req, res) => {
  try {
    // Only fetch the fields we need for the list view
    const pacientesSummary = await Paciente.find({}, 'id nombre apellido');
    res.json(pacientesSummary);
  } catch (error) {
    console.error('Error fetching patient summaries:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add this new controller method for temporary appointments
exports.updateTemporaryAppointments = async (req, res) => {
  try {
    const { turnos } = req.body;
    
    console.log('Updating temporary appointments');
    console.log('Received appointments:', turnos?.length || 0);
    
    // Use findOneAndUpdate with upsert to create if it doesn't exist
    await TemporaryAppointment.findOneAndUpdate(
      { id: 'temp_appointments' },
      { turnos: turnos || [] },
      { upsert: true, new: true }
    );
    
    console.log('Temporary appointments updated successfully');
    res.status(200).json({ message: 'Temporary appointments updated successfully' });
  } catch (error) {
    console.error('Error updating temporary appointments:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add this at the end of your file

// Add this method to get temporary appointments
exports.getTemporaryAppointments = async (req, res) => {
  try {
    // If you have a TemporaryAppointment model
    const tempAppointments = await TemporaryAppointment.findOne({ id: 'temp_appointments' });
    res.json(tempAppointments?.turnos || []);
  } catch (error) {
    console.error('Error fetching temporary appointments:', error);
    res.status(500).json({ error: error.message });
  }
};
