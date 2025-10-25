import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../layout/DashboardLayout";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from "recharts";

// Import the new bubble animation CSS
import "../styles/bubble-animation.css"; 

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A78BFA", "#F43F5E", "#10B981", "#60A5FA", "#FBBF24"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [foodOrders, setFoodOrders] = useState([]);
  const [assignedServices, setAssignedServices] = useState([]);
  const [billings, setBillings] = useState([]);
  const [packages, setPackages] = useState([]);

  // ---------- Fetch Data ----------
  useEffect(() => {
    // ... (rest of the fetch logic, which is already correct)
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [
          bookingsRes,
          roomsRes,
          expensesRes,
          foodOrdersRes,
          assignedServicesRes,
          billingsRes,
          packagesRes,
        ] = await Promise.all([
          API.get("/bookings"),
          API.get("/rooms"),
          API.get("/expenses"),
          API.get("/food-orders"),
          API.get("/services/assigned"),
          API.get("/bill/checkouts"),
          API.get("/packages"),
        ]);

        if (!mounted) return;
        setBookings(Array.isArray(bookingsRes.data.bookings) ? bookingsRes.data.bookings : []);
        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);
        setFoodOrders(Array.isArray(foodOrdersRes.data) ? foodOrdersRes.data : []);
        setAssignedServices(Array.isArray(assignedServicesRes.data) ? assignedServicesRes.data : []);
        setBillings(Array.isArray(billingsRes.data) ? billingsRes.data : []);
        setPackages(Array.isArray(packagesRes.data) ? packagesRes.data : []);
      } catch (e) {
        setErr(e?.response?.data?.detail || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ... (rest of the useMemo and helper functions)
  const safeDate = (d) => (d ? new Date(d) : null);
  const fmtCurrency = (n) => `₹ ${Number(n || 0).toLocaleString()}`;
  const roomCounts = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter(r => (r.status || r.current_status || "").toLowerCase().includes("booked")).length;
    const available = rooms.filter(r => (r.status || "").toLowerCase().includes("avail")).length || Math.max(total - occupied, 0);
    const maintenance = total - occupied - available;
    return { total, occupied, available, maintenance: Math.max(maintenance, 0) };
  }, [rooms]);
  const revenue = useMemo(() => {
    const total = billings.reduce((s, b) => s + Number(b.grand_total || 0), 0);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    let today = 0, month = 0;
    billings.forEach(b => {
      const d = safeDate(b.created_at);
      if (!d) return;
      const ds = d.toISOString().slice(0, 10);
      if (ds === todayStr) today += Number(b.grand_total || 0);
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (mk === thisMonthKey) month += Number(b.grand_total || 0);
    });
    return { total, today, month };
  }, [billings]);
  const expenseAgg = useMemo(() => {
    const total = expenses.reduce((s, e) => s + Number(e.amount || e.charges || 0), 0);
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    let month = 0;
    expenses.forEach(e => {
      const d = safeDate(e.created_at);
      if (!d) return;
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (mk === thisMonthKey) month += Number(e.amount || e.charges || 0);
    });
    return { total, month };
  }, [expenses]);
  const bookingCounts = useMemo(() => {
    const total = bookings.length;
    const cancelled = bookings.filter(b => (b.status || "").toLowerCase().includes("cancel")).length;
    const active = total - cancelled;
    return { total, active, cancelled };
  }, [bookings]);
  const revenueSeries = useMemo(() => {
    const map = new Map();
    billings.forEach(b => {
      const d = safeDate(b.created_at);
      if (!d) return;
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + Number(b.grand_total || 0));
    });
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      arr.push({ date: key.slice(5), revenue: map.get(key) || 0 });
    }
    return arr;
  }, [billings]);
  const expensesByType = useMemo(() => {
    const map = new Map();
    expenses.forEach(e => {
      const k = (e.type || e.category || "Other");
      map.set(k, (map.get(k) || 0) + Number(e.amount || e.charges || 0));
    });
    return Array.from(map, ([type, amount]) => ({ type, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [expenses]);
  const paymentMethodPie = useMemo(() => {
    const map = new Map();
    billings.forEach(b => {
      const k = (b.payment_method || "other").replace("_", " ").toUpperCase();
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [billings]);
  const foodTypePie = useMemo(() => {
    const map = new Map();
    foodOrders.forEach(o => {
      const k = (o.type || o.category || "Other");
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [foodOrders]);
  const occupancyDonut = useMemo(() => ([
    { name: "Occupied", value: roomCounts.occupied },
    { name: "Available", value: roomCounts.available },
    { name: "Maintenance", value: roomCounts.maintenance },
  ]), [roomCounts]);
  const servicesStatus = useMemo(() => {
    const map = new Map();
    assignedServices.forEach(s => {
      const k = (s.status || s.assigned_status || "pending").toUpperCase();
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [assignedServices]);
  const packagesByBookings = useMemo(() => {
    const pkgMap = new Map(packages.map(p => [p.id, p.title]));
    const bookingCounts = bookings.reduce((acc, booking) => {
      const pkgId = booking.package?.id || booking.package_id;
      const pkgTitle = pkgMap.get(pkgId) || "Unknown";
      acc[pkgTitle] = (acc[pkgTitle] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(bookingCounts).map(([name, count]) => ({ name, count }));
  }, [bookings, packages]);
  const latestBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.created_at || b.check_in) - new Date(a.created_at || a.check_in))
      .slice(0, 10);
  }, [bookings]);
  const latestBillings = useMemo(() => {
    return [...billings]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8);
  }, [billings]);
  const latestFood = useMemo(() => {
    return [...foodOrders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8);
  }, [foodOrders]);
  const latestPackages = useMemo(() => {
    return [...packages]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8);
  }, [packages]);

  // ---------- UI ----------
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-56" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (err) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
            {err}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* The new bubble animation background container */}
      <div className="bubbles-container">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Resort Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-500">Overview of bookings, rooms, revenue, expenses & operations</p>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4">
          <KPICard label="Total Revenue" value={fmtCurrency(revenue.total)} sub="All time" />
          <KPICard label="Today Revenue" value={fmtCurrency(revenue.today)} sub="Today" />
          <KPICard label="This Month Revenue" value={fmtCurrency(revenue.month)} sub="Month" />
          <KPICard label="Total Expenses" value={fmtCurrency(expenseAgg.total)} sub="All time" />
          <KPICard label="Bookings (Active)" value={`${bookingCounts.active}`} sub={`Cancelled: ${bookingCounts.cancelled}`} />
          <KPICard label="Total Packages" value={packages.length} sub="All time" />
          <KPICard label="Rooms" value={`${roomCounts.occupied}/${roomCounts.total}`} sub="Occupied / Total" />
        </section>

        {/* Charts Row 1 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <Card title="Revenue (Last 14 days)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#6366F1" fillOpacity={1} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Payment Methods">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodPie} dataKey="value" nameKey="name" outerRadius={90} label>
                    {paymentMethodPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Room Occupancy">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={occupancyDonut} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
                    {occupancyDonut.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Charts Row 2 */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card title="Expenses by Type (Top 6)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expensesByType} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#22C55E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Food Orders by Type">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={foodTypePie} dataKey="value" nameKey="name" outerRadius={90} label>
                    {foodTypePie.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Service Requests Status">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={servicesStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                    {servicesStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 6) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Charts Row 3 (New) */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title="Packages by Booking">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packagesByBookings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#A78BFA" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Tables */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title="Latest Bookings">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <Th>Guest</Th>
                    <Th>Room</Th>
                    <Th>Check-in</Th>
                    <Th>Check-out</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {latestBookings.map((b) => (
                    <tr key={b.id} className="border-t hover:bg-gray-50">
                      <Td>{b.guest_name || b.guest || "-"}</Td>
                      <Td>{b.room?.number ? `#${b.room.number} (${b.room?.type || "-"})` : (b.room_number || "-")}</Td>
                      <Td>{b.check_in}</Td>
                      <Td>{b.check_out}</Td>
                      <Td>
                        <span className={`px-2 py-1 text-xs rounded font-semibold ${
                          String(b.status || "").toLowerCase().includes("cancel")
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-700"
                          }`}>
                          {b.status}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Recent Payments (Billing)">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <Th>Guest</Th>
                    <Th>Room</Th>
                    <Th>Method</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Grand Total</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {latestBillings.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-gray-50">
                      <Td>{c.guest_name || "-"}</Td>
                      <Td>{c.room_number || "-"}</Td>
                      <Td className="capitalize">{String(c.payment_method || "").replace("_", " ")}</Td>
                      <Td className="uppercase">
                        <span className={`px-2 py-1 text-xs rounded font-semibold ${
                          String(c.payment_status || "").toLowerCase() === "paid"
                            ? "bg-green-100 text-green-700"
                            : String(c.payment_status || "").toLowerCase() === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                          {c.payment_status}
                        </span>
                      </Td>
                      <Td className="text-right font-medium">{fmtCurrency(c.grand_total)}</Td>
                      <Td>{safeDate(c.created_at)?.toLocaleString() || "-"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
        
        {/* New tables section */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title="Latest Packages">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <Th>Title</Th>
                    <Th>Price</Th>
                    <Th>Images</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {latestPackages.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <Td>{p.title || "-"}</Td>
                      <Td>{fmtCurrency(p.price)}</Td>
                      <Td>{p.images?.length || 0}</Td>
                      <Td>{safeDate(p.created_at)?.toLocaleString() || "-"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <Card title="Recent Food Orders">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <Th>Type</Th>
                    <Th>Items</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Amount</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {latestFood.map((o, idx) => (
                    <tr key={o.id || idx} className="border-t hover:bg-gray-50">
                      <Td>{o.type || o.category || "-"}</Td>
                      <Td>{Array.isArray(o.items) ? o.items.length : (o.quantity || "-")}</Td>
                      <Td>
                        <span className={`px-2 py-1 text-xs rounded font-semibold ${
                          String(o.status || "").toLowerCase().includes("cancel")
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-700"
                          }`}>
                          {o.status || "NEW"}
                        </span>
                      </Td>
                      <Td className="text-right">{fmtCurrency(o.amount || o.total || 0)}</Td>
                      <Td>{safeDate(o.created_at)?.toLocaleString() || "-"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title="Quick Expense Peek">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <Th>Type</Th>
                    <Th>Note</Th>
                    <Th className="text-right">Amount</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {[...expenses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8).map((e, i) => (
                    <tr key={e.id || i} className="border-t hover:bg-gray-50">
                      <Td>{e.type || e.category || "-"}</Td>
                      <Td className="truncate max-w-[260px]" title={e.note || e.description || ""}>
                        {e.note || e.description || "-"}
                      </Td>
                      <Td className="text-right">{fmtCurrency(e.amount || e.charges || 0)}</Td>
                      <Td>{safeDate(e.created_at)?.toLocaleString() || "-"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
};

/* ---------- Small UI bits ---------- */
const KPICard = ({ label, value, sub }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
    <div className="text-xs uppercase tracking-wide text-gray-500 truncate">{label}</div>
    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1 truncate">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1 truncate">{sub}</div>}
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">{title}</h2>
    {children}
  </div>
);

const Th = ({ children, className = "" }) => (
  <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>
);
const Td = ({ children, className = "" }) => (
  <td className={`px-3 py-2 ${className}`}>{children}</td>
);

export default Dashboard;