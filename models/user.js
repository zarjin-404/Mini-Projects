const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/miniproject');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    post: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('user', userSchema);
