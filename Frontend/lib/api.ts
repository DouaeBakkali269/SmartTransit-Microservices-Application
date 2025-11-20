import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

export async function readDb() {
  const data = await fs.promises.readFile(dbPath, 'utf8');
  return JSON.parse(data);
}

export async function writeDb(data: any) {
  await fs.promises.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export async function getUser(email: string) {
  const db = await readDb();
  return db.users.find((u: any) => u.email === email);
}

export async function getLines() {
  const db = await readDb();
  return db.lines;
}

export async function getTrips() {
  const db = await readDb();
  return db.trips;
}

export async function getTickets(userId: string) {
  const db = await readDb();
  return db.tickets.filter((t: any) => t.userId === userId);
}

export async function getIncidents() {
  const db = await readDb();
  return db.incidents;
}

export async function createUser(user: any) {
  const db = await readDb();
  db.users.push(user);
  await writeDb(db);
  return user;
}
