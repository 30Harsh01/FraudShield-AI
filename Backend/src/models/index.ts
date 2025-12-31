// src/models/index.ts
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from './Transaction';
import { Collection } from './Collection';

export const sequelize = new Sequelize({     //Update as per you DB credentuals
  dialect: 'mysql',
  host: "localhost",
  port: Number(3306),
  username: 'root',
  password: '12345678',
  database: 'test',
  models: [Transaction, Collection],
  logging: false
});