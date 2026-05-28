import { supabase } from "@/lib/supabaseClient";

async function getPayments() {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message);
    }
    console.log("Payments loaded:", data?.length);
    return data || [];
  } catch (err) {
    console.error("Failed to fetch payments:", err);
    return [];
  }
}

export default async function AdminPaymentsPage() {
  const payments = await getPayments();

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const successfulAmount = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payment Transactions</h1>
          <p className="text-gray-500">Track all payments made through AzamPay</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-primary">{payments.length}</div>
          <div className="text-gray-500 text-sm">Total Transactions</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{payments.filter(p => p.status === 'success').length}</div>
          <div className="text-gray-500 text-sm">Successful Payments</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">TZS {successfulAmount.toLocaleString()}</div>
          <div className="text-gray-500 text-sm">Total Revenue</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by external ID or phone number..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            id="payment-search"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">External ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Phone Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount (TZS)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Transaction ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">{payment.external_id}</td>
                  <td className="px-6 py-4 text-sm">{payment.phone_number || '—'}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {payment.amount?.toLocaleString() || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${payment.status === 'success' ? 'bg-green-100 text-green-700' : ''}
                      ${payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${payment.status === 'failed' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {payment.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    {payment.azampay_transaction_id || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {payment.created_at ? new Date(payment.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payments.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-700">No payments yet</h3>
          <p className="text-gray-500 mt-2">When customers make payments, they'll appear here.</p>
        </div>
      )}

      <script
        dangerouslySetInnerHTML={{
          __html: `
            const searchInput = document.getElementById('payment-search');
            if (searchInput) {
              searchInput.addEventListener('keyup', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('tbody tr');
                rows.forEach(row => {
                  const text = row.textContent.toLowerCase();
                  if (text.includes(searchTerm)) {
                    row.style.display = '';
                  } else {
                    row.style.display = 'none';
                  }
                });
              });
            }
          `,
        }}
      />
    </div>
  );
}