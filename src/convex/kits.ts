import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { programValidator } from "./schema";

// Get all kits
export const getAllKits = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("kits").collect();
  },
});

// Get kits by program
export const getKitsByProgram = query({
  args: { program: programValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kits")
      .withIndex("by_program", (q) => q.eq("program", args.program))
      .collect();
  },
});

// Get kit by ID with materials
export const getKitById = query({
  args: { kitId: v.id("kits") },
  handler: async (ctx, args) => {
    const kit = await ctx.db.get(args.kitId);
    if (!kit) return null;

    const materials = await ctx.db
      .query("kitMaterials")
      .withIndex("by_kit", (q) => q.eq("kitId", args.kitId))
      .collect();

    // Get material details
    const materialsWithDetails = await Promise.all(
      materials.map(async (material) => {
        let materialDetails = null;
        if (material.materialType === "raw") {
          materialDetails = await ctx.db.get(material.materialId);
        } else {
          materialDetails = await ctx.db.get(material.materialId);
        }
        return {
          ...material,
          materialDetails,
        };
      })
    );

    return {
      ...kit,
      materials: materialsWithDetails,
    };
  },
});

// Create new kit
export const createKit = mutation({
  args: {
    name: v.string(),
    serialNumber: v.string(),
    program: programValidator,
    gradeLevel: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Check if serial number already exists
    const existing = await ctx.db
      .query("kits")
      .withIndex("by_serial_number", (q) => q.eq("serialNumber", args.serialNumber))
      .first();

    if (existing) {
      throw new Error("Kit with this serial number already exists");
    }

    return await ctx.db.insert("kits", {
      ...args,
      stockLevel: 0,
    });
  },
});

// Update kit stock level
export const updateKitStock = mutation({
  args: {
    kitId: v.id("kits"),
    stockLevel: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.patch(args.kitId, {
      stockLevel: args.stockLevel,
    });
  },
});

// Add material to kit (pouching plan)
export const addMaterialToKit = mutation({
  args: {
    kitId: v.id("kits"),
    materialType: v.union(v.literal("raw"), v.literal("preprocessed")),
    materialId: v.union(v.id("rawMaterials"), v.id("preprocessedGoods")),
    quantity: v.number(),
    packetNumber: v.optional(v.number()),
    packetName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("kitMaterials", {
      kitId: args.kitId,
      materialType: args.materialType,
      materialId: args.materialId,
      quantity: args.quantity,
      packetNumber: args.packetNumber,
      packetName: args.packetName,
    });
  },
});

// Remove material from kit
export const removeMaterialFromKit = mutation({
  args: {
    materialId: v.id("kitMaterials"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.delete(args.materialId);
  },
});

// Search kits
export const searchKits = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allKits = await ctx.db.query("kits").collect();
    
    return allKits.filter(kit => 
      kit.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
      kit.serialNumber.toLowerCase().includes(args.searchTerm.toLowerCase())
    );
  },
});