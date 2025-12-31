import { Sequelize } from 'sequelize-typescript';
import { Transaction } from '../models/Transaction';
import { Collection, CollectionCreationAttributes } from '../models/Collection';

//for deployment
// export const sequelize = new Sequelize("Your URL STRING DB MYSQL",{
//   dialect: 'mysql',
//   logging: false,
//   models: [Transaction, Collection],
//   pool: {
//     max: 2,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// });




//for local
export const sequelize = new Sequelize("mysql://root:12345678@localhost:3306/test",{     //DB credentials Update
  dialect: 'mysql',
  logging: false,
  models: [Transaction, Collection],
  pool: {
    max: 2,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});