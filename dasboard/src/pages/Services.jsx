import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { Loader2 } from "lucide-react";

// Reusable card component for a consistent look
const Card = ({ title, className = "", children }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

const COLORS = ["#4F46E5", "#6366F1", "#A78BFA", "#F472B6"];

const Services = () => {
  const [services, setServices] = useState([]);
  const [assignedServices, setAssignedServices] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", charges: "" });
  const [assignForm, setAssignForm] = useState({
    service_id: "",
    employee_id: "",
    room_id: "",
    status: "pending",
  });
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    room: "",
    employee: "",
    status: "",
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Fetch all data
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, aRes, rRes, eRes] = await Promise.all([
        api.get("/services?limit=1000"),
        api.get("/services/assigned?skip=0&limit=20"),
        api.get("/rooms?limit=1000"),
        api.get("/employees"),
      ]);
      setServices(sRes.data);
      setAssignedServices(aRes.data);
      setRooms(rRes.data);
      setEmployees(eRes.data);
    } catch (error) {
      setHasMore(aRes.data.length === 10);
      setPage(1);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const loadMoreAssigned = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    const nextPage = page + 1;
    try {
      const res = await api.get(`/services/assigned?skip=${(nextPage - 1) * 20}&limit=20`);
      const newAssigned = res.data || [];
      setAssignedServices(prev => [...prev, ...newAssigned]);
      setPage(nextPage);
      setHasMore(newAssigned.length === 20);
    } catch (err) {
      console.error("Failed to load more assigned services:", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Create service
  const handleCreate = async () => {
    if (!form.name || !form.description || !form.charges) {
      alert("All fields are required");
      return;
    }
    try {
      await api.post("/services", {
        name: form.name,
        description: form.description,
        charges: parseFloat(form.charges),
      });
      setForm({ name: "", description: "", charges: "" });
      fetchAll();
    } catch (err) {
      console.error("Failed to create service", err);
    }
  };

  // Assign service
  const handleAssign = async () => {
    if (!assignForm.service_id || !assignForm.employee_id || !assignForm.room_id) {
      alert("Please select service, employee, and room");
      return;
    }
    try {
      await api.post("/services/assign", {
        ...assignForm,
        service_id: parseInt(assignForm.service_id),
        employee_id: parseInt(assignForm.employee_id),
        room_id: parseInt(assignForm.room_id),
      });
      setAssignForm({ service_id: "", employee_id: "", room_id: "", status: "pending" });
      fetchAll();
    } catch (err) {
      console.error("Failed to assign service", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/services/assigned/${id}`, { status: newStatus });
      fetchAll();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const filteredAssigned = assignedServices.filter((s) => {
    const assignedDate = new Date(s.assigned_at);
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;
    return (
      (!filters.room || s.room_id === parseInt(filters.room)) &&
      (!filters.employee || s.employee_id === parseInt(filters.employee)) &&
      (!filters.status || s.status === filters.status) &&
      (!fromDate || assignedDate >= fromDate) &&
      (!toDate || assignedDate <= toDate)
    );
  });

  // KPI Data
  const totalServices = services.length;
  const totalAssigned = assignedServices.length;
  const completedCount = assignedServices.filter(s => s.status === "completed").length;
  const pendingCount = assignedServices.filter(s => s.status === "pending").length;

  // Pie chart for status
  const pieData = [
    { name: "Pending", value: pendingCount },
    { name: "Completed", value: completedCount },
    { name: "In Progress", value: totalAssigned - pendingCount - completedCount },
  ];

  // Bar chart for service assignments
  const barData = services.map(s => ({
    name: s.name,
    assigned: assignedServices.filter(a => a.service_id === s.id).length,
  }));

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Service Management Dashboard</h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <p className="text-sm opacity-80">Total Services</p>
            <p className="text-3xl font-bold">{totalServices}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <p className="text-sm opacity-80">Total Assigned</p>
            <p className="text-3xl font-bold">{totalAssigned}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <p className="text-sm opacity-80">Pending</p>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <p className="text-sm opacity-80">Completed</p>
            <p className="text-3xl font-bold">{completedCount}</p>
          </div>
        </div>

        {/* Create & Assign Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Service */}
          <Card title="Create New Service">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Service Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="number"
                placeholder="Charges"
                value={form.charges}
                onChange={(e) => setForm({ ...form, charges: e.target.value })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={handleCreate}
                className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg shadow-lg font-semibold"
              >
                Create Service
              </button>
            </div>
          </Card>

          {/* Assign Service */}
          <Card title="Assign Service">
            <div className="space-y-3">
              <select
                value={assignForm.service_id}
                onChange={(e) => setAssignForm({ ...assignForm, service_id: e.target.value })}
                className="w-full border p-3 rounded-lg"
              >
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={assignForm.employee_id}
                onChange={(e) => setAssignForm({ ...assignForm, employee_id: e.target.value })}
                className="w-full border p-3 rounded-lg"
              >
                <option value="">Select Employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <select
                value={assignForm.room_id}
                onChange={(e) => setAssignForm({ ...assignForm, room_id: e.target.value })}
                className="w-full border p-3 rounded-lg"
              >
                <option value="">Select Room</option>
                {rooms.filter(r => ['Booked', 'Checked-in'].includes(r.status)).map((r) => (
                  <option key={r.id} value={r.id}>Room {r.number}</option>
                ))}
              </select>
              <select
                value={assignForm.status}
                onChange={(e) => setAssignForm({ ...assignForm, status: e.target.value })}
                className="w-full border p-3 rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button
                onClick={handleAssign}
                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg shadow-lg font-semibold"
              >
                Assign Service
              </button>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Service Status Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Service Assignments">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="assigned" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* View All Services Table */}
        <Card title="All Services">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 size={48} className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-left">Service Name</th>
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-right">Charges ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, idx) => (
                    <tr key={s.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}>
                      <td className="py-3 px-4">{s.name}</td>
                      <td className="py-3 px-4">{s.description}</td>
                      <td className="py-3 px-4 text-right">{s.charges}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hasMore && (
                <div className="text-center mt-4">
                  <button
                    onClick={loadMoreAssigned}
                    disabled={isFetchingMore}
                    className="bg-indigo-100 text-indigo-700 font-semibold px-6 py-2 rounded-lg hover:bg-indigo-200 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    {isFetchingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Filters & Assigned Services Table */}
        <Card title="Assigned Services">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <select value={filters.room} onChange={(e) => setFilters({ ...filters, room: e.target.value })} className="border p-2 rounded-lg">
              <option value="">All Rooms</option>
              {rooms.map((r) => (<option key={r.id} value={r.id}>Room {r.number}</option>))}
            </select>
            <select value={filters.employee} onChange={(e) => setFilters({ ...filters, employee: e.target.value })} className="border p-2 rounded-lg">
              <option value="">All Employees</option>
              {employees.map((e) => (<option key={e.id} value={e.id}>{e.name}</option>))}
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border p-2 rounded-lg">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="border p-2 rounded-lg"/>
            <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="border p-2 rounded-lg"/>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 size={48} className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-left">Service</th>
                    <th className="py-3 px-4 text-left">Employee</th>
                    <th className="py-3 px-4 text-left">Room</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Assigned At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssigned.map((s, idx) => (
                    <tr key={s.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}>
                      <td className="p-3 border-t border-gray-200">{s.service?.name}</td>
                      <td className="p-3 border-t border-gray-200">{s.employee?.name}</td>
                      <td className="p-3 border-t border-gray-200">Room {s.room?.number}</td>
                      <td className="p-3 border-t border-gray-200">
                        <select value={s.status} onChange={(e) => handleStatusChange(s.id, e.target.value)} className="border p-2 rounded-lg bg-white">
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-3 border-t border-gray-200">{s.assigned_at && new Date(s.assigned_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Services;
