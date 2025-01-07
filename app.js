const express = require('express');
const app = express();
const port = 3000;

const User = require('./models/user');
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

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      const user = await User.create({
        name,
        email,
        password: hash,
      });
      const token = jwt.sign({ email: email, userId: user._id }, 'shhhhh');
      res.cookie('token', token);
      res.send('register success');
    });
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.send('something wrong');
  } else {
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        const token = jwt.sign({ email: email, userId: user._id }, 'shhhhh');
        res.cookie('token', token);
        res.send('login success');
      } else {
        res.send('password incorrect');
      }
    });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.send('Logout success');
});

app.get('/profile', checkAuth, (req, res) => {
  res.send('You Profile');
});

function checkAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.send('not logged in');
  } else {
    jwt.verify(token, 'shhhhh', (err, decoded) => {
      if (err) {
        return res.send('Invalid token');
      }
      req.user = decoded;
      next();
    });
  }
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
