const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');
const checkAuth = require('../../util/check-auth');
const { GraphQLUpload } = require('apollo-upload-server');
const path = require('path');
const fs = require('fs');

const {
  validateRegisterInput,
  validateLoginInput
} = require('../../util/validators');
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
}





module.exports = {
  Upload: GraphQLUpload,
  Query: {
    uploads: (root, args, { Upload, db }) => {
      return Upload.getAll(db);
    }
  },

  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Wrong crendetials';
        throw new UserInputError('Wrong crendetials', { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token
      };
    },

    async register(
      _,
      {
        registerInput: { username, email, password, confirmPassword }
      }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      // TODO: Make sure user doesnt already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken'
          }
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString()
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token
      };
    },

    async updateProfile(_, { username, password, newPassword }, context) {
      const userAuth = checkAuth(context);

      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      const user = await User.findOne({ _id: userAuth.id });

      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Wrong Old Passowrd';
        throw new UserInputError('Wrong Old Passowrd', { errors });
      }

      let NEWPassword = await bcrypt.hash(newPassword, 12);

      let updateData = {};
      updateData.username = username;
      updateData.password = NEWPassword;
      let record = await User.findOneAndUpdate({ _id: user._id }, { $set: updateData }, { new: true, useFindAndModify: false });



      return {
        ...record._doc,
        id: record._id,
      };
    },


    async uploadFile(parent, { file }, context) {
      const userAuth = checkAuth(context);

      const { createReadStream, filename, mimetype, encoding } = await file
      const stream = await createReadStream();
      let image = userAuth.id+'-'+ filename ;

      const pathname = path.join(__dirname, '../../public/images/' + image);
      let result = await User.findOne({ _id: userAuth.id }).exec();
      console.log(result, '--------')
      var filePath = path.join(__dirname, '../../public/images/' + result.image);
      if(result.image !== '' )
      fs.unlink(filePath, function (err) {
        if (err) throw err
      });

      await User.findOneAndUpdate({ _id: userAuth.id }, { $set: { image } }, { new: true, useFindAndModify: false });


      await stream.pipe(fs.createWriteStream(pathname));
      return {
        url: `http://localhost:5000/images/${pathname}`,
        userId: userAuth.id,
        filename,
        mimetype,
        encoding
      }
    }

  }
};
