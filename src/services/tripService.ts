
// import mysql from 'mysql2/promise';
// import type { TripRequest } from '@/lib/trips';

// // Assume connection pool is created and exported from a central db file
// // import { pool } from './database';

// /**
//  * Fetches all trip requests from the database.
//  */
// /*
// export async function getTrips(): Promise<TripRequest[]> {
//   let connection;
//   try {
//     connection = await pool.getConnection();
//     const [rows] = await connection.execute('SELECT * FROM trips');
//     // Note: In a real SQL schema, complex objects like 'allowance' and 'approvalHistory'
//     // would likely be stored as JSON or in related tables.
//     return (rows as any[]).map(row => ({
//       ...row,
//       allowance: JSON.parse(row.allowance || '{}'),
//       approvalHistory: JSON.parse(row.approvalHistory || '[]'),
//     }));
//   } catch (error) {
//     console.error('Failed to fetch trips:', error);
//     return [];
//   } finally {
//     if (connection) connection.release();
//   }
// }
// */
