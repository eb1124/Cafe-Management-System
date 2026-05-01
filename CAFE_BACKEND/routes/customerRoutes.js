const express = require("express");
const router = express.Router();
const controller = require("../controllers/customerController");

// Log all requests to this router
router.use((req, res, next) => {
  console.log(`[CUSTOMERS ROUTE] ${req.method} ${req.path}`);
  next();
});

router.get("/", controller.getCustomers);
router.post("/", (req, res) => {
  console.log("[POST /customers] Request received!");
  controller.addCustomer(req, res);
});
router.put("/:id", controller.updateCustomer);
router.delete("/:id", controller.deleteCustomer);

module.exports = router;