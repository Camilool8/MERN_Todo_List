const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const validateRegisterInput = require("../validation/registerValidation");

// @route   GET api/auth/test
// @desc    Tests auth route
// @access  Public
router.get("/test", (req, res) => {
    res.send("Test route");
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async(req, res) => {
    try {


        // Validate errors in the user input fields
        const { errors, isValid } = validateRegisterInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }


        // Check if user already exists
        const existingEmail = await User.findOne({ 
            email: new RegExp("^" + req.body.email + "$","i") 
        });

        if (existingEmail) {
            return res.status(400).json({
                errors: [{ msg: "Email already exists" }]
            });
        }


        // encrypt the password of user
        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        // Creates a new user
        const newUser = new User({
            email: req.body.email,
            password: hashedPassword,
            name: req.body.name,
        });

        // Saves user into database
    const SavedUser = await newUser.save();

        // return new user object
    return res.json(SavedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});







module.exports = router;