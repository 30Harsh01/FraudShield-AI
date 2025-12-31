// First api to hit 
import { Router, Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { Collection, CollectionCreationAttributes } from '../models/Collection';
import { sequelize } from '../db';
import { formatJsonListMerge } from '../utils/mergeUtils';
import { Op } from 'sequelize';
import { subMinutes } from 'date-fns';
import { callPython } from '../services/pythonService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();

    const data = req.body;
    const { bin, last_4, email } = data;

    if (!email || !bin || !last_4) {
      return res.status(400).json({
        error: 'Missing email, bin, or last_4'
      });
    }

    /** Count recent transactions for this card */
    const recentTxnCount = await Transaction.count({
      where: {
        bin,
        last_4,
        createdAt: { [Op.gte]: subMinutes(new Date(), 10) }
      }
    });

    /** Find collection by EMAIL (Design A) */
    const existingCollection = await Collection.findOne({ where: { email } });

    /** Prepare card object */
    const card = {
      scheme: data.scheme,
      bin,
      last_4
    };

    /** Enrich payload for ML */
    const enrichedPayload = {
      avs_check: data.avs_check,
      cvv_matched: data.cvv_matched,
      billing_address: data.billing_address,
      shipping_address: data.shipping_address,
      recent_txn_count: recentTxnCount,

      total_sales_count: existingCollection?.total_txn || 0,
      total_sales_amount: existingCollection?.total_sale_amount || 0,
      refund_count: existingCollection?.total_refunds || 0,
      refund_amount: existingCollection?.total_refund_amount || 0,
      chargeback_count: existingCollection?.total_chargebacks || 0,
      chargeback_amount: existingCollection?.total_chargeback_amount || 0,
      successful_sales_count: existingCollection?.total_sales || 0,
      fraud_score: existingCollection?.layer1_score || 50
    };

    const ruleResult = await callPython('rules_layer1.py', enrichedPayload);
    const layer1_status: 'a' | 'd' | 'r' = ruleResult.status_score;

    /** Save transaction */
    const createdTxn = await Transaction.create({
      ...data,
      raw_payload: data
    });

    /** Defaults for new email record */
    const defaults: CollectionCreationAttributes = {
      email,
      attached_cards: [card],
      country_code: [data.country_code],
      currency: [data.currency],
      names: [data.name],
      ip_addresses: [data.ip_address],
      order_ids: [data.order_id],
      shopper_ids: [data.shopper_id],
      merchant_ids: [data.merchant_id],
      total_txn: 1,
      total_sales: data.sale ? 1 : 0,
      total_sale_amount: data.sale ? data.sale_amount : 0,
      total_refunds: data.refund ? 1 : 0,
      total_refund_amount: data.refund ? data.refund_amount : 0,
      total_chargebacks: data.chargeback ? 1 : 0,
      total_chargeback_amount: data.chargeback_amount || 0,
      recent_txn_count: recentTxnCount,
      layer1_status,
      layer2_status: '',
      layer1_score: ruleResult.score,
      last_updated: new Date()
    };

    /** Create or update collection */
    const [collection, created] = await Collection.findOrCreate({
      where: { email },
      defaults
    });

    if (!created) {
      /** Merge lists */
      collection.names = formatJsonListMerge(collection.names, data.name);
      collection.ip_addresses = formatJsonListMerge(collection.ip_addresses, data.ip_address);
      collection.order_ids = formatJsonListMerge(collection.order_ids, data.order_id);
      collection.shopper_ids = formatJsonListMerge(collection.shopper_ids, data.shopper_id);
      collection.merchant_ids = formatJsonListMerge(collection.merchant_ids, data.merchant_id);

      /** Merge card if new */
      const cardExists = collection.attached_cards.some(c => c.bin === bin && c.last_4 === last_4);
      if (!cardExists) {
        collection.attached_cards = [...collection.attached_cards, card];
      }

      /** Merge country and currency */
      collection.country_code = formatJsonListMerge(collection.country_code, data.country_code);
      collection.currency = formatJsonListMerge(collection.currency, data.currency);

      /** Update counters */
      collection.total_txn += 1;

      if (data.sale) {
        collection.total_sales += 1;
        collection.total_sale_amount += data.sale_amount || 0;
      }

      if (data.refund) {
        collection.total_refunds += 1;
        collection.total_refund_amount += data.refund_amount || 0;
      }

      if (data.chargeback) {
        collection.total_chargebacks += 1;
        collection.total_chargeback_amount += data.chargeback_amount || 0;
      }

      collection.recent_txn_count = recentTxnCount;
      collection.layer1_status = layer1_status;
      collection.layer1_score = ruleResult.score;
      collection.last_updated = new Date();

      await collection.save();
    }

    return res.status(200).json({
      message: 'Transaction and collection updated successfully',
      transaction_id: createdTxn.id,
      email,
      layer1result: ruleResult
    });
  } catch (err) {
    console.error('❌ Train error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
