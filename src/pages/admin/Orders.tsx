import React, { useEffect, useState } from 'react';
import { Package, Search, Filter, Eye, Download } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
  sku: string;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface DummyOrder {
  id: string;
  customer_name: string;
  items_count: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  reference: string;
}

export default function AdminOrders() {
  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<DummyOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DummyOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const formatZAR = (amount: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportOrdersCSV = () => {
    if (!orders || orders.length === 0) return;
    const header = ['order_id','customer_name','items_count','total_amount_zar','status','created_at','reference'];
    const rows = orders.map(o => [
      o.id,
      o.customer_name,
      String(o.items_count),
      String(o.total_amount),
      o.status,
      o.created_at,
      o.reference
    ]);
    const csv = [header, ...rows]
      .map(cols => cols
        .map(val => {
          const s = String(val ?? '');
          if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        })
        .join(','))
      .join('\n');
    downloadFile(csv, `orders-export-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8;');
  };

  const handlePrintInvoice = (order: DummyOrder) => {
    if (!order) return;
    const win = window.open('', '_blank');
    if (!win) return;
    const doc = win.document;
    const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Invoice ${order.id}</title>
        <style>
          :root { color-scheme: light; }
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background: #fff; color: #111827; margin: 0; }
          .container { max-width: 800px; margin: 32px auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 16px; }
          .header { display:flex; justify-content: space-between; align-items:center; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px; }
          .brand { font-size: 20px; font-weight: 700; }
          .muted { color: #6B7280; }
          .row { display:flex; gap: 16px; }
          .card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 12px; }
          .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .title { font-weight: 600; font-size: 14px; color: #374151; margin-bottom: 8px; }
          .totals { display:flex; justify-content:flex-end; margin-top: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 10px; border-bottom: 1px solid #E5E7EB; }
          th { background: #F9FAFB; font-size: 12px; text-transform: uppercase; color: #6B7280; }
          .right { text-align: right; }
          @media print { .container { box-shadow: none; border: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Best Brightness</div>
            <div class="muted">Invoice • ${order.id}</div>
          </div>
          <div style="margin-top:16px" class="grid">
            <div class="card">
              <div class="title">Billed To</div>
              <div>${order.customer_name}</div>
              <div class="muted">Reference: ${order.reference}</div>
            </div>
            <div class="card">
              <div class="title">Order Details</div>
              <div>Status: ${order.status}</div>
              <div class="muted">Placed: ${new Date(order.created_at).toLocaleString()}</div>
            </div>
          </div>
          <div style="margin-top:16px">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="right">Qty</th>
                  <th class="right">Amount (ZAR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Product ${order.reference}</td>
                  <td class="right">${order.items_count}</td>
                  <td class="right">${formatZAR(order.total_amount)}</td>
                </tr>
              </tbody>
            </table>
            <div class="totals">
              <div>
                <div class="row" style="justify-content: space-between; min-width:280px">
                  <div class="muted">Subtotal</div>
                  <div>${formatZAR(order.total_amount)}</div>
                </div>
                <div class="row" style="justify-content: space-between; min-width:280px">
                  <div class="muted">VAT (0%)</div>
                  <div>${formatZAR(0)}</div>
                </div>
                <div class="row" style="justify-content: space-between; min-width:280px; font-weight:700; margin-top: 8px;">
                  <div>Total</div>
                  <div>${formatZAR(order.total_amount)}</div>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top:24px" class="muted">Thank you for your business.</div>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>`;
    doc.open();
    doc.write(html);
    doc.close();
  };

  useEffect(() => {
    const fetchAndBuildDummyOrders = async () => {
      try {
        setLoading(true);
        const { data: productsData, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          throw error;
        }

        const customers = [
          'John Doe',
          'Jane Smith',
          'Michael Brown',
          'Emily Johnson',
          'David Wilson',
          'Sarah Miller',
          'Daniel Garcia',
          'Olivia Martinez',
          'Liam Anderson',
          'Sophia Thomas'
        ];
        const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        const dummyOrders: DummyOrder[] = (productsData as Product[] | null || [])
          .map((product, index) => {
            const quantity = Math.max(1, Math.floor(Math.random() * 4) + 1);
            const total = product.price * quantity;
            const status = statuses[index % statuses.length];
            const customer = customers[index % customers.length];
            const daysAgo = Math.floor(Math.random() * 14);
            const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

            return {
              id: `ORD-${String(index + 1001)}`,
              customer_name: customer,
              items_count: quantity,
              total_amount: Number(total.toFixed(2)),
              status,
              created_at: createdAt,
              reference: product.sku || product.id
            } as DummyOrder;
          });

        setOrders(dummyOrders);
      } catch (e) {
        console.error('Failed to build dummy orders from products', e);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndBuildDummyOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--brand-soft-gray)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl p-6 sm:p-8 mb-8 bg-gradient-to-r from-[var(--brand-fresh-blue)]/40 via-[var(--brand-light-blue)]/30 to-[var(--brand-pure-white)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--brand-trust-navy)]">Orders</h1>
              <p className="text-[var(--muted-foreground)] mt-2">View and manage customer orders</p>
            </div>
            <Button onClick={handleExportOrdersCSV} className="bg-[var(--brand-fresh-green)] hover:bg-[var(--brand-fresh-green)]/90 text-white">
              <Download className="h-5 w-5" />
              Export Orders
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-[var(--brand-fresh-blue)]/20 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-[var(--brand-deep-blue)]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No dummy orders</h3>
              <p className="text-muted-foreground">Create some products to generate prototype orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (ZAR)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        <div className="text-xs text-gray-500">Ref: {order.reference}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.customer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.items_count}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{formatZAR(order.total_amount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ` +
                            (order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                             order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                             order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                             order.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                             'bg-red-100 text-red-800')
                          }
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }}
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order Management</h3>
            <p className="text-gray-500 mb-4">
              This page will contain comprehensive order management features:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
              <li>• View all orders with detailed information</li>
              <li>• Update order status and tracking</li>
              <li>• Process refunds and returns</li>
              <li>• Print order receipts and invoices</li>
              <li>• Export orders to CSV/PDF</li>
              <li>• Advanced filtering and search</li>
              <li>• Order analytics and reporting</li>
            </ul>
          </div>
        </div>
        {isDetailsOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setIsDetailsOpen(false)} />
            <div className="relative bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200 bg-[#F8F9FA] rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Order {selectedOrder.id}</h3>
                    <p className="text-sm text-gray-600">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => setIsDetailsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer</h4>
                    <p className="text-gray-900">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-gray-500">Reference: {selectedOrder.reference}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Summary</h4>
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ` +
                          (selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                           selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                           selectedOrder.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                           selectedOrder.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                           'bg-red-100 text-red-800')
                        }
                      >
                        {selectedOrder.status}
                      </span>
                      <span className="text-gray-900 font-semibold">{formatZAR(selectedOrder.total_amount)}</span>
                      <span className="text-gray-500 text-sm">• {selectedOrder.items_count} items</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-white rounded-xl border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <h4 className="text-sm font-semibold text-gray-700">Items</h4>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-gray-900">Product {selectedOrder.reference}</p>
                        <p className="text-sm text-gray-500">Qty: {selectedOrder.items_count}</p>
                      </div>
                      <div className="text-gray-900 font-semibold">{formatZAR(selectedOrder.total_amount)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-[#F8F9FA] border-t border-gray-200 rounded-b-2xl flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => selectedOrder && handlePrintInvoice(selectedOrder)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}