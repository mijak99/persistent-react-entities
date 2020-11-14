/**
 * This router will enable the RESTEntityAdapter
 * 
 */
var express = require('express')
var router = express.Router()
var session = require('express-session');
const bodyParser = require('body-parser');

var datalayer = require('./db');
var db = new datalayer.DB('./test.db');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(session({ 
    secret: 'very generic app secret',
    resave: false, 
    saveUninitialized: false

}))

function authenticate(username, password) {
    if (username === password) return { username, id: username };
    // return null;
    return { username, id: username };
}


function authChecker(req, res, next) {
    if (req.session.user) next();
    else {
        res.status(401);
        res.send("Not authorized");
    }
}

/*
function logger(req, res, next) {
    console.log("req", req.method, req.url)
    next();
}
*/
router.use('/api', authChecker);
// router.use('/', logger);


router.get('/logout', (req, res) => {
    req.session.destroy((err => { })); // ignore
    res.send("OK");
});

router.get('/login', (req, res) => {
    res.send("<form method='POST'><input name='username'><input name='password'><input type='submit'></form>");
});

router.post('/login', (req, res) => {
    const user = db.validateUser(req.body).then(
        (user) => {
            console.log("User authenticated as ", user)
            req.session.user = user;
            res.status(200);
            res.json(user)
        }).catch(err => {
            req.session.user = null;
            res.status(401);
            res.send("Not authorized")
        })
});

/**
 *  POST data must contain email(text) and userProfile(object)
 */
router.post('/user', (req, res) => {
    console.log("Creating User ", req.body)
    db.createUser(req.body)
        .then(user => { 
            req.session.user = user;
            console.log("createed user", user)

            var result = { ...user };
            // clean from sensitive information
            delete result.hashedPassword;
            delete result.salt;

            res.json(result); 
         }).catch(err => {
            req.session.user = null;
            res.status(401);
            res.send("An error occured")
        })
        .catch(result => res.status(500).send(result))
});

/**
 * request must contain secret token to validate created user
 */
router.get('/validateuser', (req, res) => {
    console.log("verifying User ", req.params.token)
    db.validateUser(req.params.token)
        .then(user => { res.json(user) })
        .catch(result => res.status(500).send(result))
});

/**
 * request must contain secret token to validate created user
 */
router.get('/whoami', (req, res) => {
    console.log("verifying User ")
    if (req.session && req.session.user) { 
        var result = { ...req.session.user };
        // clean from sensitive information
        delete result.hashedPassword;
        delete result.salt;
        res.json(result)
    } else { 
        res.status(401).send("Not logged in")
    }

});

router.delete('/user/:id', (req, res) => {
    if (req.session.user.id === req.params.userId) { // ensure only logged in user can delete account
        console.log("Delete User ", req.params.userId)
        db.deleteUser(req.params.userId)
            .then(userId => { res.json({ message: "User Deleted (and all user data)", id: userId }) })
            .catch(result => res.status(500).send(result))
    }

});

// another way to delete is to provide credentials
router.delete('/user', (req, res) => {
    const user = db.validateUser(req.body).then(validatedUser => {
        console.log("result after validate", validatedUser)
        db.deleteUser(validatedUser.id);
    });
    res.send("OK");
})


router.get("/api/entity/:id",
    (req, res, next) => {
        console.log("User is", req.session.user)
        console.log("entity id", req.params.id)
        db.getEntity(req.session.user.id, req.params.id)
            .then(result => res.json(result))
            .catch(result => res.status(500).send(result));
    });

router.get("/api/entity",
    (req, res, next) => {
        db.getAllEntities(req.session.user.id)
            .then(result => res.json(result))
            .catch(error => res.status(500).send(error));
    });
router.get("/api/entity/type/:type",
    (req, res, next) => {
        console.log("getting all", req.params)
        db.getAllEntitiesByType(req.session.user.id, req.params.type)
            .then(result => res.json(result))
            .catch(error => res.status(500).send(error));
    });


router.post("/api/entity/:type", (req, res, next) => {
    console.log(`Posting... ${req.session.user.id}`, req.params.type, req.params.id)
    console.log("saving", req.body, typeof req.body);
    const entity = req.body;
    db.createEntity(req.session.user.id, req.params.type, entity).then(entity => {
        console.log("Created entity", entity)
        res.json(entity)
    }).catch((err) => {
        console.log("Created entity failed", err)
        res.status(500).send(err)
    }
    )
});

router.put("/api/entity/:id", (req, res, next) => {
    console.log(`Putting... ${req.session.user.id}`, req.params.id)
    console.log("saving", req.body);
    // fake response
    const entity = req.body;
    db.updateEntity(req.session.user.id, entity).then(entity => {
        res.json(entity)
    }).catch((err) => {
        res.status(500).send(err)
    })
});

router.delete("/api/entity/:id", (req, res, next) => {
    console.log(`Deleting... ${req.session.user.id}`, req.params.type, req.params.id)
    db.removeEntity(req.session.user.id, req.params.id).then(entityId => {
        res.status(200).json(entityId)
    }).catch((err) => {
        res.status(500).send(err)
    })
});

module.exports = router