const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const STORAGE_DRIVER = process.env.STORAGE_DRIVER || 'local';
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

class LocalStorage {
  async upload(file, subDir = 'products') {
    const dir = path.join(UPLOAD_DIR, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    const filepath = path.join(dir, filename);

    if (file.mimetype.startsWith('image/')) {
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .toFile(filepath);
    } else {
      fs.writeFileSync(filepath, file.buffer);
    }

    return {
      url: `/api/uploads/${subDir}/${filename}`,
      filename,
      path: filepath,
    };
  }

  async delete(filePath) {
    const fullPath = path.join(UPLOAD_DIR, filePath.replace('/uploads/', ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}

class S3Storage {
  async upload(file, subDir = 'products') {
    throw new Error('S3 storage not implemented');
  }

  async delete(filePath) {
    throw new Error('S3 storage not implemented');
  }
}

const storage = STORAGE_DRIVER === 's3' ? new S3Storage() : new LocalStorage();

module.exports = storage;
