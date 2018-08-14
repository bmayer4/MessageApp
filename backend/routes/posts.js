const express = require('express');
const router = express.Router();  
const Post = require('../models/post');
const multer = require('multer');  //so you can extract images (can't do it with bodyParser)

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

//   api/posts******

router.get('', (req, res) => {
    const pageSize = +req.query.pagesize;  //pagesize name is up to me
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if (pageSize && currentPage) {
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery.then(posts => { 
        fetchedPosts = posts;
        return Post.countDocuments();
        }).then(count => {  //Post.count returns a promise
        res.status(200).json({
            message: "Posts fetched successfully!",
            posts: fetchedPosts,
            maxPosts: count
            });
    }).catch(e => res.status(400).json(e)); 
});


router.get('/:id', (req, res) => {
    Post.findOne({ _id: req.params.id }).then(post => {
        if (!post) {
            return res.status(404).json({ message: 'Post not found'});
        }
        //also, if there were no post and we did something to it like tried to push into an array it had, it would jump into catch error
        res.status(200).json(post);  //if we didn't check for !post, a wrong if (of same length) would cause this code to send back null object
    })
    .catch(e => res.status(405).json(e));   //**** if invalid id (longer length) then it would fail with object id error (need to check for that), not hit !post in success 
});

router.post('', multer({storage: storage}).single('image'), (req, res) => {
    const url = req.protocol + '://' + req.get('host');
    const newPost = new Post({
        content: req.body.content,
        title: req.body.title,
        imagePath: url + '/images/' + req.file.filename   //file.filename is provided by multer
    });
    newPost.save().then(post => res.status(200).json({message: 'Post added successfully', post: {
        ...post,
        id: post._id,   //could have returned post, but were remapping id here
    }}))
    .catch(e => res.status(400).json(e));
});

router.patch('/:id', multer({storage: storage}).single('image'), (req, res) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename;
    }
    
    const title = req.body.title;
    const content = req.body.content;
    console.log('imagePath is', imagePath);
    Post.findOneAndUpdate({ _id: req.params.id }, { $set: { title, content, imagePath }}, { new: true }).then(post => {
        if (!post) {
            return res.status(404).json({ message: 'Post not found'});
        }
        res.status(200).json(post);
    }).catch(e => res.json(e));
});

router.delete('/:id', (req, res) => {
    Post.deleteOne({_id: req.params.id}).then(result => {
        res.status(200).json({message: 'Post deleted!'})
    }).catch(e => res.status(404).json({ error: 'Unable to delete post' }));
});

module.exports = router;