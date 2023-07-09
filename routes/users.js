var express = require("express");
var router = express.Router();
var User = require("../models/user");
var auth = require("../middleware/auth");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", async (req, res, next) => {
  try {
    var user = await User.create(req.body);
    var token = await user.signToken();
    res.status(201).json({ user: user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: "Email/password required",
    });
  }
  try {
    var user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "Email not registered",
      });
    }
    var result = await user.verifyPassword(password);
    console.log(user, result);
    if (!result) {
      return res.status(400).json({
        error: "Invalid password",
      });
    }
    // generate token
    var token = await user.signToken();
    res.json({ user: user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

// protected route
router.use(auth.verifyToken);
router.get("/admin", auth.adminUser, (req, res, next) => {
  User.find({ isAdmin: false }, (err, users) => {
    if (err) next(err);
    console.log(users);
    res.json({ users: users });
  });
});
module.exports = router;
