'use strict'
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class User extends Sequelize.Model { }
    User.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        emailAddress: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        }

    }, { sequelize });

    User.associate = (models) => {
        // ADD ASSOCIATIONS with courses
        User.hasMany(models.Course, {
            as: 'creator',
            foreignKey: {
                fieldName: 'userId',
                allowNull: false,
            },
        });
    }
    return User;
};
