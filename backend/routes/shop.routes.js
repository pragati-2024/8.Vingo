import express from "express";
import {
  createShop,
  editShop,
  getMyShops,
  getShopByCity,
} from "../controllers/shop.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const shopRouter = express.Router();

shopRouter.post("/create", isAuth, upload.single("image"), createShop);
shopRouter.post("/edit", isAuth, upload.single("image"), editShop);
shopRouter.get("/get-my", isAuth, getMyShops);
shopRouter.get("/get-by-city/:city", isAuth, getShopByCity);

export default shopRouter;
