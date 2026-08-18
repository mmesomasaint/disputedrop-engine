// src/controllers/merchant.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/app-error';

const prisma = new PrismaClient();

export class MerchantController {
  /**
   * GET /api/v1/merchants
   * Public endpoint to populate frontend vendor selection dropdowns.
   */
  public async getMerchants(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.query;

      const whereClause = category ? { category: String(category) } : {};

      const merchants = await prisma.merchant.findMany({
        where: whereClause,
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
          cancellationType: true,
          recipientName: true,
          city: true,
          state: true,
        },
        orderBy: { name: 'asc' },
      });

      res.status(200).json({
        status: 'success',
        results: merchants.length,
        data: { merchants },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/merchants/:slug
   * Retrieves full merchant details and required cancellation statutory language.
   */
  public async getMerchantBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const merchant = await prisma.merchant.findUnique({
        where: { slug },
      });

      if (!merchant) {
        throw new AppError(`Merchant with slug '${slug}' not found.`, 404);
      }

      res.status(200).json({
        status: 'success',
        data: { merchant },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/merchants
   * Admin endpoint to register a new vendor with certified mailing & fax destinations.
   */
  public async createMerchant(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;

      const existingMerchant = await prisma.merchant.findUnique({
        where: { slug: payload.slug },
      });

      if (existingMerchant) {
        throw new AppError(`Merchant with slug '${payload.slug}' already exists.`, 409);
      }

      const newMerchant = await prisma.merchant.create({
        data: {
          slug: payload.slug,
          name: payload.name,
          category: payload.category,
          cancellationType: payload.cancellationType,
          recipientName: payload.recipientName,
          addressLine1: payload.addressLine1,
          addressLine2: payload.addressLine2,
          city: payload.city,
          state: payload.state,
          postalCode: payload.postalCode,
          country: payload.country || 'US',
          faxNumber: payload.faxNumber,
          statutoryClause: payload.statutoryClause,
        },
      });

      res.status(201).json({
        status: 'success',
        data: { merchant: newMerchant },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const merchantController = new MerchantController();
