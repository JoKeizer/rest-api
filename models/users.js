'use strict';

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model { }
  User.init({
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "firstName"'
        },
        notEmpty: {
          msg: 'Please provide a value for "firstName"'
        }
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "lastName"'
        },
        notEmpty: {
          msg: 'Please provide a value for "lastName"'
        }
      }
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "emailAddress"'
        },
        notEmpty: {
          msg: 'Please provide a value for "emailAddress"'
        }
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "password"'
        },
        notEmpty: {
          msg: 'Please provide a value for "password"'
        }
      }
    }
  }, { sequelize });

  //Define associations between your models
  User.associate = (models) => {
    User.hasMany(models.Course);
  };

  return User;
};
