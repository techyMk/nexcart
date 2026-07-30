const envUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const SITE_URL: string =
  envUrl && !envUrl.includes("localhost")
    ? envUrl.replace(/\/$/, "")
    : "https://nexcart-ecom.vercel.app";

export const SITE_NAME = "NexCart";
