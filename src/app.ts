import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import router from "./app/routes";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import { PrismaClient } from "@prisma/client";
import path from "path";
import redisClient from "./helpers/redis";
import {
  appleAppSiteAssociation,
  assetLinks,
  deleteAccount,
  deleteData,
  marketingPage,
  privacyPolicy,
  privacyPolicyForPublish,
  showWhileRedirectDeepLink,
  showWhileRedirectDeepLinkTwo,
  supportPage,
  termsandconditions,
} from "./app/routes/viewRoute";

const app: Application = express();
const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to services:", error);
    process.exit(1);
  }
})();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Test root
app.get("/", (req: Request, res: Response) => {
  res.send({ Message: "Welcome to api main route" });
});

app.get("/privacy-policy", async (req: Request, res: Response) => {
  const result = privacyPolicy("User");
  res.send(result);
});
app.get("/privacy-offers", async (req: Request, res: Response) => {
  const result = privacyPolicy("Expert");
  res.send(result);
});
app.get("/marketing", async (req: Request, res: Response) => {
  const result = marketingPage();
  res.send(result);
});
app.get("/support", async (req: Request, res: Response) => {
  const result = supportPage();
  res.send(result);
});

app.get("/delete-data", async (req: Request, res: Response) => {
  const result = deleteData();
  res.send(result);
});

app.get(
  "/.well-known/apple-app-site-association",
  (req: Request, res: Response) => {
    const result = appleAppSiteAssociation();
    res.set("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(result));
  },
);

app.get("/.well-known/assetlinks.json", (req: Request, res: Response) => {
  const result = assetLinks();
  res.set("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(result));
});

// app.get("/services", (req: Request, res: Response) => {
//   const result = showWhileRedirectDeepLink(req.query.id as string);
//   res.send(result);
// });
app.get("/services", (req: Request, res: Response) => {
  const result = showWhileRedirectDeepLinkTwo(req.query.id as string);
  res.send(result);
});

app.get("/delete-account", async (req: Request, res: Response) => {
  const result = deleteAccount();
  res.send(result);
});

app.get("/privacyPolicy", (req, res) => {
  res.send(privacyPolicyForPublish());
});
app.get("/terms-and-conditions", (req, res) => {
  res.send(termsandconditions());
});

// Main API routes
app.use("/api/v1", router);

// Global error handler
app.use(GlobalErrorHandler);

// 404 fallback
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
