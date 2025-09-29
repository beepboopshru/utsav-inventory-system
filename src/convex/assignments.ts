import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all assignments
export const getAllAssignments = query({
  args: {},
  handler: async (ctx) => {
    const assignments = await ctx.db.query("kitAssignments").collect();
    
    // Get client and kit details for each assignment
    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const client = await ctx.db.get(assignment.clientId);
        const kit = await ctx.db.get(assignment.kitId);
        const assignedByUser = await ctx.db.get(assignment.assignedBy);
        
        return {
          ...assignment,
          client,
          kit,
          assignedBy: assignedByUser,
        };
      })
    );

    return assignmentsWithDetails;
  },
});

// Get assignments by client
export const getAssignmentsByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("kitAssignments")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();

    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const kit = await ctx.db.get(assignment.kitId);
        const assignedByUser = await ctx.db.get(assignment.assignedBy);
        
        return {
          ...assignment,
          kit,
          assignedBy: assignedByUser,
        };
      })
    );

    return assignmentsWithDetails;
  },
});

// Create new assignment
export const createAssignment = mutation({
  args: {
    clientId: v.id("clients"),
    kitId: v.id("kits"),
    quantity: v.number(),
    deliveryType: v.string(),
    deliveryDate: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Check kit stock availability
    const kit = await ctx.db.get(args.kitId);
    if (!kit) throw new Error("Kit not found");

    if (kit.stockLevel < args.quantity) {
      throw new Error(`Insufficient Stock: Only ${kit.stockLevel} units of '${kit.name}' are available`);
    }

    // Create assignment
    const assignmentId = await ctx.db.insert("kitAssignments", {
      ...args,
      status: "pending",
      assignedBy: user._id,
    });

    // Update kit stock level
    await ctx.db.patch(args.kitId, {
      stockLevel: kit.stockLevel - args.quantity,
    });

    return assignmentId;
  },
});

// Update assignment status
export const updateAssignmentStatus = mutation({
  args: {
    assignmentId: v.id("kitAssignments"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.patch(args.assignmentId, {
      status: args.status,
    });
  },
});

// Get assignments by delivery date range
export const getAssignmentsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Use the by_delivery_date index for an efficient range query
    const assignments = await ctx.db
      .query("kitAssignments")
      .withIndex("by_delivery_date", (q) =>
        q.gte("deliveryDate", args.startDate).lte("deliveryDate", args.endDate),
      )
      .collect();

    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const client = await ctx.db.get(assignment.clientId);
        const kit = await ctx.db.get(assignment.kitId);
        const assignedByUser = await ctx.db.get(assignment.assignedBy);

        return {
          ...assignment,
          client,
          kit,
          assignedBy: assignedByUser,
        };
      }),
    );

    return assignmentsWithDetails;
  },
});