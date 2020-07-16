
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const TaskSchema = new Schema({
    name: String,
    description: String
});



module.exports = model('Task', TaskSchema);