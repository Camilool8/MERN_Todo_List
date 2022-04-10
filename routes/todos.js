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

// @route PUT /api/todos/:toDoId/complete
// @desc Mark ToDo as complete
// @access Private

router.put("/:toDoId/complete", requiresAuth, async (req, res) => {
    try {
    
        const toDo = await ToDo.findOne({
            user: req.user._id,
            _id: req.params.toDoId,
        });

        if (!toDo) {
            return res.status(404).json({error: "ToDo not found"});
        }

        if (toDo.complete) {
            return res.status(400).json({error: "ToDo already completed"});
        }

        const udpdatedToDo = await ToDo.findOneAndUpdate({
            user: req.user._id,
            _id: req.params.toDoId,
        }, {
            complete: true,
            completedAt: new Date(),
        }, {
            new: true,
        });

        return res.json(udpdatedToDo);



    } catch (err) { 
        console.error(err);

        return res.status(500).send(err.message);
    }
});


// @route PUT /api/todos/:toDoId/incomplete
// @desc Mark ToDo as incomplete
// @access Private

router.put("/:toDoId/incomplete", requiresAuth, async (req, res) => {
    try {
        const toDo = await ToDo.findOne({
            user: req.user._id,
            _id: req.params.toDoId,
        });

        if (!toDo) {
            return res.status(404).json({error: "ToDo not found"});
        }

        if (!toDo.complete) {
            return res.status(400).json({error: "ToDo is already incomplete"});
        }

        const udpdatedToDo = await ToDo.findOneAndUpdate({
            user: req.user._id,
            _id: req.params.toDoId,
        }, {
            complete: false,
            completedAt: null,
        }, {
            new: true,
        });

        return res.json(udpdatedToDo);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
});

// @route PUT /api/todos/:toDoId
// @desc Updating a toDo
// @access Private

router.put("/:toDoId", requiresAuth, async (req, res) => {
    try{
        const toDo = await ToDo.findOne({
            user: req.user._id,
            _id: req.params.toDoId,
        });

        if (!toDo) {
            return res.status(404).json({error: "ToDo not found"});
        }

        const { errors, isValid } = validateToDoInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        const updatedToDo = await ToDo.findOneAndUpdate({
            user: req.user._id,
            _id: req.params.toDoId,
        }, {
            content: req.body.content,
        }, {
            new: true,
        });

        return res.json(updatedToDo);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
})

// @route DELETE /api/todos/:toDoId
// @desc Delete a toDo
// @access Private

router.delete("/:toDoId", requiresAuth, async (req, res) => {
    try {
        const toDo = await ToDo.findOne({
            user: req.user._id,
            _id: req.params.toDoId,
        });

        if (!toDo) {
            return res.status(404).json({error: "ToDo not found"});
        }

        await ToDo.findOneAndRemove({
            user: req.user._id,
            _id: req.params.toDoId,
        });

        return res.json({success: true});
        
    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
});





module.exports = router;