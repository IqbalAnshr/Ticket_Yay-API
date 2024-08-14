const multer = require('multer');
const path = require('path');
require('dotenv').config(); 

module.exports = {
    'uploadDirectory': process.env.UPLOAD_DIRECTORY || 'uploads',
    'maxFileSize': process.env.MAX_FILE_SIZE || 5 * 1024 * 1024
}