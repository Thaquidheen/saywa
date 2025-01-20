const express = require("express");
const router = express.Router();
const TAX_MODEL = require("../models/Tax");

router.get("/", async (req, res) => {
  try {
    const result = await TAX_MODEL.find();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const { id, taxValue } = req.body;
    console.log(req.body);
    if (id) {
      const query = {
        _id: id,
      };
      const data = {
        $set: {
          value: parseInt(taxValue),
        },
      };
      await TAX_MODEL.updateOne(query, data);
      const result = await TAX_MODEL.find();
      return res.status(200).json(result);
    } else {
      const newTax = new TAX_MODEL({
        value: parseInt(taxValue),
      });
      await newTax.save();

      const result = await TAX_MODEL.find();
      return res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json(error);
  }
});

module.exports = router;
