const express = require("express");
const router = express.Router();
const controller = require("../controllers/menuController");

router.get("/", controller.getMenu);
router.post("/", controller.addMenuItem);
router.put("/:id", controller.updateMenuItem);
router.delete("/:id", controller.deleteMenuItem);

module.exports = router;