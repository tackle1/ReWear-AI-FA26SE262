import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const otpSchema = z.object({
  phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})/, 'Invalid Vietnamese phone number'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
});

export const disputeSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
});
