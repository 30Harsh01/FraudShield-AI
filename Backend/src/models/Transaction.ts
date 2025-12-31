import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'transaction', 
  timestamps: true,
})export class Transaction extends Model<Transaction> {
  @Column(DataType.STRING) billing_address!: string;
  @Column(DataType.STRING) shipping_address!: string;
  @Column(DataType.STRING) browser_info!: string;
  @Column(DataType.BOOLEAN) avs_check!: boolean;
  @Column(DataType.BOOLEAN) cvv_matched!: boolean;
  @Column(DataType.STRING) name!: string;
  @Column(DataType.STRING) email!: string;
  @Column(DataType.STRING) bin!: string;
  @Column(DataType.STRING) last_4!: string;
  @Column(DataType.STRING) ip_address!: string;
  @Column(DataType.INTEGER) sale!: number;
  @Column(DataType.FLOAT) sale_amount!: number;
  @Column(DataType.INTEGER) refund!: number;
  @Column(DataType.FLOAT) refund_amount!: number;
  @Column(DataType.INTEGER) chargeback!: number;
  @Column(DataType.FLOAT) chargeback_amount!: number;
  @Column(DataType.STRING) order_id!: string;
  @Column(DataType.STRING) shopper_id!: string;
  @Column(DataType.STRING) merchant_id!: string;
  @Column(DataType.BOOLEAN) is_3ds_required!: boolean;
  @Column(DataType.STRING) country_code!: string;
  @Column(DataType.STRING) currency!: string;
  @Column(DataType.JSON) raw_payload!: any; // optional to store original input
  @Column({ type: DataType.INTEGER, defaultValue: 0 }) recent_txn_count!: number;
}
