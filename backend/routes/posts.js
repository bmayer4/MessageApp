const express = require('express');
const router = express.Router();  
const multer = require('multer');  //so you can extract images (can't do it with bodyParser)
const authenticate = require('../middleware/check-auth');
const PostController = require('../controllers/post.js');

//   api/posts******

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { 
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid mime type');
        if (isValid) {
            error = null;
        }
        cb(error, 'backend/images');
     },
     filename: (req, file, cb) => {
         const name = file.originalname.toLowerCase().split(' ').join('-');
         const ext = MIME_TYPE_MAP[file.mimetype];
         cb(null, name + '_' + Date.now() + '.' + ext);
     }
});

router.get('', PostController.getPosts);

router.get('/:id', PostController.getPost);

router.post('', authenticate, multer({storage: storage}).single('image'), PostController.createPost);

router.patch('/:id', authenticate, multer({storage: storage}).single('image'), PostController.updatePost);

router.delete('/:id', authenticate, PostController.deletePost);

module.exports = router;