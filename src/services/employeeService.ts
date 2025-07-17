
// import mysql from 'mysql2/promise';
// import type { Employee } from '@/lib/employees';

// // Assume connection pool is created and exported from a central db file
// // import { pool } from './database';

// /**
//  * Fetches all employees from the database.
//  */
// /*
// export async function getEmployees(): Promise<Employee[]> {
//   let connection;
//   try {
//     connection = await pool.getConnection();
//     const [rows] = await connection.execute('SELECT * FROM employees');
//     return rows as Employee[];
//   } catch (error) {
//     console.error('Failed to fetch employees:', error);
//     return [];
//   } finally {
//     if (connection) connection.release();
//   }
// }
// */

// /**
//  * Adds a new employee to the database.
//  */
// /*
// export async function addEmployee(employeeData: Employee): Promise<void> {
//   let connection;
//   // Destructure all fields from employeeData to ensure they match the table columns
//   const { id, name, email, position, ...otherFields } = employeeData;
//   const sql = `
//     INSERT INTO employees (id, name, email, position, ...other_columns)
//     VALUES (?, ?, ?, ?, ...)
//   `;

//   try {
//     connection = await pool.getConnection();
//     await connection.execute(sql, [id, name, email, position, ...Object.values(otherFields)]);
//   } catch (error) {
//     console.error('Failed to add employee:', error);
//     throw new Error('Could not add employee to database.');
//   } finally {
//     if (connection) connection.release();
//   }
// }
// */

// /**
//  * Deletes an employee from the database.
//  */
// /*
// export async function deleteEmployee(employeeId: string): Promise<void> {
//   let connection;
//   try {
//     connection = await pool.getConnection();
//     await connection.execute('DELETE FROM employees WHERE id = ?', [employeeId]);
//   } catch (error) {
//     console.error(`Failed to delete employee ${employeeId}:`, error);
//     throw new Error('Could not delete employee from database.');
//   } finally {
//     if (connection) connection.release();
//   }
// }
// */
