
// import mysql from 'mysql2/promise';
// import type { EquipmentItem } from '@/lib/equipment';

// // Assume connection pool is created and exported from a central db file
// // import { pool } from './database';

// /**
//  * Fetches all equipment from the database.
//  */
// /*
// export async function getEquipment(): Promise<EquipmentItem[]> {
//   let connection;
//   try {
//     connection = await pool.getConnection();
//     const [rows] = await connection.execute('SELECT * FROM equipment');
//     // Note: In a real SQL schema, arrays like imageUrls would likely be in a separate
//     // related table. This query would need to be more complex (using JOINs).
//     return rows as EquipmentItem[];
//   } catch (error) {
//     console.error('Failed to fetch equipment:', error);
//     return [];
//   } finally {
//     if (connection) connection.release();
//   }
// }
// */
