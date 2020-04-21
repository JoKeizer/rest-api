
'use strict';

const express = require('express');
const router = express.Router();
//connect to database
const { Course, User } = require('../models');

//Validation
const { check, validationResult } = require('express-validator/check');


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

router.get('/', asyncHandler(async(req, res) => {
    const courses = await Course.findAll({
        include: [
          {
            model: User,
            attributes: ['firstName', 'lastName', 'emailAddress'],
          }
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        }
      });
      return res.status(200).json(courses);
}));

router.get('/:id', asyncHandler (async(req, res) => {
    const course = await Course.findByPk(req.params.id);
      res.status(200).json(course);
}));

// ValidationCheck function
const courseValidationChecks = [
    check('title')
        .exists()
        .withMessage('Title is required'),
    check('description')
        .exists()
        .withMessage('Description is required')
];


router.post("/", courseValidationChecks, asyncHandler(async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            res.status(400).json({ errors: errorMessages });
        } else {
            const course = await Course.create(req.body);
            res.status(201)
                .json(course)
                .location(`/courses/${course.id}`)
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}));

  
module.exports = router;
