const multer = require('multer');
const config = require('../../config/multer');
fs = require('fs');

class MulterMiddleware {
    constructor() {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadDir = config.uploadDirectory;
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
        const instance = new MulterMiddleware();
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
}

module.exports = MulterMiddleware;
