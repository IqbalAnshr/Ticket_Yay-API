const multer = require('multer');
const config = require('../../config/multer');
const ClientError = require('../errors/clientError');
const fs = require('fs');

class MulterMiddleware {
    constructor(uploadDir) {
        this.uploadDir = uploadDir;
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadDir = this.uploadDir;
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                cb(null, `${req._id}-${Date.now()}-${file.originalname}`);
            }
        });

        const fileFilter = (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('File must be an image'), false);
            }
        };

        this.upload = multer({
            storage,
            fileFilter,
            limits: {
                fileSize: config.maxFileSize
            }
        });
    }

    static uploadProfilePictureMiddleware(req, res, next) {
        const instance = new MulterMiddleware(config.uploadDirectoryProfileImage);
        instance.upload.single('profile_picture')(req, res, (err) => {
            if (err) return next(new ClientError(400,  err.message));
            if (!req.file) return next(new ClientError(400, 'No file uploaded'));

            req.profile_picture = req.file.filename;
            next();
        });
    }

    static uploadEventImagesMiddleware(req, res, next) {
        const instance = new MulterMiddleware(config.uploadDirectoryEventImages);
        instance.upload.array('event_images')(req, res, (err) => {
            if (err) return next(new ClientError(400,  err.message));
            if (!req.files) return next(new ClientError(400, 'No file uploaded'));
            
            req.event_images = req.files.map(file => file.filename);
            next();
        });
    }
}

module.exports = MulterMiddleware;
