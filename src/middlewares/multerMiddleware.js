const multer = require('multer');
const config = require('../../config/multer');
const ClientError = require('../errors/clientError');
fs = require('fs');

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

    static uploadMiddleware(req, res, next) {
        const instance = new MulterMiddleware(config.uploadDirectoryProfileImage);
        instance.upload.single('profile_picture')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Multer error: ${err.message}`,
                    links: [
                        { rel: 'self', method: 'PUT', href: req.originalUrl },
                        { rel: 'profile', method: 'GET', href: '/api/v1/user/profile' }
                    ]
                });
            } else if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: `Unknown error: ${err.message}`,
                    links: [
                        { rel: 'self', method: 'PUT', href: req.originalUrl },
                        { rel: 'profile', method: 'GET', href: '/api/v1/user/profile' }
                    ]
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file uploaded',
                    links: [
                        { rel: 'self', method: 'PUT', href: req.originalUrl },
                        { rel: 'profile', method: 'GET', href: '/api/v1/user/profile' }
                    ]
                });
            }
            req.profile_picture = req.file.filename;
            next();
        });
    };

    static uploadProfilePictureMiddleware(req, res, next) {
        const instance = new MulterMiddleware(config.uploadDirectoryProfileImage);
        instance.upload.single('profile_picture')(req, res, (err) => {
            if (!req.file) {
                return next(new ClientError(400, 'No file uploaded'));
            }
            req.profile_picture = req.file.filename;
            next();
        });
    }

    static uploadEventImagesMiddleware(req, res, next) {
        const instance = new MulterMiddleware(config.uploadDirectoryEventImages);
        instance.upload.array('event_images')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return next(new ClientError(400, `Multer error: ${err.message}`));
            }
            req.event_images = req.files.map(file => file.filename);
            next();
        });
    }
}

module.exports = MulterMiddleware;
