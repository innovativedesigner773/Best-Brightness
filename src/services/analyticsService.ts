import { supabase } from "../lib/supabase";

export type TimeRange = "1W" | "1M" | "6M" | "12M";

function getRangeStart(range: TimeRange): string {
  const now = new Date();
  const start = new Date(now);
  switch (range) {
    case "1W":
      start.setDate(now.getDate() - 7);
      break;
    case "1M":
      start.setMonth(now.getMonth() - 1);
      break;
    case "6M":
      start.setMonth(now.getMonth() - 6);
      break;
    case "12M":
      start.setFullYear(now.getFullYear() - 1);
      break;
  }
  return start.toISOString();
}

function isCompletedStatus(status?: string | null): boolean {
  if (!status) return false;
  return ["confirmed", "processing", "shipped", "delivered", "completed", "paid"].includes(status);
}

export async function getSummary(range: TimeRange) {
  const since = getRangeStart(range);

  const [
    { data: ordersData, error: ordersError },
    productsRes,
    usersRes,
    newProductsRes
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total, total_amount, status, created_at")
      .gte("created_at", since),
    // Avoid head:true to work around some RLS/count header issues
    supabase
      .from("products")
      .select("id", { count: "exact" })
      .range(0, 0),
    supabase
      .from("user_profiles")
      .select("id", { count: "exact" })
      .range(0, 0),
    supabase
      .from("products")
      .select("id", { count: "exact" })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .range(0, 0)
  ]);

  if (ordersError) throw ordersError;
  const { count: productsCount, error: productsError } = productsRes as any;
  const { count: usersCount, error: usersError } = usersRes as any;
  const { count: newProductsCount, error: newProductsError } = newProductsRes as any;
  if (productsError) throw productsError;
  if (usersError) throw usersError;
  if (newProductsError) throw newProductsError;

  const orders = ordersData || [];
  const completedOrders = orders.filter(o => isCompletedStatus(o.status));
  const grossSales = orders.reduce((sum, o) => sum + Number(o.total ?? o.total_amount ?? 0), 0);
  let sales = completedOrders.reduce((sum, o) => sum + Number(o.total ?? o.total_amount ?? 0), 0);

  // Fallback A: if completed sales is 0 but gross > 0, show gross
  if (!sales && grossSales > 0) {
    sales = grossSales;
  }

  // Fallback B: if still 0, derive from order_items for completed orders
  if (!sales && completedOrders.length) {
    const orderIds = completedOrders.map(o => o.id);
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("order_id, quantity, total_price, unit_price")
      .in("order_id", orderIds);
    if (itemsError) throw itemsError;
    sales = (items || []).reduce((sum, it) => sum + Number(it.total_price ?? ((it.unit_price || 0) * (it.quantity || 0))), 0);
  }
  const pendingOrders = orders.filter(o => (o.status || '').toLowerCase() === 'pending').length;

  return {
    ordersCount: orders.length,
    salesAmount: sales,
    productsCount: productsCount || 0,
    usersCount: usersCount || 0,
    pendingOrders,
    newProductsThisWeek: newProductsCount || 0
  };
}

export async function getSalesTimeSeries(range: TimeRange) {
  const since = getRangeStart(range);
  const { data, error } = await supabase
    .from("orders")
    .select("id, total, total_amount, status, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const rows = (data || []).filter(r => isCompletedStatus(r.status));
  // First try grouping by order totals
  let map = new Map<string, { date: string; revenue: number; orders: number }>();
  for (const r of rows) {
    const d = new Date(r.created_at);
    const key = d.toISOString().slice(0, 10);
    const entry = map.get(key) || { date: key, revenue: 0, orders: 0 };
    entry.revenue += Number(r.total ?? r.total_amount ?? 0);
    entry.orders += 1;
    map.set(key, entry);
  }
  // Fallback to order_items when totals are zero
  const hasRevenue = Array.from(map.values()).some(e => e.revenue > 0);
  if (!hasRevenue && rows.length) {
    const orderIds = rows.map(r => r.id);
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("order_id, quantity, total_price, unit_price")
      .in("order_id", orderIds);
    if (itemsError) throw itemsError;
    map = new Map();
    // Build createdAt map for orders
    const orderIdToDate = new Map<string, string>();
    for (const o of rows) {
      const key = new Date(o.created_at).toISOString().slice(0, 10);
      orderIdToDate.set(o.id, key);
    }
    for (const it of items || []) {
      const key = orderIdToDate.get(it.order_id as any) || new Date().toISOString().slice(0, 10);
      const entry = map.get(key) || { date: key, revenue: 0, orders: 0 };
      entry.revenue += Number(it.total_price ?? ((it.unit_price || 0) * (it.quantity || 0)));
      map.set(key, entry);
    }
    // Recompute orders count per day from rows
    for (const r of rows) {
      const key = new Date(r.created_at).toISOString().slice(0, 10);
      const entry = map.get(key) || { date: key, revenue: 0, orders: 0 };
      entry.orders += 1;
      map.set(key, entry);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getBestSellers(range: TimeRange, by: "quantity" | "revenue", limit = 10) {
  const since = getRangeStart(range);
  // Step 1: fetch completed orders in range
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, status, created_at")
    .gte("created_at", since);
  if (ordersError) throw ordersError;

  const completedOrderIds = (orders || [])
    .filter(o => isCompletedStatus(o.status))
    .map(o => o.id);
  if (completedOrderIds.length === 0) return [];

  // Step 2: fetch items for those orders
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity, total_price, unit_price, product:products(name)")
    .in("order_id", completedOrderIds);
  if (itemsError) throw itemsError;

  const agg = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
  for (const row of items || []) {
    const id = row.product_id as string;
    if (!id) continue;
    const name = (row as any).product?.name || "Unknown";
    const current = agg.get(id) || { id, name, quantity: 0, revenue: 0 };
    current.quantity += row.quantity || 0;
    current.revenue += Number(row.total_price ?? ((row.quantity || 0) * (row as any).unit_price || 0));
    agg.set(id, current);
  }

  const arr = Array.from(agg.values());
  arr.sort((a, b) => (by === "quantity" ? b.quantity - a.quantity : b.revenue - a.revenue));
  return arr.slice(0, limit);
}

export async function getMonthlyStock50Reached() {
  // For current month: estimate starting stock as current + sold_this_month
  const monthStart = new Date();
  monthStart.setDate(1);
  const since = monthStart.toISOString();

  const [{ data: products, error: productsError }, { data: monthOrders, error: ordersError }] = await Promise.all([
    supabase.from("products").select("id, name, stock_quantity"),
    supabase
      .from("orders")
      .select("id, status, created_at")
      .gte("created_at", since)
  ]);
  if (productsError) throw productsError;
  if (ordersError) throw ordersError;

  const completedThisMonth = (monthOrders || []).filter(o => isCompletedStatus(o.status)).map(o => o.id);
  if (completedThisMonth.length === 0) return [];

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .in("order_id", completedThisMonth);
  if (itemsError) throw itemsError;

  const soldMap = new Map<string, number>();
  for (const it of items || []) {
    const completed = isCompletedStatus((it as any).orders?.status);
    if (!completed) continue;
    if (!it.product_id) continue;
    soldMap.set(it.product_id, (soldMap.get(it.product_id) || 0) + (it.quantity || 0));
  }

  const results = [] as Array<{ id: string; name: string; soldThisMonth: number; startingStock: number; percentSold: number }>;
  for (const p of products || []) {
    const sold = soldMap.get(p.id) || 0;
    const starting = (p.stock_quantity || 0) + sold;
    if (starting <= 0) continue;
    const percent = sold / starting;
    if (percent >= 0.5) {
      results.push({ id: p.id, name: p.name, soldThisMonth: sold, startingStock: starting, percentSold: percent });
    }
  }
  // Sort by percent sold desc
  results.sort((a, b) => b.percentSold - a.percentSold);
  return results;
}

export async function getRevenueBreakdown(range: TimeRange) {
  const since = getRangeStart(range);
  // Orders in range
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status, subtotal, tax_amount, shipping_amount, discount_amount, total, total_amount, created_at')
    .gte('created_at', since);
  if (error) throw error;

  const completed = (orders || []).filter(o => isCompletedStatus(o.status));
  const sum = (arr: any[], key: string) => arr.reduce((s, o) => s + Number(o[key] || 0), 0);
  const subtotal = sum(completed, 'subtotal');
  const tax = sum(completed, 'tax_amount');
  const shipping = sum(completed, 'shipping_amount');
  const discount = sum(completed, 'discount_amount');
  let total = sum(completed, 'total');
  if (!total) total = sum(completed, 'total_amount');

  // Fallback: compute from items if totals missing
  if (!total && completed.length) {
    const ids = completed.map(o => o.id);
    const { data: items } = await supabase
      .from('order_items')
      .select('order_id, quantity, unit_price, total_price')
      .in('order_id', ids);
    total = (items || []).reduce((s, it) => s + Number(it.total_price ?? ((it.unit_price || 0) * (it.quantity || 0))), 0);
  }

  return { subtotal, tax, shipping, discount, total };
}

export async function getInventoryKpis() {
  const [{ data: products, error: pErr }] = await Promise.all([
    supabase.from('products').select('id, stock_quantity, is_active')
  ]);
  if (pErr) throw pErr;
  const all = products || [];
  const outOfStock = all.filter(p => (p.stock_quantity || 0) === 0).length;
  const lowStock = all.filter(p => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 5).length;
  const active = all.filter(p => p.is_active).length;
  return { totalProducts: all.length, active, outOfStock, lowStock };
}

export async function getSalesByCategory(range: TimeRange) {
  const since = getRangeStart(range);
  const { data: orders, error: oErr } = await supabase
    .from('orders')
    .select('id, status, created_at')
    .gte('created_at', since);
  if (oErr) throw oErr;
  const completedIds = (orders || []).filter(o => isCompletedStatus(o.status)).map(o => o.id);
  if (completedIds.length === 0) return [];

  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('product_id, total_price, quantity, products(category_id), categories:products(category_id)')
    .in('order_id', completedIds);
  if (iErr) throw iErr;

  // Fetch categories names
  const { data: cats } = await supabase.from('categories').select('id, name');
  const idToName = new Map((cats || []).map(c => [c.id, c.name] as [string, string]));

  const agg = new Map<string, { categoryId: string; categoryName: string; revenue: number; orders: number; items: number }>();
  for (const it of items || []) {
    const categoryId = (it as any).products?.category_id || (it as any).categories?.category_id || 'uncategorized';
    const key = categoryId;
    const name = idToName.get(categoryId) || 'Uncategorized';
    const rec = agg.get(key) || { categoryId, categoryName: name, revenue: 0, orders: 0, items: 0 };
    rec.revenue += Number(it.total_price ?? 0);
    rec.items += Number(it.quantity || 0);
    agg.set(key, rec);
  }
  return Array.from(agg.values()).sort((a, b) => b.revenue - a.revenue);
}

export async function getTopCustomers(range: TimeRange, limit = 5) {
  const since = getRangeStart(range);
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status, total, total_amount, customer_id, customer_email, created_at')
    .gte('created_at', since);
  if (error) throw error;
  const completed = (orders || []).filter(o => isCompletedStatus(o.status));
  const map = new Map<string, { id: string; name: string; email: string; total: number; orders: number }>();
  for (const o of completed) {
    const key = o.customer_id || o.customer_email || 'unknown';
    const rec = map.get(key) || { id: key, name: '', email: o.customer_email || '', total: 0, orders: 0 };
    rec.total += Number(o.total ?? o.total_amount ?? 0);
    rec.orders += 1;
    map.set(key, rec);
  }
  // Enrich names
  const ids = Array.from(map.keys()).filter(k => k.length === 36);
  if (ids.length) {
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', ids);
    for (const u of users || []) {
      const rec = map.get(u.id);
      if (rec) rec.name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
    }
  }
  const arr = Array.from(map.values());
  arr.sort((a, b) => b.total - a.total);
  return arr.slice(0, limit);
}

export async function getBusinessValue(range: TimeRange) {
  const since = getRangeStart(range);
  // Orders and items in range
  const [{ data: orders, error: oErr }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, total, total_amount, customer_id, created_at')
      .gte('created_at', since)
  ]);
  if (oErr) throw oErr;

  const completed = (orders || []).filter(o => isCompletedStatus(o.status));
  const orderIds = completed.map(o => o.id);

  let items: any[] = [];
  if (orderIds.length) {
    const { data: it, error: iErr } = await supabase
      .from('order_items')
      .select('order_id, quantity, unit_price, total_price');
    if (iErr) throw iErr;
    items = (it || []).filter(x => orderIds.includes(x.order_id));
  }

  // AOV and items per order
  const revenue = completed.reduce((s, o) => s + Number(o.total ?? o.total_amount ?? 0), 0);
  const ordersCount = completed.length;
  const itemsCount = items.reduce((s, it) => s + Number(it.quantity || 0), 0);
  const aov = ordersCount ? revenue / ordersCount : 0;
  const itemsPerOrder = ordersCount ? itemsCount / ordersCount : 0;

  // Repeat customer rate
  const customerOrderCounts = new Map<string, number>();
  for (const o of completed) {
    const key = o.customer_id || `anon-${o.id}`;
    customerOrderCounts.set(key, (customerOrderCounts.get(key) || 0) + 1);
  }
  const customers = Array.from(customerOrderCounts.values());
  const repeatCustomers = customers.filter(c => c > 1).length;
  const uniqueCustomers = customers.length || 1;
  const repeatRate = repeatCustomers / uniqueCustomers;

  // Inventory: approximate inventory value & sell-through
  const { data: products } = await supabase
    .from('products')
    .select('id, price, cost_price, stock_quantity');
  const productList = products || [];
  const inventoryValueRetail = productList.reduce((s, p) => s + Number(p.price || 0) * Number(p.stock_quantity || 0), 0);
  const inventoryValueCost = productList.reduce((s, p) => s + Number(p.cost_price || 0) * Number(p.stock_quantity || 0), 0);
  const grossMargin = revenue && inventoryValueCost >= 0 ? (revenue - inventoryValueCost) / Math.max(revenue, 1) : 0;

  // Sell-through: items sold vs (items sold + current stock) for SKUs touched
  const soldByProduct = new Map<string, number>();
  if (orderIds.length) {
    const { data: joined } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .in('order_id', orderIds);
    for (const it of joined || []) {
      if (!it.product_id) continue;
      soldByProduct.set(it.product_id, (soldByProduct.get(it.product_id) || 0) + Number(it.quantity || 0));
    }
  }
  let sellThrough = 0;
  if (soldByProduct.size) {
    let sold = 0;
    let starting = 0;
    for (const [pid, qty] of soldByProduct.entries()) {
      const p = productList.find(x => x.id === pid);
      const stock = Number(p?.stock_quantity || 0);
      sold += qty;
      starting += (qty + stock);
    }
    sellThrough = starting ? sold / starting : 0;
  }

  // Refund rate (if status "cancelled" present)
  const cancelled = (orders || []).filter(o => (o.status || '').toLowerCase() === 'cancelled').length;
  const refundRate = (orders || []).length ? cancelled / (orders || []).length : 0;

  return {
    aov,
    itemsPerOrder,
    repeatRate,
    grossMargin,
    inventoryValueRetail,
    inventoryValueCost,
    sellThrough,
    refundRate,
    revenue,
    ordersCount,
    itemsCount
  };
}


