const db = require("../db");

const getNextRecipeId = (callback) => {
  db.query(
    "SELECT COALESCE(MAX(recipe_id), 0) + 1 AS nextId FROM recipe",
    (err, result) => {
      if (err) {
        return callback(err);
      }
      return callback(null, result[0].nextId);
    }
  );
};

exports.getRecipes = (req, res) => {
  const sql = `
    SELECT
      recipe_id AS id,
      recipe_name AS recipeName,
      category,
      price
    FROM recipe
    ORDER BY recipe_name ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(result);
  });
};

exports.addRecipe = (req, res) => {
  const { recipeName, category, price } = req.body;

  getNextRecipeId((idError, nextId) => {
    if (idError) {
      return res.status(500).json(idError);
    }

    const sql = `
      INSERT INTO recipe (recipe_id, recipe_name, category, price)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [nextId, recipeName, category, price], (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json({
        id: nextId,
        recipeName,
        category,
        price,
        message: "Recipe added successfully",
      });
    });
  });
};

exports.updateRecipe = (req, res) => {
  const { recipeName, category, price } = req.body;

  const sql = `
    UPDATE recipe
    SET recipe_name=?, category=?, price=?
    WHERE recipe_id=?
  `;

  db.query(sql, [recipeName, category, price, req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json({ message: "Recipe updated successfully" });
  });
};

exports.deleteRecipe = (req, res) => {
  db.query("DELETE FROM recipe WHERE recipe_id=?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json({ message: "Recipe deleted successfully" });
  });
};
