import express from "express";

import isAuth from "../middlewares/isAuth.js";
import {
  addItem,
  deleteItem,
  editItem,
  getItemByCity,
  getItemById,
  getItemsByShop,
  rating,
  searchItems,
} from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
// Read-only item endpoints should be public
itemRouter.get("/get-by-id/:itemId", getItemById);
itemRouter.get("/delete/:itemId", isAuth, deleteItem);
itemRouter.get("/get-by-city/:city", getItemByCity);
itemRouter.get("/get-by-shop/:shopId", getItemsByShop);
itemRouter.get("/search-items", searchItems);
itemRouter.post("/rating", isAuth, rating);
export default itemRouter;
