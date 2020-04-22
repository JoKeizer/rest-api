
'use strict';


const { User } = require('../models');

module.exports = {

    
   //asyncHandler try catch callback
    asyncHandler: (callback) => async (req, res, next) => {
      try {
        await callback(req, res, next);
      } catch (err) {
        if (err.name === 'SequelizeValidationError') {
          const errMessages = err.errors.map((item) => item.message);
          res.status(400).json({ errorMsg: errMessages });
        } else {
          console.error(err);
          res.status(500).json(err);
        }
      }
      return undefined;
    }
  };
  