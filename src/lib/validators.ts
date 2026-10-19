import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^(\+?92|0)?3\d{2}[-\s]?\d{7}$|^\+?[\d\s-]{10,16}$/, "Enter a valid phone number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  phone: phone.optional().or(z.literal("")),
  password: z.string().min(8, "Use at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

export const cartLineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
  phone,
  fullName: z.string().trim().min(2, "Enter the recipient's name").max(80),
  line1: z.string().trim().min(5, "Enter a complete street address").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Select a city").max(60),
  province: z.string().trim().min(2, "Select a province").max(60),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  isGift: z.boolean().default(false),
  giftMessage: z.string().trim().max(300).optional().or(z.literal("")),
  shippingMethod: z.enum(["STANDARD", "EXPRESS"]),
  paymentMethod: z.enum(["COD", "BANK", "WALLET"]),
  couponCode: z.string().trim().toUpperCase().max(40).optional().or(z.literal("")),
  usePoints: z.boolean().default(false),
  saveAddress: z.boolean().default(false),
  items: z.array(cartLineSchema).min(1, "Your bag is empty").max(50),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const reviewSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(2, "Please enter your name").max(60),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional().or(z.literal("")),
  body: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(2000),
});

export const contactSchema = z.object({
  type: z.enum(["CONTACT", "CORPORATE", "REQUEST"]).default("CONTACT"),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(4000),
});

export const returnSchema = z.object({
  orderNumber: z.string().trim().toUpperCase().min(4, "Enter your order number").max(30),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  reason: z.string().trim().min(2, "Choose a reason").max(120),
  resolution: z.enum(["EXCHANGE", "REFUND", "STORE_CREDIT"]),
  details: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
});

export const trackSchema = z.object({
  number: z.string().trim().toUpperCase().min(4, "Enter your order number"),
  contact: z.string().trim().min(4, "Enter the email or phone used at checkout"),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid input";
}

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
