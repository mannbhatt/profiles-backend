const {Hono}=require('hono');
const authController = require("../controllers/authController");

const router = new Hono();

router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);

module.exports = router;
