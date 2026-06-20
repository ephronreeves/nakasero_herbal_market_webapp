const storage = require('../services/storage');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const subDir = req.body.directory || 'products';
    const result = await storage.upload(req.file, subDir);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const subDir = req.body.directory || 'products';
    const results = await Promise.all(
      req.files.map(file => storage.upload(file, subDir))
    );

    res.json(results);
  } catch (error) {
    next(error);
  }
};
