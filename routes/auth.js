const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const validateRegisterInput = require("../validation/registerValidation");
const jwt = require("jsonwebtoken");
const requiresAuth = require("../middleware/permissions");

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
    const savedUser = await newUser.save();
    const userToReturn = {...savedUser._doc};
    delete userToReturn.password;

        // return new user object
    return res.json(userToReturn);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   POST api/auth/login
// @desc    Login user and give token
// @access  Public

    router.post("/login", async(req, res) => {
        try {

            // Check if user exists
            const user = await User.findOne({ 
                email: new RegExp("^" + req.body.email + "$","i") 
            });

            if (!user) {
                return res.status(400).json({
                    errors: [{ msg: "Oops! There is an issue with your credentials..." }]
                });
            }

            // Check password
            const isMatch = await bcrypt.compare(req.body.password, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    errors: [{ msg: "Oops! There is an issue with your credentials..." }]
                });
            }

            // Return jsonwebtoken
            const payload = { userId: user._id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

            res.cookie("access-token", token, {
                expires: new Date(Date.now() + 7 * 24 * 3600 * 1000),
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            });

            const userToReturn = {...user._doc};
            delete userToReturn.password;

            return res.json({
                token: token,
                user: userToReturn
            });

         
        } catch (err) {
            console.error(err);
            return res.status(500).send(err.message);
        }
    });

// @route   GET api/auth/current
// @desc    Return current user authorized
// @access  Private

    router.get("/current",  requiresAuth, (req, res) => {
        if(!req.user) {
            return res.status(401).send("Unauthorized");
        }
        return res.json(req.user);
    });








module.exports = router;