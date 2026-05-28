const MAX_APTO_MEDICO_SIZE = 3 * 1024 * 1024;
const ALLOWED_APTO_MEDICO_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];

export const validateAptoMedicoFile = (file) => {
  if (!file) {
    return 'Debes seleccionar un archivo';
  }

  if (file.size > MAX_APTO_MEDICO_SIZE) {
    return 'El apto médico no puede superar los 3 MB';
  }

  if (!ALLOWED_APTO_MEDICO_TYPES.includes(file.type)) {
    return 'Solo se permiten archivos PNG, JPG o PDF';
  }

  return '';
};