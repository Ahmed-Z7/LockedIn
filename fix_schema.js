const fs = require('fs');
let code = fs.readFileSync('c:/Users/Extra/LockedIn/drizzle/schema.ts', 'utf-8');

code = code.replace(/import \{ int, mysqlEnum, mysqlTable, text, timestamp, varchar \} from "drizzle-orm\/pg-core";/g, `import { integer, pgTable, text, timestamp, varchar, serial, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const categoryEnum = pgEnum("category", ["study_time", "streak", "focus", "group", "ai_usage", "consistency"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const rarityEnum = pgEnum("rarity", ["common", "rare", "epic", "legendary"]);
export const sessionTypeEnum = pgEnum("sessionType", ["study", "review"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const notificationTypeEnum = pgEnum("notificationType", ["like", "comment", "follow", "badge", "study_session"]);
export const groupRoleEnum = pgEnum("groupRole", ["admin", "member"]);
export const groupStatusEnum = pgEnum("groupStatus", ["pending", "approved"]);
export const groupTaskStatusEnum = pgEnum("groupTaskStatus", ["open", "completed"]);
export const invitationStatusEnum = pgEnum("invitationStatus", ["pending", "accepted", "declined"]);`);

code = code.replace(/mysqlTable\(/g, 'pgTable(');
code = code.replace(/int\(/g, 'integer(');
code = code.replace(/id: integer\("id"\)\.autoincrement\(\)\.primaryKey\(\)/g, 'id: serial("id").primaryKey()');
code = code.replace(/\.onUpdateNow\(\)/g, '.$onUpdate(() => new Date())');

code = code.replace(/mysqlEnum\("role", \["user", "admin"\]\)/g, 'roleEnum("role")');
code = code.replace(/mysqlEnum\("category", \["study_time", "streak", "focus", "group", "ai_usage", "consistency"\]\)/g, 'categoryEnum("category")');
code = code.replace(/mysqlEnum\("difficulty", \["easy", "medium", "hard"\]\)/g, 'difficultyEnum("difficulty")');
code = code.replace(/mysqlEnum\("rarity", \["common", "rare", "epic", "legendary"\]\)/g, 'rarityEnum("rarity")');
code = code.replace(/mysqlEnum\("sessionType", \["study", "review"\]\)/g, 'sessionTypeEnum("sessionType")');
code = code.replace(/mysqlEnum\("priority", \["low", "medium", "high"\]\)/g, 'priorityEnum("priority")');
code = code.replace(/mysqlEnum\("type", \["like", "comment", "follow", "badge", "study_session"\]\)/g, 'notificationTypeEnum("type")');
code = code.replace(/mysqlEnum\("role", \["admin", "member"\]\)/g, 'groupRoleEnum("role")');
code = code.replace(/mysqlEnum\("status", \["pending", "approved"\]\)/g, 'groupStatusEnum("status")');
code = code.replace(/mysqlEnum\("status", \["open", "completed"\]\)/g, 'groupTaskStatusEnum("status")');
code = code.replace(/mysqlEnum\("status", \["pending", "accepted", "declined"\]\)/g, 'invitationStatusEnum("status")');

fs.writeFileSync('c:/Users/Extra/LockedIn/drizzle/schema.ts', code);
console.log("Done modifying schema");
