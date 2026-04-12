import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { searchImageUrl } from "../utils/imageSearch.js";

const parseIdList = (v) =>
  String(v || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const applyOwnerFiltersToShops = (shops) => {
  let out = Array.isArray(shops) ? shops : [];

  const onlyOwnerIds = parseIdList(process.env.ONLY_OWNER_IDS);
  const hideOwnerIds = parseIdList(process.env.HIDE_OWNER_IDS);

  if (onlyOwnerIds.length > 0) {
    const allow = new Set(onlyOwnerIds.map(String));
    out = out.filter((s) => allow.has(String(s?.owner)));
  }

  if (hideOwnerIds.length > 0) {
    const deny = new Set(hideOwnerIds.map(String));
    out = out.filter((s) => !deny.has(String(s?.owner)));
  }

  return out;
};

export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price, shopId } = req.body;
    const normalizedFoodType =
      String(foodType || "") === "non-veg" ? "non veg" : foodType;
    let image = "";
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    } else {
      const query = `${name || ""} ${category || ""} ${foodType || ""} food`
        .replace(/\s+/g, " ")
        .trim();
      image = await searchImageUrl(query, { perPage: 10 });
    }

    if (!image) {
      return res.status(400).json({
        message:
          "image is required (upload or set PEXELS_API_KEY for auto images)",
      });
    }

    // Find specific shop by ID if provided, else fallback to any shop owned by user
    let shop;
    if (shopId) {
      shop = await Shop.findOne({ _id: shopId, owner: req.userId });
    } else {
      shop = await Shop.findOne({ owner: req.userId });
    }

    if (!shop) {
      return res
        .status(400)
        .json({ message: "shop not found or access denied" });
    }
    const item = await Item.create({
      name,
      category,
      foodType: normalizedFoodType,
      price,
      image,
      shop: shop._id,
    });

    // Avoid duplicate item IDs in the shop (can happen on retries/double-submits).
    await Shop.updateOne(
      { _id: shop._id },
      { $addToSet: { items: item._id } },
    );

    const populatedShop = await Shop.findById(shop._id)
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });

    return res.status(201).json(populatedShop);
  } catch (error) {
    return res.status(500).json({ message: `add item error ${error}` });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price, shopId } = req.body;
    const normalizedFoodType =
      String(foodType || "") === "non-veg" ? "non veg" : foodType;
    const update = { name, category, foodType: normalizedFoodType, price };
    if (req.file) {
      update.image = await uploadOnCloudinary(req.file.path);
    } else if (String(req.body?.autoImage || "").toLowerCase() === "true") {
      const query = `${name || ""} ${category || ""} ${foodType || ""} food`
        .replace(/\s+/g, " ")
        .trim();
      const auto = await searchImageUrl(query, { perPage: 10 });
      if (auto) update.image = auto;
    }
    const item = await Item.findByIdAndUpdate(itemId, update, { new: true });

    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    const shop = await Shop.findById(shopId || item.shop).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `edit item error ${error}` });
  }
};

export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error}` });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    // Find the shop this item belonged to
    const shop = await Shop.findById(item.shop);
    if (shop) {
      shop.items = shop.items.filter(
        (i) => i.toString() !== item._id.toString(),
      );
      await shop.save();

      const populatedShop = await Shop.findById(shop._id).populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });
      return res.status(200).json(populatedShop);
    }

    return res
      .status(200)
      .json({ message: "Item deleted, but shop not found" });
  } catch (error) {
    return res.status(500).json({ message: `delete item error ${error}` });
  }
};

export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const cityStr = String(city || "").trim();
    if (!cityStr) {
      return res.status(400).json({ message: "city is required" });
    }

    const exact = await Shop.find({
      city: { $regex: new RegExp(`^${cityStr}$`, "i") },
    });

    const prefix = cityStr.slice(0, 3);
    const prefixMatches = prefix
      ? await Shop.find({
          city: { $regex: new RegExp(`^${prefix}`, "i") },
        })
      : [];

    const combined = [...(exact || []), ...(prefixMatches || [])];
    const filteredShops = applyOwnerFiltersToShops(combined);

    // Unique shop ids
    const shopIds = Array.from(
      new Set(filteredShops.map((s) => String(s?._id)).filter(Boolean)),
    );

    if (shopIds.length === 0) {
      return res.status(200).json([]);
    }

    const items = await Item.find({ shop: { $in: shopIds } }).populate(
      "shop",
      "name image city owner",
    );
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: `get item by city error ${error}` });
  }
};

export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId).populate("items");
    if (!shop) {
      return res.status(400).json("shop not found");
    }

    // `shop.items` can be stale for older data or partial writes.
    // Query items by shopId as the source of truth and merge/dedupe.
    const itemsByShopField = await Item.find({ shop: shopId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const merged = [];
    const seen = new Set();
    const pushUnique = (item) => {
      const id = item?._id?.toString?.() ?? String(item?._id ?? "");
      if (!id || seen.has(id)) return;
      seen.add(id);
      merged.push(item);
    };

    const shopItems = Array.isArray(shop.items) ? shop.items : [];
    for (const item of shopItems) pushUnique(item);
    for (const item of itemsByShopField) pushUnique(item);

    return res.status(200).json({
      shop,
      items: merged,
    });
  } catch (error) {
    return res.status(500).json({ message: `get item by shop error ${error}` });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;
    const cityStr = String(city || "").trim();
    if (!cityStr) {
      return res.status(400).json({ message: "city is required" });
    }

    const exact = await Shop.find({
      city: { $regex: new RegExp(`^${cityStr}$`, "i") },
    });

    const prefix = cityStr.slice(0, 3);
    const prefixMatches = prefix
      ? await Shop.find({
          city: { $regex: new RegExp(`^${prefix}`, "i") },
        })
      : [];

    const shops = applyOwnerFiltersToShops([...(exact || []), ...(prefixMatches || [])]);

    if (!shops || shops.length === 0) {
      return res.status(200).json([]);
    }

    const shopIds = shops.map((s) => s._id);

    let filter = { shop: { $in: shopIds } };

    // If query is provided and it's NOT just the city name again
    if (query && query.toLowerCase() !== cityStr.toLowerCase()) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ];
    }

    const items = await Item.find(filter).populate("shop", "name image city");

    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: `search item  error ${error}` });
  }
};

export const rating = async (req, res) => {
  try {
    const { itemId, rating } = req.body;

    if (!itemId || !rating) {
      return res.status(400).json({ message: "itemId and rating is required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 to 5" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    const newCount = item.rating.count + 1;
    const newAverage =
      (item.rating.average * item.rating.count + rating) / newCount;

    item.rating.count = newCount;
    item.rating.average = newAverage;
    await item.save();
    return res.status(200).json({ rating: item.rating });
  } catch (error) {
    return res.status(500).json({ message: `rating error ${error}` });
  }
};
