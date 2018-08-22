const Post = require('../models/post');


exports.getPosts = (req, res) => {
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
    }).catch(e => res.status(400).json({ message: 'Error retrieving posts' })); 
}

exports.getPost = (req, res) => {
    Post.findOne({ _id: req.params.id }).then(post => {
        if (!post) {
            return res.status(404).json({ message: 'Post not found'});
        }
        //also, if there were no post and we did something to it like tried to push into an array it had, it would jump into catch error
        res.status(200).json(post);  //if we didn't check for !post, a wrong if (of same length) would cause this code to send back null object
    })
    .catch(e => res.status(405).json({ message: 'Error retrieving post' }));   //**** if invalid id (longer length) then it would fail with object id error (need to check for that), not hit !post in success 
}

exports.createPost = (req, res) => {
    const url = req.protocol + '://' + req.get('host');
    const newPost = new Post({
        content: req.body.content,
        title: req.body.title,
        imagePath: url + '/images/' + req.file.filename,   //file.filename is provided by multer
        creator: req.userData.userId
    });
    newPost.save().then(post => res.status(200).json({message: 'Post added successfully', post: {
        ...post,
        id: post._id,   //could have returned post, but were remapping id here
    }}))
    .catch(e => res.status(400).json({ message: 'Unable to create post' }));
}

exports.updatePost = (req, res) => {
    let imagePath = req.body.imagePath;  //would be a string if not updating image
    if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename;
    }
    
    const title = req.body.title;
    const content = req.body.content;

    Post.findOneAndUpdate({ _id: req.params.id, creator: req.userData.userId }, { $set: { title, content, imagePath }}, { new: true }).then(post => {
        if (!post) {
            return res.status(404).json({ message: 'Unable to update'});
        }
        res.status(200).json(post);
    }).catch(e => res.json({ message: 'Unable to update post' }));
}

exports.deletePost = (req, res) => {  //https://stackoverflow.com/questions/42715591/mongodb-difference-remove-vs-findoneanddelete-vs-deleteone
    Post.findOneAndRemove({ _id: req.params.id, creator: req.userData.userId }).then(post => {
        if (!post) {
            return res.status(404).json({ message: 'Unable to delete post'});
        }
        res.status(200).json({message: 'Post deleted!'})
    }).catch(e => res.status(404).json({ message: 'Unable to delete post' }));
}