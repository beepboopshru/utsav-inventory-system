import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all clients
export const getAllClients = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("clients").collect();
  },
});

// Get client by ID
export const getClientById = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clientId);
  },
});

// Create new client
export const createClient = mutation({
  args: {
    name: v.string(),
    contactPerson: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    pincode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("clients", args);
  },
});

// Update client
export const updateClient = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    pincode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const { clientId, ...updates } = args;
    return await ctx.db.patch(clientId, updates);
  },
});

// Search clients
export const searchClients = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allClients = await ctx.db.query("clients").collect();
    
    return allClients.filter(client => 
      client.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(args.searchTerm.toLowerCase()))
    );
  },
});
