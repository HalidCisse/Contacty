var express        = require('express'),
    router         = express.Router(),
    mongoose       = require('mongoose'),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override');

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

router.route('/')
    .get(function(req, res, next) {
        mongoose.model('Contact').find({}, function (err, contacts) {
            if (err) {
                return console.error(err);
            } else {
                res.render('contacts/index', {
                    title: 'All my contacts',
                    "contacts" : contacts
                });
            }
        });
    })
    .post(function(req, res) {
        var firstName   = req.body.firstName;
        var lastName    = req.body.lastName;
        var phoneNumber = req.body.phoneNumber;
        var company     = req.body.company;
        var contactId   = req.body.contactId;
        mongoose.model('Contact').create({
            firstName   : firstName,
            lastName    : lastName,
            phoneNumber : phoneNumber,
            company     : company,
            contactId   : contactId
        }, function (err, Contact) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                console.log('POST creating new Contact: ' + Contact);

                res.location("contacts");
                res.redirect("/contacts");
            }
        })
    });

/* GET New Contact page. */
router.get('/new', function(req, res) {
    res.render('contacts/new', { title: 'Add New Contact' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    mongoose.model('Contact').findById(id, function (err, Contact) {
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        } else {
            req.id = id;
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
                //console.log('GET Retrieving : ' + contact);
                res.render('contacts/contact', {
                    "contact" : contact
                });
            }
        });
    });

router.route('/:id/update')
    .get(function(req, res) {
        mongoose.model('Contact').findById(req.id, function (err, contact) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                //console.log('GET Retrieving : ' + contact);
                res.render('contacts/update', {
                    title: contact.firstName + ' ' + contact.lastName,
                    "contact" : contact
                });
            }
        });
    })
    .put(function(req, res) {
        var firstName = req.body.firstName;
        var lastName  = req.body.lastName;
        var company   = req.body.company;
        var phone     = req.body.phoneNumber;

        mongoose.model('Contact').findById(req.id, function (err, contact) {
            contact.update({
                firstName   : firstName,
                lastName    : lastName,
                company     : company,
                phoneNumber : phone
            }, function (err, contact) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                }
                else {
                    res.redirect("/contacts/" + req.id);
                }
            })
        });
    })
    .delete(function (req, res){

        mongoose.model('Contact').findById(req.id, function (err, contact) {
            if (err) {
                return console.error(err);
            } else {
                Contact.remove(function (err, contact) {
                    if (err) {
                        return console.error(err);
                    } else {
                        console.log('DELETE removing : ' + contact);
                        res.redirect("/contacts");
                    }
                });
            }
        });
    });

module.exports = router;