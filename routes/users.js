
'use strict';

const express = require('express');
const router = express.Router();

//bcryptjs for Hashing the password
const bcryptjs = require('bcryptjs');
//Get the basic auth credentials from the given request.
const auth = require('basic-auth');

//Validation
const { check, validationResult } = require('express-validator/check');


//connect to database
const { Course, User } = require('../models');

// error wrapper function
function asyncHandler(cb) {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

//Global function authenticateUser
const authenticateUser = async (req, res, next) => {
    //reset message to null
    let message = null;
    // User's credentials from the Authorization header 
    const credentials = auth(req);
    
    // check whether credentials are being passed to locate user in database
    if (credentials) {
        const user = await User.findOne({
            where: {
                emailAddress: credentials.name,
            }
        })
        //User exists and compare passwords
        if (user) {
            const authenticated = bcryptjs
                .compareSync(credentials.pass, user.password);

            if (authenticated) {
                req.currentUser = user;
            } else {
                message = `Authentication failure for username: ${user.emailAddress}`
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }

    if (message) {
        console.warn(message);

        res.status(401).json({ message: 'Access Denied' });

    } else {
        next()
    }
}

//Get users
  router.get('/',  authenticateUser, asyncHandler(async (req, res) => {
      const user = req.currentUser;
      const firstName = user.firstName
      console.log(firstName)
      
    res.status(200).json({
        name: `${user.firstName} ${user.lastName}`,
        email: `${user.emailAddress}`
    })
  }));


// Add a new user with validation check
router.post('/', [
    check('firstName')
    .exists()
    .withMessage('Please provide a value for "firstName"'),
    check('lastName')
        .exists()
        .withMessage('Please provide a value for "lastName"'),
    check('emailAddress')
        .exists()
        .withMessage('Please provide a value for "emailAddress"')
        .isEmail()
        .withMessage('Please provide a valid value for "emailAddress"'),
    check('password')
        .exists()
        .withMessage('Please provide a value for "password"'),
    ], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            res.status(400).json({ errors: errorMessages });
        } else {
            const user = await req.body;

            // Hash user password with bcryptjs
            user.password = bcryptjs.hashSync(user.password);

            await User.create(user);
            res.location(`/`).status(201).end();
        }
    } catch (error) {
        if (error = 'SequelizeUniqueConstraintError') {
            res.status(500).json('The credentials you entered are already in use').end();
        }
        else {
            res.status(500).json('There was a problem with your request')
        }
    }   
  });
  
module.exports = router;
