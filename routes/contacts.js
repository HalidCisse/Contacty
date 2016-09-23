var express        = require('express'),
    router         = express.Router(),
    mongoose       = require('mongoose'), //mongo connection
    bodyParser     = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST
//var contacts = require('./../models/contacts');

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

//build the REST operations at the base for contacts
//this will be accessible from http://127.0.0.1:3000/contacts if the default route for / is left unchanged
router.route('/')
//GET all contacts
    .get(function(req, res, next) {
        //retrieve all contacts from Monogo
        mongoose.model('Contact').find({}, function (err, contacts) {
            res.json("{'al':ee}");
            if (err) {
                return console.error(err);
            } else {
                //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                res.format({
                    //HTML response will render the index.jade file in the views/contacts folder. We are also setting "contacts" to be an accessible variable in our jade view
                    html: function(){
                        res.render('contacts/index', {
                            title: 'All my contacts',
                            "contacts" : contacts
                        });
                    },
                    //JSON response will show all contacts in JSON format
                    json: function(){
                        res.json(contacts);
                    }
                });
            }
        });
    })
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "firstName" attributes for forms
        var firstName   = req.body.firstName;
        var lastName    = req.body.lastName;
        var phoneNumber = req.body.phoneNumber;
        var company     = req.body.company;
        mongoose.model('Contact').create({
            firstName   : firstName,
            lastName    : lastName,
            phoneNumber : phoneNumber,
            company     : company
        }, function (err, Contact) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                //Contact has been created
                console.log('POST creating new Contact: ' + Contact);
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("contacts");
                        // And forward to success page
                        res.redirect("/contacts");
                    },
                    //JSON response will show the newly created Contact
                    json: function(){
                        res.json(Contact);
                    }
                });
            }
        })
    });

/* GET New Contact page. */
router.get('/new', function(req, res) {
    res.render('contacts/new', { title: 'Add New Contact' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Contact').findById(id, function (err, Contact) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                },
                json: function(){
                    res.json({message : err.status  + ' ' + err});
                }
            });
            //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(Contact);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});

router.route('/:id')
    .get(function(req, res) {
        mongoose.model('Contact').findById(req.id, function (err, contact) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                console.log('GET Retrieving ID: ' + contact._id);
                var contactId = contact.ContactId.toISOString();
                contactId = contactId.substring(0, contactId.indexOf('T'))
                res.format({
                    html: function(){
                        res.render('contacts/show', {
                            "contactId" : contactId,
                            "Contact" : contact
                        });
                    },
                    json: function(){
                        res.json(contact);
                    }
                });
            }
        });
    });

router.route('/:id/edit')
//GET the individual Contact by Mongo ID
    .get(function(req, res) {
        //search for the Contact within Mongo
        mongoose.model('Contact').findById(req.id, function (err, Contact) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                //Return the Contact
                console.log('GET Retrieving ID: ' + Contact._id);
                var contactId = Contact.ContactId.toISOString();
                contactId = contactId.substring(0, contactId.indexOf('T'))
                res.format({
                    //HTML response will render the 'edit.jade' template
                    html: function(){
                        res.render('contacts/edit', {
                            title: 'Contact' + Contact._id,
                            "contactId" : contactId,
                            "Contact" : Contact
                        });
                    },
                    //JSON response will return the JSON output
                    json: function(){
                        res.json(Contact);
                    }
                });
            }
        });
    })
    //PUT to update a Contact by ID
    .put(function(req, res) {
        // Get our REST or form values. These rely on the "firstName" attributes
        var firstName = req.body.firstName;
        var badge = req.body.badge;
        var ContactId = req.body.ContactId;
        var company = req.body.company;
        var isloved = req.body.isloved;

        //find the document by ID
        mongoose.model('Contact').findById(req.id, function (err, Contact) {
            //update it
            Contact.update({
                firstName : firstName,
                badge : badge,
                ContactId : ContactId,
                isloved : isloved
            }, function (err, ContactID) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                }
                else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                            res.redirect("/contacts/" + Contact._id);
                        },
                        //JSON responds showing the updated values
                        json: function(){
                            res.json(Contact);
                        }
                    });
                }
            })
        });
    })
    //DELETE a Contact by ID
    .delete(function (req, res){
        //find Contact by ID
        mongoose.model('Contact').findById(req.id, function (err, Contact) {
            if (err) {
                return console.error(err);
            } else {
                //remove it from Mongo
                Contact.remove(function (err, Contact) {
                    if (err) {
                        return console.error(err);
                    } else {
                        //Returning success messages saying it was deleted
                        console.log('DELETE removing ID: ' + Contact._id);
                        res.format({
                            //HTML returns us back to the main page, or you can create a success page
                            html: function(){
                                res.redirect("/contacts");
                            },
                            //JSON returns the item with the message that is has been deleted
                            json: function(){
                                res.json({message : 'deleted',
                                    item : Contact
                                });
                            }
                        });
                    }
                });
            }
        });
    });

module.exports = router;