import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
    },
    pass: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

export { User }