
'use strict';

const express = require('express');
const router = express.Router();
//connect to database
const { Course, User } = require('../models');

//Validation
const { check, validationResult } = require('express-validator/check');

//bcryptjs for Hashing the password
const bcryptjs = require('bcryptjs');
//Get the basic auth credentials from the given request.
const auth = require('basic-auth');

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

// GET route to get all courses 
router.get('/', asyncHandler(async(req, res) => {
    const courses = await Course.findAll({
        // match with assiciation using the specified 'creator' keyword
        include: [{
            model: User,
            as: 'creator',
        }]
    });
    res.json(courses);
}));

// GET route to get course with id
router.get('/:id', asyncHandler (async(req, res) => {
    const course = await Course.findByPk(req.params.id, {
        include: [{
            model: User,
            as: 'creator',
        }]
    });
    res.json(course);
}));


// POST route to create new course user needs to be authenticated
router.post("/",[
    check('title')
        .exists()
        .withMessage('Title is required'),
    check('description')
        .exists()
        .withMessage('Description is required'),
    check("userId")
    .exists()
    .withMessage("You must provide a User ID")
], authenticateUser, asyncHandler(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            res
                .status(400).json({ errors: errorMessages})

        } else {
            const course = await Course.create(req.body);
            // get new course id for Location header
            const id = course.id;
            // Set the status to 201 Created, set Location header, and end the response.
            res.location(`/api/courses/${id}`).status(201).end();

        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}));

// PUT route to update a course user needs to be authenticated
router.put('/:id', [
    check('title')
        .exists()
        .withMessage('Title is required'),
    check('description')
        .exists()
        .withMessage('Description is required'),
    check("userId")
    .exists()
    .withMessage("You must provide a User ID")
], authenticateUser, async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            res.status(400).json({ errors: errorMessages });
        } else {
            const course = await Course.findByPk(req.params.id);
            if (course) {
                await course.update(req.body)
                res.status(204).end();
            } else {
                res.status(404).json({ message: "Course not found" });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE route to delete a course
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (course) {
            await course.destroy();
            res.status(204).end();
        } else {
            res.status(404).json({ message: "Course not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

  
module.exports = router;
