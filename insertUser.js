const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/passwordDb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Insert a new user
const insertUser = async () => {
    const username = 'testuser01'; // Change this to the desired username
    const password = 'abc123'; // Change this to the desired password

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username: username,
            password: hashedPassword
        });
        await user.save();
        console.log('User inserted successfully');
    } catch (err) {
        console.error('Error inserting user:', err);
    } finally {
        mongoose.connection.close();
    }
};

insertUser();

