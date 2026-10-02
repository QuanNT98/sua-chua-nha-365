/**
 * Orders on inka.vn: one record per order in the `orders` table (see config.ts).
 * Every customer writes to the same table, so each record carries `user_id`
 * and the app only shows the signed-in user's own orders. Customers can add
 * orders but not edit them: the status is changed by an admin (Database Manager).
 */
import type { Order, OrderStatus } from '@/store';
import type { RecordContent, RecordItem } from '@/types';
import { createRecord } from './api';
import { INKA } from './config';
import { num, str, tableRows } from './records';

const STATUSES: OrderStatus[] = ['booked', 'confirmed', 'done'];

function toContent(o: Omit<Order, 'id'>, userId: string): RecordContent {
  return {
    user_id: userId,
    code: o.code,
    title: o.title,
    category_id: o.categoryId,
    address: o.address,
    date: o.date,
    time: o.time,
    phone: o.phone,
    name: o.name,
    note: o.note,
    consult_first: o.consultFirst,
    status: o.status,
    warranty_months: o.warrantyMonths,
    created_at: o.createdAt,
  };
}

function fromRecord(r: RecordItem): Order {
  const c = r.content;
  const status = STATUSES.includes(c.status as OrderStatus) ? (c.status as OrderStatus) : 'booked';
  return {
    id: r.rc_id,
    code: str(c.code),
    title: str(c.title),
    categoryId: str(c.category_id) || 'khac',
    address: str(c.address),
    date: str(c.date),
    time: str(c.time),
    phone: str(c.phone),
    name: str(c.name),
    note: str(c.note),
    consultFirst: c.consult_first === true,
    status,
    warrantyMonths: num(c.warranty_months),
    createdAt: num(c.created_at),
  };
}

export async function listOrders(userId: string): Promise<Order[]> {
  return (await tableRows('orders'))
    .filter((r) => r.content.user_id === userId)
    .map(fromRecord)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function createOrder(userId: string, o: Omit<Order, 'id'>): Promise<Order> {
  const { rc_id } = await createRecord(INKA.tables.orders, toContent(o, userId));
  if (rc_id) return { ...o, id: rc_id };
  // Response without the new id: find the record by its order code.
  const saved = (await listOrders(userId)).find((x) => x.code === o.code);
  if (!saved) throw new Error('Không tìm thấy đơn vừa tạo');
  return saved;
}
