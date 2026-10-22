import "server-only";
import { email, text } from "../api";
import { query } from "../db";

const iso = (d) => (d instanceof Date ? d.toISOString() : d ? new Date(d).toISOString() : null);

export async function addContactMessage(input) {
  await query("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)", [
    text(input.name, "Name", { max: 120 }),
    email(input.email),
    text(input.subject, "Subject", { max: 200 }),
    text(input.message, "Message", { max: 5000 }),
  ]);
}

export async function subscribe(input) {
  await query("INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)", [email(input.email)]);
}

export async function listMessages() {
  const [messages, subscribers] = await Promise.all([
    query("SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 500"),
    query("SELECT email, created_at FROM newsletter_subscribers ORDER BY created_at DESC, id DESC"),
  ]);
  return {
    messages: messages.map((m) => ({ id: m.id, name: m.name, email: m.email, subject: m.subject, message: m.message, read: !!m.is_read, createdAt: iso(m.created_at) })),
    subscribers: subscribers.map((s) => ({ email: s.email, createdAt: iso(s.created_at) })),
  };
}

export async function markMessage(id, read) {
  await query("UPDATE contact_messages SET is_read = ? WHERE id = ?", [!!read, Number(id)]);
}

export async function deleteMessage(id) {
  await query("DELETE FROM contact_messages WHERE id = ?", [Number(id)]);
}

export async function countUnreadMessages() {
  const [row] = await query("SELECT COUNT(*) AS count FROM contact_messages WHERE is_read = 0");
  return Number(row.count);
}
