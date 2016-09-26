/**
 * Created by Halid on 9/23/16.
 */
var mongoose = require('mongoose');
var contactSchema = new mongoose.Schema({
    ContactId   : String,
    firstName   : String,
    lastName    : String,
    phoneNumber : String,
    company     : String,
    dateCreated : { type: Date, default: Date.now }
});
mongoose.model('Contact', contactSchema);