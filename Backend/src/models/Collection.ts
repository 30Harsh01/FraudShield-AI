import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique
} from 'sequelize-typescript';

/** Card structure */
export interface AttachedCard {
  scheme: string;
  bin: string;
  last_4: string;
}

/** Table attributes */
export interface CollectionAttributes {
  id: number;
  email: string;
  attached_cards: AttachedCard[];

  country_code: string[];
  currency: string[];

  names: string[];
  ip_addresses: string[];
  order_ids: string[];
  shopper_ids: string[];
  merchant_ids: string[];

  total_txn: number;
  total_sales: number;
  total_sale_amount: number;
  total_refunds: number;
  total_refund_amount: number;
  total_chargebacks: number;
  total_chargeback_amount: number;

  layer1_status: string;
  layer2_status: string;
  last_updated: Date;
  recent_txn_count: number;
  layer1_score: number;
}

export type CollectionCreationAttributes =
  Omit<CollectionAttributes, 'id'>;

@Table({ timestamps: true })
export class Collection extends Model<
  CollectionAttributes,
  CollectionCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  /** One record per email */
  @Unique
  @Column(DataType.STRING)
  email!: string;

  /** Cards linked to this email */
  @Column(DataType.JSON)
  attached_cards!: AttachedCard[];

  @Column(DataType.JSON)
  country_code!: string[];

  @Column(DataType.JSON)
  currency!: string[];

  @Column(DataType.JSON)
  names!: string[];

  @Column(DataType.JSON)
  ip_addresses!: string[];

  @Column(DataType.JSON)
  order_ids!: string[];

  @Column(DataType.JSON)
  shopper_ids!: string[];

  @Column(DataType.JSON)
  merchant_ids!: string[];

  @Column(DataType.INTEGER)
  total_txn!: number;

  @Column(DataType.INTEGER)
  total_sales!: number;

  @Column(DataType.FLOAT)
  total_sale_amount!: number;

  @Column(DataType.INTEGER)
  total_refunds!: number;

  @Column(DataType.FLOAT)
  total_refund_amount!: number;

  @Column(DataType.INTEGER)
  total_chargebacks!: number;

  @Column(DataType.FLOAT)
  total_chargeback_amount!: number;

  @Column(DataType.STRING)
  layer1_status!: string;

  @Column(DataType.STRING)
  layer2_status!: string;

  @Column(DataType.DATE)
  last_updated!: Date;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  recent_txn_count!: number;

  @Column({ type: DataType.FLOAT, defaultValue: 40 })
  layer1_score!: number;
}
