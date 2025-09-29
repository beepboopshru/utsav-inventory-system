import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  PROGRAM_COORDINATOR: "program_coordinator",
  INVENTORY_MANAGER: "inventory_manager",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.PROGRAM_COORDINATOR),
  v.literal(ROLES.INVENTORY_MANAGER),
);
export type Role = Infer<typeof roleValidator>;

// Kit programs
export const PROGRAMS = {
  ROBOTICS: "robotics",
  CSTEM: "cstem",
} as const;

export const programValidator = v.union(
  v.literal(PROGRAMS.ROBOTICS),
  v.literal(PROGRAMS.CSTEM),
);

// Inventory categories
export const RAW_MATERIAL_CATEGORIES = {
  ELECTRONICS: "electronics",
  FOAM: "foam",
  MDF: "mdf",
  FASTENERS: "fasteners",
  STATIONERY: "stationery",
  TUBES: "tubes",
  PRINTABLES: "printables",
  CORRUGATED_SHEETS: "corrugated_sheets",
} as const;

export const PREPROCESSED_CATEGORIES = {
  LASER_CUT: "laser_cut",
  THREE_D_PRINTED: "3d_printed",
  PAINTED: "painted",
  ASSEMBLED: "assembled",
  OTHERS: "others",
} as const;

export const DELIVERY_TYPES = {
  SINGLE: "single_delivery",
  MONTHLY: "monthly_subscription",
};

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Kits table
    kits: defineTable({
      name: v.string(),
      serialNumber: v.string(),
      program: programValidator,
      gradeLevel: v.optional(v.string()),
      description: v.optional(v.string()),
      stockLevel: v.number(),
    })
      .index("by_program", ["program"])
      .index("by_serial_number", ["serialNumber"]),

    // Raw materials inventory
    rawMaterials: defineTable({
      name: v.string(),
      category: v.string(), // Using string to allow custom categories
      stockLevel: v.number(),
      unit: v.string(), // e.g., "pieces", "meters", "kg"
      description: v.optional(v.string()),
      supplier: v.optional(v.string()),
      unitPrice: v.optional(v.number()),
    }).index("by_category", ["category"]),

    // Pre-processed goods inventory
    preprocessedGoods: defineTable({
      name: v.string(),
      category: v.string(),
      stockLevel: v.number(),
      unit: v.string(),
      description: v.optional(v.string()),
      processingNotes: v.optional(v.string()),
    }).index("by_category", ["category"]),

    // Kit materials (pouching plan)
    kitMaterials: defineTable({
      kitId: v.id("kits"),
      materialType: v.union(v.literal("raw"), v.literal("preprocessed")),
      materialId: v.union(v.id("rawMaterials"), v.id("preprocessedGoods")),
      quantity: v.number(),
      packetNumber: v.optional(v.number()),
      packetName: v.optional(v.string()),
    })
      .index("by_kit", ["kitId"])
      .index("by_kit_and_packet", ["kitId", "packetNumber"]),

    // Clients
    clients: defineTable({
      name: v.string(),
      contactPerson: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      pincode: v.optional(v.string()),
    }),

    // Kit assignments
    kitAssignments: defineTable({
      clientId: v.id("clients"),
      kitId: v.id("kits"),
      quantity: v.number(),
      deliveryType: v.string(),
      deliveryDate: v.string(),
      status: v.string(), // "pending", "delivered", "cancelled"
      notes: v.optional(v.string()),
      assignedBy: v.id("users"),
    })
      .index("by_client", ["clientId"])
      .index("by_kit", ["kitId"])
      .index("by_delivery_date", ["deliveryDate"])
      .index("by_status", ["status"]),

    // Custom categories for raw materials
    customCategories: defineTable({
      name: v.string(),
      type: v.union(v.literal("raw_material"), v.literal("preprocessed")),
      createdBy: v.id("users"),
    }).index("by_type", ["type"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;