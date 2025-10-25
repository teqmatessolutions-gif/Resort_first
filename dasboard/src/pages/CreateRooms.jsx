import React, { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import BannerMessage from "../components/BannerMessage";
import API from "../services/api";
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

// KPI Card for quick stats
const KpiCard = ({ title, value, icon, color }) => (
  <div className={`p-6 rounded-2xl text-white shadow-lg flex items-center justify-between transition-transform duration-300 transform hover:scale-105 ${color}`}>
    <div>
      <h4 className="text-lg font-medium">{title}</h4>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
    <div className="text-4xl opacity-80">{icon}</div>
  </div>
);

// Booking Modal for displaying booking data in table format
const BookingModal = ({ onClose, roomNumber, bookings, filter, setFilter }) => {
  // Apply status filter to bookings
  const filteredBookings = filter === "all" 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg relative max-w-4xl w-full m-4 max-h-[80vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold z-10"
        >
          &times;
        </button>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">
            Booking History for Room {roomNumber}
          </h3>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
            >
              <option value="all">All</option>
              <option value="booked">Booked</option>
              <option value="checked-in">Checked In</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {filteredBookings.length > 0 ? (
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Booking ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Guest Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Check-in</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Check-out</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Guests</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Mobile</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <tr key={booking.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2">{booking.id}</td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{booking.guest_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{booking.check_in}</td>
                    <td className="border border-gray-300 px-4 py-2">{booking.check_out}</td>
                    <td className="border border-gray-300 px-4 py-2">{booking.adults}A, {booking.children}C</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status || 'Pending'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{booking.guest_mobile}</td>
                    <td className="border border-gray-300 px-4 py-2">{booking.guest_email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-lg font-medium">No {filter !== 'all' ? filter : ''} bookings found for Room {roomNumber}</p>
            <p className="text-sm mt-2">Try changing the filter or this room has no booking history</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Image Modal for viewing full room image
const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="relative max-w-3xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-3xl font-bold hover:text-gray-300"
        >
          &times;
        </button>
        <img
          src={`https://www.teqmates.com${imageUrl}`}
          alt="Room"
          className="w-full h-auto rounded-2xl shadow-lg"
        />
      </div>
    </div>
  );
};

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    number: "",
    type: "",
    price: "",
    status: "Available",
    adults: 2,
    children: 0,
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [bannerMessage, setBannerMessage] = useState({ type: null, text: "" });
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editRoomId, setEditRoomId] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ type: "all", status: "all" });
  const [bookingFilter, setBookingFilter] = useState("booked"); // Filter for booking modal

  // Function to show banner message
  const showBannerMessage = (type, text) => {
    setBannerMessage({ type, text });
  };

  const closeBannerMessage = () => {
    setBannerMessage({ type: null, text: "" });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms/test?skip=0&limit=20");
      const dataWithTrend = res.data.map((r) => ({
        ...r,
        trend:
          r.trend ||
          Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000)),
      }));
      setRooms(dataWithTrend || []);
      setHasMore(res.data.length === 20);
      setPage(1);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      showBannerMessage("error", "Error fetching rooms");
    }
  };

  const loadMoreRooms = async () => {
    if (isFetchingMore || !hasMore) return; // Prevent multiple fetches
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const res = await API.get(`/rooms?skip=${(nextPage - 1) * 20}&limit=20`);
      const newRooms = res.data || [];
      const dataWithTrend = newRooms.map((r) => ({ ...r, trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000)) }));
      setRooms(prev => [...prev, ...dataWithTrend]);
      setPage(nextPage);
      setHasMore(newRooms.length === 20);
    } catch (err) {
      console.error("Failed to load more rooms:", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const fetchBookings = async (roomNumber) => {
    try {
      // Get all bookings and filter by room number
      const response = await API.get("/bookings?limit=1000");
      const allBookings = response.data.bookings || [];
      
      // Filter bookings that include this room (all statuses)
      const roomBookings = allBookings.filter(booking => {
        const hasRoom = booking.rooms && booking.rooms.some(room => room.number === roomNumber);
        return hasRoom;
      });
      
      setBookings(roomBookings);
      setSelectedRoomNumber(roomNumber);
      setBookingFilter("booked"); // Reset to default filter
      setShowBookingModal(true);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings.");
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("status", newStatus);

      await API.put(`/rooms/${roomId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showBannerMessage("success", `Room status updated to ${newStatus}!`);
      fetchRooms();
    } catch (err) {
      console.error("PUT /rooms error:", err);
      showBannerMessage("error", "Error updating room status");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          showBannerMessage("error", "Image file is too large. Please select an image smaller than 5MB.");
          return;
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          showBannerMessage("error", "Please select a valid image file (JPEG, PNG, or WebP).");
          return;
        }
      }
      setForm((prev) => ({ ...prev, image: file }));
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("number", form.number);
    formData.append("type", form.type);
    formData.append("price", form.price);
    formData.append("status", form.status);
    formData.append("adults", form.adults);
    formData.append("children", form.children);
    if (form.image) formData.append("image", form.image);

    try {
      if (isEditing) {
        await API.put(`/rooms/${editRoomId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showBannerMessage("success", "Room updated successfully!");
        setIsEditing(false);
        setEditRoomId(null);
      } else {
        // Use the working test endpoint for room creation
        const formData = new FormData();
        formData.append("number", form.number);
        formData.append("type", form.type);
        formData.append("price", form.price);
        formData.append("status", form.status);
        formData.append("adults", form.adults);
        formData.append("children", form.children);
        if (form.image) formData.append("image", form.image);

        await API.post("/rooms/test", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showBannerMessage("success", "Room created successfully!");
      }

      setForm({
        number: "",
        type: "",
        price: "",
        status: "Available",
        adults: 2,
        children: 0,
        image: null,
      });
      setPreviewImage(null);
      fetchRooms();
    } catch (err) {
      console.error("API error:", err);
      showBannerMessage("error", `Error ${isEditing ? "updating" : "creating"} room`);
    }
  };

  const handleEdit = (room) => {
    setIsEditing(true);
    setEditRoomId(room.id);
    setForm({
      number: room.number,
      type: room.type,
      price: room.price,
      status: room.status,
      adults: room.adults,
      children: room.children,
      image: null,
    });
    setPreviewImage(room.image_url ? `https://www.teqmates.com${room.image_url}` : null);
    setBannerMessage({ type: null, text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      try {
        await API.delete(`/rooms/test/${roomId}`);
        showBannerMessage("success", "Room deleted successfully!");
        fetchRooms();
      } catch (error) {
        console.error("Error deleting room:", error);
        showBannerMessage("error", "Error deleting room");
      }
    }
  };

  // Calculate KPIs
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'Booked').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const typeMatch = filter.type === 'all' || room.type === filter.type;
    const statusMatch = filter.status === 'all' || room.status === filter.status;
    return typeMatch && statusMatch;
  });

  return (
    <DashboardLayout>
      <BannerMessage 
        message={bannerMessage} 
        onClose={closeBannerMessage}
        autoDismiss={true}
        duration={5000}
      />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Room Management</h1>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <KpiCard title="Total Rooms" value={totalRooms} color="bg-gradient-to-r from-blue-500 to-blue-700" icon={<i className="fas fa-door-closed"></i>} />
        <KpiCard title="Available" value={availableRooms} color="bg-gradient-to-r from-green-500 to-green-700" icon={<i className="fas fa-check-circle"></i>} />
        <KpiCard title="Occupied" value={occupiedRooms} color="bg-gradient-to-r from-red-500 to-red-700" icon={<i className="fas fa-bed"></i>} />
        <KpiCard title="Maintenance" value={maintenanceRooms} color="bg-gradient-to-r from-yellow-500 to-yellow-600" icon={<i className="fas fa-tools"></i>} />
        <KpiCard title="Occupancy Rate" value={`${occupancyRate}%`} color="bg-gradient-to-r from-purple-500 to-purple-700" icon={<i className="fas fa-chart-pie"></i>} />
      </div>

      {/* Room Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg mb-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditing ? "Edit Room" : "Add New Room"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <input
              type="text"
              name="number"
              placeholder="e.g., 101"
              value={form.number}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
              required
              disabled={isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
            <input
              type="text"
              name="type"
              placeholder="e.g., Deluxe"
              value={form.type}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input
              type="number"
              name="price"
              placeholder="e.g., 5000"
              value={form.price}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adults Capacity</label>
            <input
              type="number"
              name="adults"
              placeholder="e.g., 2"
              value={form.adults}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Children Capacity</label>
            <input
              type="number"
              name="children"
              placeholder="e.g., 1"
              value={form.children}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
            >
              <option>Available</option>
              <option>Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Image</label>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPEG, PNG, WebP</p>
          </div>

          {/* Show preview if image selected */}
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
            />
          )}
        <div className="md:col-span-2 lg:col-span-3 flex items-center gap-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:-translate-y-1"
          >
            {isEditing ? "Update Room" : "Add Room"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditRoomId(null);
                setForm({
                  number: "",
                  type: "",
                  price: "",
                  status: "Available",
                  adults: 2,
                  children: 0,
                  image: null,
                });
                setPreviewImage(null);
                setBannerMessage({ type: null, text: "" });
              }}
              className="w-full bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
        </div>
      </form>

      {/* Rooms Grid */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Rooms</h2>
          <div className="flex flex-wrap gap-4">
            <select onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))} className="p-2 border border-gray-300 rounded-lg">
              <option value="all">All Types</option>
              {[...new Set(rooms.map(r => r.type))].map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))} className="p-2 border border-gray-300 rounded-lg">
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <motion.div key={room.id} className="bg-gray-50 rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col" whileHover={{ y: -5 }}>
              <div className="relative">
                <img
                  src={room.image_url ? `https://www.teqmates.com${room.image_url}` : 'https://placehold.co/400x300/e2e8f0/a0aec0?text=No+Image'}
                  alt={`Room ${room.number}`}
                  className="h-48 w-full object-cover cursor-pointer"
                  onClick={() => setSelectedImage(room.image_url)}
                />
                <span className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold text-white rounded-full ${
                  room.status === 'Available' ? 'bg-green-500' : room.status === 'Booked' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>{room.status}</span>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">Room {room.number}</h4>
                    <p className="text-sm text-gray-500">{room.type}</p>
                  </div>
                  <p className="text-indigo-600 font-bold text-xl">₹{room.price}</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">Capacity: {room.adults} Adults, {room.children} Children</p>
                <div className="h-16 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(room.trend || []).map((v, i) => ({ day: i + 1, value: v }))}>
                      <RechartsTooltip contentStyle={{ fontSize: '12px', padding: '2px 5px' }} />
                      <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col gap-2">
                  <div className="flex justify-between gap-2">
                    <button onClick={() => handleEdit(room)} className="w-1/2 bg-green-100 text-green-700 text-sm font-semibold py-2 rounded-lg hover:bg-green-200 transition">Edit</button>
                    <button onClick={() => handleDelete(room.id)} className="w-1/2 bg-red-100 text-red-700 text-sm font-semibold py-2 rounded-lg hover:bg-red-200 transition">Delete</button>
                  </div>
                  <button onClick={() => fetchBookings(room.number)} className="w-full bg-blue-100 text-blue-700 text-sm font-semibold py-2 rounded-lg hover:bg-blue-200 transition">View Bookings</button>
                  {room.status !== "Booked" && (
                    <select
                      value={room.status}
                      onChange={(e) => handleStatusChange(room.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="Available">Set Available</option>
                      <option value="Maintenance">Set Maintenance</option>
                    </select>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {filteredRooms.length === 0 && (
            <p className="col-span-full text-center py-10 text-gray-500">No rooms match the current filters.</p>
          )}
          {hasMore && (
            <div className="col-span-full text-center mt-4">
              <button
                onClick={loadMoreRooms}
                disabled={isFetchingMore}
                className="bg-indigo-100 text-indigo-700 font-semibold px-6 py-2 rounded-lg hover:bg-indigo-200 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
              >
                {isFetchingMore ? "Loading..." : "Load More Rooms"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Data Modal */}
      {showBookingModal && (
        <BookingModal
          onClose={() => setShowBookingModal(false)}
          roomNumber={selectedRoomNumber}
          bookings={bookings}
          filter={bookingFilter}
          setFilter={setBookingFilter}
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default Rooms;
