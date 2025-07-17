
// import mysql from 'mysql2/promise';
// import type { Project, ServiceOrderItem, InvoiceItem, ExpenditureItem } from '@/lib/projects';

// // --- Database Connection Pool ---
// // It's recommended to create a connection pool to manage database connections efficiently.
// // This should be configured once and reused throughout your application.
// // The connection details would typically be stored in environment variables.
// /*
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || 'password',
//   database: process.env.DB_NAME || 'protrack_db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });
// */

// // --- Helper Function to Get a Connection ---
// /*
// async function getConnection() {
//   return pool.getConnection();
// }
// */

// // --- Project Service Functions ---

// /**
//  * Fetches all projects from the database.
//  * In a real app, you'd fetch related items like invoices, serviceOrders, etc.,
//  * either in separate queries or using JOINs.
//  */
// /*
// export async function getProjects(): Promise<Project[]> {
//   let connection;
//   try {
//     connection = await getConnection();
//     const [rows] = await connection.execute('SELECT * FROM projects');
//     // Note: This is a simplified example. You would need additional queries
//     // to fetch and attach related invoices, expenditures, etc., to each project.
//     return rows as Project[];
//   } catch (error) {
//     console.error('Failed to fetch projects:', error);
//     return [];
//   } finally {
//     if (connection) connection.release();
//   }
// }
// */

// /**
//  * Adds a new project to the database.
//  */
// /*
// export async function addProject(projectData: Omit<Project, 'id'>): Promise<string> {
//   let connection;
//   const newId = `PROJ-${Date.now()}`;
//   const {
//     contractNumber, name, client, description, value, period, duration,
//     branchId, contractExecutor, portfolio, subPortfolio, serviceCode, serviceName
//   } = projectData;

//   const sql = `
//     INSERT INTO projects (id, contractNumber, name, client, description, value, period, duration, branchId, contractExecutor, portfolio, subPortfolio, serviceCode, serviceName)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   try {
//     connection = await getConnection();
//     await connection.execute(sql, [
//       newId, contractNumber, name, client, description, value, period, duration,
//       branchId, contractExecutor, portfolio, subPortfolio, serviceCode, serviceName
//     ]);
//     // Note: You would also handle inserting budgets, SOs, etc., in separate transactions.
//     return newId;
//   } catch (error) {
//     console.error('Failed to add project:', error);
//     throw new Error('Could not add project to database.');
//   } finally {
//     if (connection) connection.release();
//   }
// }
// */

// /**
//  * Updates an existing project in the database.
//  */
// /*
// export async function updateProject(id: string, projectData: Partial<Project>): Promise<void> {
//   let connection;
//   // This is a simplified update. A real implementation would be more robust,
//   // dynamically building the SET clause based on the fields in projectData.
//   const { name, client, description, value } = projectData;

//   const sql = `
//     UPDATE projects
//     SET name = ?, client = ?, description = ?, value = ?
//     WHERE id = ?
//   `;

//   try {
//     connection = await getConnection();
//     await connection.execute(sql, [name, client, description, value, id]);
//     // Note: This does not handle updates to nested arrays like invoices or expenditures.
//     // Those would require separate, more complex logic (e.g., finding, updating, or inserting related records).
//   } catch (error) {
//     console.error(`Failed to update project ${id}:`, error);
//     throw new Error('Could not update project in database.');
//   } finally {
//     if (connection) connection.release();
//   }
// }
// */
