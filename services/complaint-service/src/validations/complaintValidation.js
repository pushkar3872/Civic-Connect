const { z } = require('zod');
const CATEGORIES = require('../constants/categories');
const PRIORITIES = require('../constants/priorities');
const { STATUSES } = require('../constants/statuses');

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
});

const locationSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

const createComplaintSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(Object.values(CATEGORIES)),
  priority: z.enum(Object.values(PRIORITIES)).optional(),
  images: z.array(imageSchema).max(5).optional(),
  location: locationSchema.optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(Object.values(STATUSES)).optional(),
  workerRemarks: z.string().optional(),
  beforeImages: z.array(imageSchema).max(5).optional(),
  afterImages: z.array(imageSchema).max(5).optional(),
}).refine(
  (data) =>
    data.status !== undefined ||
    data.workerRemarks !== undefined ||
    data.beforeImages !== undefined ||
    data.afterImages !== undefined,
  {
    message: 'At least one update field is required',
  }
);

const assignWorkerSchema = z.object({
  workerId: z.string().min(1, 'Worker ID is required'),
});

const verifyComplaintSchema = z.object({
  approved: z.boolean(),
  adminRemarks: z.string().optional(),
});

const closeComplaintSchema = z.object({
  adminRemarks: z.string().optional(),
});

module.exports = {
  createComplaintSchema,
  updateStatusSchema,
  assignWorkerSchema,
  verifyComplaintSchema,
  closeComplaintSchema,
};
