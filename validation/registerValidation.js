const Validator = require('validator');
const isEmpty = require('./isEmpty');

const validateRegisterInput = (data) => {
    let errors = {};

    // check name input
    if(isEmpty(data.name)){
        errors.name = 'Name field is required!';
    }
    else if(!Validator.isLength(data.name, {min: 2, max: 30})){
        errors.password = 'Name must be at least 2 characters!';
    }

    // check email input
    if(isEmpty(data.email)){
        errors.email = 'Email field is required!';
    }
    else if(!Validator.isEmail(data.email)){
        errors.email = 'Email is invalid!';
    }

    // check password input
    if(isEmpty(data.password)){
        errors.password = 'Password field is required!';
    }
    else if(!Validator.isLength(data.password, {min: 8, max: 30})){
        errors.password = 'Password must be at least 8 characters!';
    }

    // check password2 input
    if(isEmpty(data.password2)){
        errors.password2 = 'Confirm password field is required!';
    }
    else if(!Validator.equals(data.password, data.password2)){
        errors.password2 = 'Passwords must match!';
    }

    return {
        errors,
        isValid: isEmpty(errors),
    }

};

module.exports = validateRegisterInput;