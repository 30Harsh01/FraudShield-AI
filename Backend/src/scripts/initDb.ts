// scripts/initDb.ts
import { sequelize } from '../db';

sequelize.sync({ force: true }).then(() => {
  console.log("✅ DB Synced");
  process.exit(0);
});
