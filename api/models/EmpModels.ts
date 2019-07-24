import * as mongoose from 'mongoose';

const empSchema = new mongoose.Schema ({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String },
    age: { type: String },
    dateOfBirth: { type: String },
    salary: { type: String },
    address: { type: String },
    contact: { type: String },
    hobbies: {},
    techSkills: {},
    state: { type: String },
    city: { type: String },
    zipCode: { type: Number },
    employeeImage: { type: String, required: true }
});

const Emp = mongoose.model('Emp', empSchema);

export { Emp }