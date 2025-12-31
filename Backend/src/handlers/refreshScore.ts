// src/handlers/refreshScore.ts
import { Router, Request, Response } from 'express';
import { callPython } from '../services/pythonService';
import { Collection } from '../models/Collection';
import { Op } from 'sequelize';
import { sequelize } from '../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  await sequelize.authenticate();
  console.log('🔗 Connected to DB');

  try {
    const body = req.body || {};
    const { id, email } = body;

    if (!id && !email) {
      return res.status(400).json({ message: '❌ Please provide either an id or an email.' });
    }

    const where: any = {};

    // Handle multiple IDs
    if (id) {
      const ids = id.split(',').map((v: string) => v.trim());
      where.id = ids.length > 1 ? { [Op.in]: ids } : ids[0];
    }

    // Handle multiple emails
    if (email) {
      const emails = email.split(',').map((v: string) => v.trim());
      where.email = emails.length > 1 ? { [Op.in]: emails } : emails[0];
    }

    // Fetch required fields from DB
    const collections = await Collection.findAll({
      where,
      attributes: [
        'id',
        'email',
        'attached_cards',
        'ip_addresses',
        'total_sales',
        'total_refunds',
        'total_chargebacks',
        'total_sale_amount',
        'total_refund_amount',
        'total_chargeback_amount',
        'layer1_score'
      ]
    });

    if (collections.length === 0) {
      return res.status(404).json({ message: '❌ No collections found matching the criteria.' });
    }

    console.log(`📥 Found ${collections.length} matching collections`);

    // Prepare input for Python Layer 2
    const inputData = collections.map((item, index) => {
      const unique_ip_count = Array.isArray(item.ip_addresses)
        ? new Set(item.ip_addresses).size
        : 1;

      const card_count = Array.isArray(item.attached_cards)
        ? item.attached_cards.length
        : 1;

      const data = {
        id: item.id, // Include DB id so Python can return it
        email: item.email,
        total_sales_count: item.total_sales,
        successful_sales_count: item.total_sales,
        refund_count: item.total_refunds,
        chargeback_count: item.total_chargebacks,
        total_sales_amount: item.total_sale_amount,
        refund_amount: item.total_refund_amount,
        chargeback_amount: item.total_chargeback_amount,
        ip_addresses: item.ip_addresses || [],
        attached_cards: item.attached_cards || [],
        unique_ip_count,
        card_count,
        fraud_score: item.layer1_score ?? 50
      };

      console.log(`🔍 Prepared Layer 2 input [${index + 1}]:`, data);
      return data;
    });

    console.log('📤 Sending input to Python layer2 script...');
    const rawResults = await callPython('rules_layer2.py', inputData);

    console.log('📥 Received results from Python:', rawResults);

    // Map Python results to DB updates
    const scoredResults = rawResults.map((result: any, idx: number) => {
      let status = '';
      if (result.ml_prediction === 'fraud') status = 'd';
      else if (result.ml_prediction === 'good') status = 'a';
      else if (result.ml_prediction === 'review') status = 'r';

      return {
        id: result.id ?? inputData[idx].id, // fallback to DB id if Python missed it
        layer2_status: status
      };
    });

    // Update Layer 2 status in DB
    for (const result of scoredResults) {
      if (!result.id) continue; // skip if no id
      await Collection.update(
        { layer2_status: result.layer2_status },
        { where: { id: result.id } }
      );
      console.log(`✅ Updated Collection ID ${result.id} with Layer2 status: ${result.layer2_status}`);
    }

    return res.status(200).json({
      message: `✅ Successfully updated fraud scores for ${scoredResults.length} collection(s).`,
      updated_count: scoredResults.length,
      updated_ids: scoredResults.map((r: any) => r.id),
      updates: scoredResults
    });

  } catch (err: any) {
    console.error('❌ Scoring failed:', err);
    return res.status(500).json({ error: 'Scoring failed', detail: err.message });
  }
});

export default router;
