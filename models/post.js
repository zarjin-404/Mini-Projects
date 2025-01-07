const monggoose = require('mongoose');

const postSchema = new monggoose.Schema(
  {
    user: {
      type: monggoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    like: [
      {
        type: monggoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    content: String,
  },
  { timestamps: true }
);

module.exports = monggoose.model('post', postSchema);
