const multer = require('multer');
const path = require('path');
require('dotenv').config(); 

module.exports = {
    'uploadDirectoryProfileImage': process.env.UPLOAD_DIRECTORY_PROFILE_IMAGE || 'uploads/users',
    'uploadDirectoryEventImages': process.env.UPLOAD_DIRECTORY_EVENT_IMAGES || 'uploads/events',
    'maxFileSize': process.env.MAX_FILE_SIZE || 5 * 1024 * 1024
}