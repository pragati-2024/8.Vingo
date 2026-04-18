import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { searchImageUrl } from "../utils/imageSearch.js";

export const createShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image = "";
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    } else {
      const query = `${name || ""} ${city || ""} restaurant`
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
    const shop = await Shop.create({
      name,
      city,
      state,
      address,
      image,
      owner: req.userId,
    });

    await shop.populate("owner items");
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `create shop error ${error}` });
  }
};

export const editShop = async (req, res) => {
  try {
    const { shopId, name, city, state, address } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    } else if (String(req.body?.autoImage || "").toLowerCase() === "true") {
      const query = `${name || ""} ${city || ""} restaurant`
        .replace(/\s+/g, " ")
        .trim();
      image = await searchImageUrl(query, { perPage: 10 });
    }
    const updateData = { name, city, state, address, owner: req.userId };
    if (image) updateData.image = image;
    const shop = await Shop.findByIdAndUpdate(shopId, updateData, {
      new: true,
    });

    await shop.populate("owner items");
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `edit shop error ${error}` });
  }
};

export const getMyShops = async (req, res) => {
  try {
    const shops = await Shop.find({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `get my shops error ${error}` });
  }
};

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const cityStr = String(city || "").trim();
    if (!cityStr) {
      return res.status(400).json({ message: "city is required" });
    }

    const exact = await Shop.find({
      city: { $regex: new RegExp(`^${cityStr}$`, "i") },
    }).populate("items");

    // Include a small prefix-based match to handle common typos (e.g., 'Matura' vs 'Mathura')
    // without exploding results too much.
    const prefix = cityStr.slice(0, 3);
    const prefixMatches = prefix
      ? await Shop.find({
          city: { $regex: new RegExp(`^${prefix}`, "i") },
        }).populate("items")
      : [];

    const all = [
      ...(Array.isArray(exact) ? exact : []),
      ...(Array.isArray(prefixMatches) ? prefixMatches : []),
    ];

    // Dedupe by normalized (name + address). Prefer the shop that has more items.
    const normalize = (s) => {
      // Normalize across casing/punctuation/spacing to collapse duplicates like
      // "VRINDAVAN SNACKS" vs "Vrindavan Snacks" and minor address punctuation.
      return String(s || "")
        .toLowerCase()
        .replace(/[\r\n]+/g, " ")
        .replace(/[^a-z0-9 ]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const scoreImage = (image) => {
      if (!image || typeof image !== "string") return 0;
      const v = image.trim().toLowerCase();
      if (!v) return 0;
      // Worst: known placeholders / SVG data URIs
      if (v.startsWith("data:image/svg")) return 1;
      if (v.includes("/public/placeholder-")) return 1;
      if (v.includes("/public/placeholder-image")) return 1;
      // Local uploads (good in dev, may be fragile in some deployments)
      if (v.startsWith("/public/")) return 2;
      // Remote URLs are typically the most stable
      if (v.startsWith("http://") || v.startsWith("https://")) return 3;
      return 2;
    };

    const bestByKey = new Map();
    for (const shop of all) {
      const nameKey = normalize(shop?.name);
      const addrKey = normalize(shop?.address);
      const key =
        nameKey && addrKey ? `${nameKey}::${addrKey}` : String(shop?._id);

      const existing = bestByKey.get(key);
      const itemCount = Array.isArray(shop?.items) ? shop.items.length : 0;
      const existingCount = Array.isArray(existing?.items)
        ? existing.items.length
        : 0;
      if (!existing) {
        bestByKey.set(key, shop);
        continue;
      }

      // Prefer a shop that actually has items, otherwise it will be hidden later.
      const hasItems = itemCount > 0;
      const existingHasItems = existingCount > 0;
      if (hasItems !== existingHasItems) {
        if (hasItems) bestByKey.set(key, shop);
        continue;
      }

      // If both have items (or both don't), prefer better images.
      const imgScore = scoreImage(shop?.image);
      const existingImgScore = scoreImage(existing?.image);
      if (imgScore !== existingImgScore) {
        if (imgScore > existingImgScore) bestByKey.set(key, shop);
        continue;
      }

      // Next, prefer the shop with more items.
      if (itemCount !== existingCount) {
        if (itemCount > existingCount) bestByKey.set(key, shop);
        continue;
      }

      // Finally, keep the most recently updated.
      const a = shop?.updatedAt ? new Date(shop.updatedAt).getTime() : 0;
      const b = existing?.updatedAt
        ? new Date(existing.updatedAt).getTime()
        : 0;
      if (a > b) bestByKey.set(key, shop);
    }

    // Hide empty shops from user listings (common for test/duplicate records).
    const deduped = Array.from(bestByKey.values());
    let result = deduped.filter(
      (s) => Array.isArray(s?.items) && s.items.length > 0,
    );

    // Optional environment-based filtering to keep user-side listings clean in demos.
    // - ONLY_OWNER_IDS: comma-separated owner ids to include
    // - HIDE_OWNER_IDS: comma-separated owner ids to exclude
    const parseIdList = (v) =>
      String(v || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    const onlyOwnerIds = parseIdList(process.env.ONLY_OWNER_IDS);
    const hideOwnerIds = parseIdList(process.env.HIDE_OWNER_IDS);

    if (onlyOwnerIds.length > 0) {
      const allow = new Set(onlyOwnerIds.map(String));
      result = result.filter((s) => allow.has(String(s?.owner)));
    }

    if (hideOwnerIds.length > 0) {
      const deny = new Set(hideOwnerIds.map(String));
      result = result.filter((s) => !deny.has(String(s?.owner)));
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: `get shop by city error ${error}` });
  }
};
