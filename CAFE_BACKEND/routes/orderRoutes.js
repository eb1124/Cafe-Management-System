const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderController");

router.get("/", controller.getOrders);
router.post("/confirm", controller.confirmOrderWithPayment);
router.post("/", controller.addOrder);
router.put("/:id", controller.updateOrder);
router.delete("/:id", controller.deleteOrder);

module.exports = router;
