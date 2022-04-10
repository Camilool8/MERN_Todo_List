const Validator = require('validator');
const isEmpty = require('./isEmpty');

const validateToDoInput = data => {
    let errors = {};

    // check content input
    if (isEmpty(data.content)) {
        errors.content = 'Content field is required!';
    }
    else if (!Validator.isLength(data.content, { min: 1, max: 300 })) {
        errors.content = 'Content must be at least 1 characters!';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };

};

module.exports = validateToDoInput;