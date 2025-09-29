import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Raw Materials
export const getAllRawMaterials = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rawMaterials").collect();
  },
});

export const getRawMaterialsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rawMaterials")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const createRawMaterial = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    stockLevel: v.number(),
    unit: v.string(),
    description: v.optional(v.string()),
    supplier: v.optional(v.string()),
    unitPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("rawMaterials", args);
  },
});

export const updateRawMaterialStock = mutation({
  args: {
    materialId: v.id("rawMaterials"),
    stockLevel: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.patch(args.materialId, {
      stockLevel: args.stockLevel,
    });
  },
});

// Pre-processed Goods
export const getAllPreprocessedGoods = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("preprocessedGoods").collect();
  },
});

export const getPreprocessedGoodsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("preprocessedGoods")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const createPreprocessedGood = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    stockLevel: v.number(),
    unit: v.string(),
    description: v.optional(v.string()),
    processingNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("preprocessedGoods", args);
  },
});

export const updatePreprocessedGoodStock = mutation({
  args: {
    materialId: v.id("preprocessedGoods"),
    stockLevel: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.patch(args.materialId, {
      stockLevel: args.stockLevel,
    });
  },
});

// Custom Categories
export const getCustomCategories = query({
  args: { type: v.union(v.literal("raw_material"), v.literal("preprocessed")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customCategories")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const createCustomCategory = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("raw_material"), v.literal("preprocessed")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("customCategories", {
      ...args,
      createdBy: user._id,
    });
  },
});
