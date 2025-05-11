import cloudinary from '../../config/cloudinary.js';

export async function uploadFile(file) {
  if (file && file[0]) {
    try {
      const result = await cloudinary.uploader.upload(file[0].path, {
        resource_type: 'auto',
        folder: 'pdfs'
      });
      return result.secure_url;
    } catch (error) {
      throw new Error('Failed to upload file to Cloudinary');
    }
  }
  return null;
}
