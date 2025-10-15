import InventoryModel from "../models/InventoryModel.js";
import SupplierModel from "../models/SupplierModel.js";
import PurchaseOrderModel from "../models/PurchaseOrderModel.js";

export const getInventorySummary = async (req, res) => {
  try {
    // Fetch data
    const products = await InventoryModel.find();
    const suppliers = await SupplierModel.find();
    const orders = await PurchaseOrderModel.find();

    // Prepare summary
    const summary = {
      products: {
        total: products.length,
        inStock: products.filter(p => p.stockQuantity > p.reOrderLevel).length,
        lowStock: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.reOrderLevel).length,
        outOfStock: products.filter(p => p.stockQuantity === 0).length
      },
      suppliers: {
        total: suppliers.length,
        active: suppliers.filter(s => s.email && s.phone).length,
        inactive: suppliers.filter(s => !s.email || !s.phone).length
      },
      orders: {
        total: orders.length,
        pending: orders.filter(o => o.status === "Pending").length,
        delivered: orders.filter(o => o.status === "Delivered").length,
        cancel: orders.filter(o => o.status === "Cancel").length
      }
    };

    res.status(200).json(summary);
  } catch (err) {
    console.error("Error loading summary:", err);
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
};
