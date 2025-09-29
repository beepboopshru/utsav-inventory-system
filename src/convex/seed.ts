import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Avoid duplicate seeds if kits already exist
    const existingKit = await ctx.db.query("kits").first();
    if (existingKit) {
      return "Already seeded.";
    }

    // Seed clients
    const client1 = await ctx.db.insert("clients", {
      name: "Green Valley Public School",
      contactPerson: "Anita Kumar",
      email: "anita.kumar@gvps.edu",
      phone: "98765-43210",
      address: "12 Palm Street",
      city: "Mumbai",
      state: "MH",
      pincode: "400001",
    });

    const client2 = await ctx.db.insert("clients", {
      name: "Blue Ridge Academy",
      contactPerson: "Rahul Verma",
      email: "rahul.verma@blueridge.edu",
      phone: "91234-56780",
      address: "98 Hill View Road",
      city: "Pune",
      state: "MH",
      pincode: "411001",
    });

    // Seed raw materials
    const rm1 = await ctx.db.insert("rawMaterials", {
      name: "EVA Foam Sheet 2mm",
      category: "foam",
      stockLevel: 500,
      unit: "pieces",
      description: "High-density EVA foam for models",
      supplier: "FoamWorks",
      unitPrice: 10,
    });
    const rm2 = await ctx.db.insert("rawMaterials", {
      name: "MDF Board 3mm",
      category: "mdf",
      stockLevel: 200,
      unit: "sheets",
      description: "Laser-compatible MDF",
      supplier: "WoodCraft",
      unitPrice: 80,
    });
    const rm3 = await ctx.db.insert("rawMaterials", {
      name: "M3 Screws Assorted",
      category: "fasteners",
      stockLevel: 1000,
      unit: "pieces",
      description: "Assortment for assembly",
      supplier: "BoltHub",
      unitPrice: 2,
    });
    const rm4 = await ctx.db.insert("rawMaterials", {
      name: "Copper Wire 22AWG",
      category: "electronics",
      stockLevel: 300,
      unit: "meters",
      description: "Flexible stranded wire",
      supplier: "ElectroMart",
      unitPrice: 5,
    });

    // Seed pre-processed goods
    const pg1 = await ctx.db.insert("preprocessedGoods", {
      name: "Laser Cut MDF Gears",
      category: "laser_cut",
      stockLevel: 120,
      unit: "sets",
      description: "Varied gear sizes",
      processingNotes: "Cut on 40W laser",
    });
    const pg2 = await ctx.db.insert("preprocessedGoods", {
      name: "3D Printed Servo Brackets",
      category: "3d_printed",
      stockLevel: 150,
      unit: "pieces",
      description: "PLA brackets for micro servos",
      processingNotes: "0.2mm layer height",
    });
    const pg3 = await ctx.db.insert("preprocessedGoods", {
      name: "Painted Base Plates",
      category: "painted",
      stockLevel: 80,
      unit: "pieces",
      description: "Primed and painted plates",
      processingNotes: "Acrylic matte",
    });

    // Seed kits
    const kit1 = await ctx.db.insert("kits", {
      name: "Robotics Starter Kit",
      serialNumber: "ROB-001",
      program: "robotics",
      gradeLevel: "6-8",
      description: "Basics of robotics with servos & gears",
      stockLevel: 10,
    });
    const kit2 = await ctx.db.insert("kits", {
      name: "CSTEM Curious Minds",
      serialNumber: "CST-101",
      program: "cstem",
      gradeLevel: "3-5",
      description: "Fun experiments for early learners",
      stockLevel: 15,
    });
    const kit3 = await ctx.db.insert("kits", {
      name: "Advanced Robotics Kit",
      serialNumber: "ROB-200",
      program: "robotics",
      gradeLevel: "9-10",
      description: "Advanced mechanisms and control",
      stockLevel: 5,
    });

    // Try to create a couple of assignments if any user exists
    const anyUser = await ctx.db.query("users").first();
    if (anyUser) {
      const today = new Date();
      const isoDate = today.toISOString().slice(0, 10);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      await ctx.db.insert("kitAssignments", {
        clientId: client1,
        kitId: kit1,
        quantity: 2,
        deliveryType: "single_delivery",
        deliveryDate: isoDate,
        status: "pending",
        notes: "Urgent delivery",
        assignedBy: anyUser._id,
      });

      await ctx.db.insert("kitAssignments", {
        clientId: client2,
        kitId: kit2,
        quantity: 3,
        deliveryType: "single_delivery",
        deliveryDate: nextWeek,
        status: "pending",
        notes: "Handle with care",
        assignedBy: anyUser._id,
      });
    }

    // Optionally link some materials to a kit (pouching plan)
    await ctx.db.insert("kitMaterials", {
      kitId: kit1,
      materialType: "raw",
      materialId: rm1,
      quantity: 5,
      packetNumber: 1,
      packetName: "Packet A",
    });
    await ctx.db.insert("kitMaterials", {
      kitId: kit1,
      materialType: "preprocessed",
      materialId: pg2,
      quantity: 2,
      packetNumber: 2,
      packetName: "Packet B",
    });

    return "Seed completed.";
  },
});
