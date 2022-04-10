const express = require("express");
const router = express.Router();
const ToDo = require("../models/ToDo");
const requiresAuth = require("../middleware/permissions");
const validateToDoInput = require("../validation/toDoValidation");

// @route GET /api/todos/test 
// @desc Tests todo route
// @access Public

router.get("/test", (req, res) => {
  res.send("ToDo's route is working");
});

// @route POST /api/todos/new 
// @desc Create a new ToDo
// @access Private

router.post("/new", requiresAuth, async (req, res) => {
    try {
        // Validate errors in the user input fields
        const { errors, isValid } = validateToDoInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        // Creates a new ToDo
        const newToDo = new ToDo({
            user: req.user._id,
            content: req.body.content,
            completed: false,
        });
        // Saves ToDo into database
        await newToDo.save();

        // Return new ToDo object
        return res.json(newToDo);


    } catch (err) {
        console.error(err);

        return res.status(500).send(err.message);
    }
});

// @route GET /api/todos/current
// @desc Get all current ToDos
// @access Private

router.get("/current", requiresAuth, async (req, res) => {
    try {
        const completeToDos = await ToDo.find(
         {
            user: req.user._id,
            complete: true,
         }).sort({ completedAt: -1 });

        const incompleteToDos = await ToDo.find({
            user: req.user._id,
            complete: false,
        }).sort({ createdAt: -1 });

        return res.json(
            {incomplete: incompleteToDos, 
            complete: completeToDos});


        } catch (err) {
            console.error(err);

            return res.status(500).send(err.message);
            }
}
);

module.exports = router;