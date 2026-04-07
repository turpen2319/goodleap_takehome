import { Router } from "express";
import type { Request, Response } from "express";
import { contractors } from "../data/contractors.js";
import { loanProducts } from "../data/loan-products.js";

const router = Router();

router.get("/contractors/products", (req: Request, res: Response) => {
  const contractorId = req.headers["x-contractor-id"] as string | undefined;
  if (!contractorId) {
    res.status(401).json({ error: "x-contractor-id header is required" });
    return;
  }

  const contractor = contractors.find((c) => c.id === contractorId);
  if (!contractor) {
    res.status(404).json({ error: "Contractor not found" });
    return;
  }

  const products = loanProducts.filter((p) =>
    contractor.availableProductIds.includes(p.id)
  );

  res.json({ products });
});

export default router;
