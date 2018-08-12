const express = require('express');
const router = express.Router();  
const Post = require('../models/post');

//   api/posts******

router.get('', (req, res) => {
    Post.find().then(posts => res.status(200).json({
        message: 'Posts fetched successfully',
        posts: posts
    })).catch(e => res.status(400).json(e)); 
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

router.post('', (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const newPost = new Post({
        content,
        title
    });
    newPost.save().then(post => res.status(200).json({message: 'Post added successfully', postId: post._id}))
    .catch(e => res.status(400).json(e));
});

router.patch('/:id', (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    Post.findOneAndUpdate({ _id: req.params.id }, { $set: { title, content }}, { new: true }).then(post => {
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