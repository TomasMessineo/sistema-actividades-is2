const MAX_PROFILE_PICTURE_SIZE = 2 * 1024 * 1024;
const ALLOWED_PROFILE_PICTURE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const validateProfilePicture = (file) => {
  if (!file) {
    return 'Debes seleccionar una imagen';
  }

  if (file.size > MAX_PROFILE_PICTURE_SIZE) {
    return 'La imagen no puede superar los 2 MB';
  }

  if (!ALLOWED_PROFILE_PICTURE_TYPES.includes(file.type)) {
    return 'Solo se permiten imágenes PNG, JPG o WEBP';
  }

  return '';
};
