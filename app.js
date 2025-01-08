const express = require('express');
const app = express();
const port = 3000;

const User = require('./models/user');
const Post = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hash,
    });
    const token = jwt.sign({ email: email, userId: user._id }, 'shhhhh');
    res.cookie('token', token);
    res.redirect('/profile');
  } catch (err) {
    res.status(500).send('Error registering user');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    } else {
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        const token = jwt.sign({ email: email, userId: user._id }, 'shhhhh');
        res.cookie('token', token);
        res.redirect('/profile');
      } else {
        res.status(400).send('Password incorrect');
      }
    }
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

app.get('/profile', checkAuth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).populate(
      'posts'
    );
    res.render('profile', { user });
  } catch (err) {
    res.status(500).send('Error loading profile');
  }
});

app.post('/post', checkAuth, async (req, res) => {
  const { content } = req.body;
  try {
    const user = await User.findOne({ email: req.user.email });
    const post = await Post.create({
      content,
      user: user._id,
    });
    user.posts.push(post);
    await user.save();
    res.redirect('/profile');
  } catch (err) {
    res.status(500).send('Error creating post');
  }
});

app.get('/like/:id', checkAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id }).populate('user');
    const userIndex = post.like.indexOf(req.user.userId);
    if (userIndex === -1) {
      post.like.push(req.user.userId);
    } else {
      post.like.splice(userIndex, 1);
    }
    await post.save();
    res.redirect('/profile');
  } catch (err) {
    res.status(500).send('Error liking post');
  }
});

app.get('/edit/:id', checkAuth, async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id }).populate('user');
  res.render('edit', { post });
});

app.post('/update/:id', checkAuth, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { content: req.body.content }
    );
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.redirect('/profile');
  } catch (err) {
    res.status(500).send('Error updating post');
  }
});

function checkAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  } else {
    jwt.verify(token, 'shhhhh', (err, decoded) => {
      if (err) {
        return res.status(400).send('Invalid token');
      }
      req.user = decoded;
      next();
    });
  }
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
