import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createShop=async (req,res) => {
    try {
       const {name,city,state,address}=req.body
       let image;
       if(req.file){
        image=await uploadOnCloudinary(req.file.path)
       } 
       const shop=await Shop.create({
        name,city,state,address,image,owner:req.userId
       })
      
       await shop.populate("owner items")
       return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({message:`create shop error ${error}`})
    }
}

export const editShop=async (req,res) => {
    try {
       const {shopId,name,city,state,address}=req.body
       let image;
       if(req.file){
        image=await uploadOnCloudinary(req.file.path)
       } 
       const updateData = {name,city,state,address,owner:req.userId}
       if(image) updateData.image = image
       const shop=await Shop.findByIdAndUpdate(shopId,updateData,{new:true})
      
       await shop.populate("owner items")
       return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({message:`edit shop error ${error}`})
    }
}

export const getMyShops=async (req,res) => {
    try {
        const shops=await Shop.find({owner:req.userId}).populate("owner").populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({message:`get my shops error ${error}`})
    }
}

export const getShopByCity=async (req,res) => {
    try {
        const {city}=req.params

        const shops=await Shop.find({
            city:{$regex:new RegExp(`^${city}$`, "i")}
        }).populate('items')
        if(!shops){
            return res.status(400).json({message:"shops not found"})
        }
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({message:`get shop by city error ${error}`})
    }
}