import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { Pie } from "react-chartjs-2";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import BannerMessage from "../components/BannerMessage";

ChartJS.register(ArcElement, Tooltip, Legend);

// Reusable components (for better structure)
const KPI_Card = ({ title, value, unit = "", duration = 1.5 }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center transition-transform duration-200 cursor-pointer"
  >
    <span className="text-gray-500 font-medium text-sm sm:text-base">{title}</span>
    <CountUp
      end={value}
      duration={duration}
      separator=","
      className="text-3xl font-extrabold mt-2 text-indigo-700"
      suffix={unit}
    />
  </motion.div>
);

const BookingStatusBadge = ({ status }) => {
  const statusClasses = {
    booked: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    "checked-in": "bg-blue-100 text-blue-700",
    "checked-out": "bg-gray-200 text-gray-700",
  };
  const badgeClass = statusClasses[status.toLowerCase()] || "bg-yellow-100 text-yellow-700";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeClass}`}
    >
      {status}
    </span>
  );
};

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60]">
      <div className="relative max-w-3xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute -top-8 right-0 text-white text-4xl font-bold hover:text-gray-300"
        >
          &times;
        </button>
        <img
          src={imageUrl}
          alt="Full size view"
          className="w-full h-auto rounded-2xl shadow-lg"
        />
      </div>
    </div>
  );
};
const BookingDetailsModal = ({ booking, onClose, onImageClick }) => {
  if (!booking) return null;

  const roomInfo = booking.rooms && booking.rooms.length > 0
    ? booking.rooms.map(room => `${room.number} (${room.type})`).join(", ")
    : "N/A";

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Booking Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 text-gray-700">
          <p><strong>Guest:</strong> {booking.guest_name}</p>
          <p><strong>Rooms:</strong> {roomInfo}</p>
          <p><strong>Check-in:</strong> {booking.check_in}</p>
          <p><strong>Check-out:</strong> {booking.check_out}</p>
          <p><strong>Mobile:</strong> {booking.guest_mobile}</p>
          <p><strong>Email:</strong> {booking.guest_email}</p>
          <p><strong>Guests:</strong> {booking.adults} Adults, {booking.children} Children</p>
          {booking.status === 'checked-in' && booking.user && (
            <p><strong>Checked-in By:</strong> {booking.user.name}</p>
          )}
          {(booking.id_card_image_url || booking.guest_photo_url) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Check-in Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {booking.id_card_image_url && (
                    (() => {
                        const imageUrl = `${API.defaults.baseURL.replace(/\/$/, '')}/${booking.is_package ? 'packages/booking/checkin-image' : 'bookings/checkin-image'}/${booking.id_card_image_url}`;
                        return (
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 mb-1">ID Card</p>
                                <img src={imageUrl} alt="ID Card" className="w-full h-auto rounded-lg border shadow-sm cursor-pointer" onClick={() => onImageClick(imageUrl)} />
                            </div>
                        );
                    })()
                )}
                {booking.guest_photo_url && (
                    (() => {
                        const imageUrl = `${API.defaults.baseURL.replace(/\/$/, '')}/${booking.is_package ? 'packages/booking/checkin-image' : 'bookings/checkin-image'}/${booking.guest_photo_url}`;
                        return (
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 mb-1">Guest Photo</p>
                                <img src={imageUrl} alt="Guest" className="w-full h-auto rounded-lg border shadow-sm cursor-pointer" onClick={() => onImageClick(imageUrl)} />
                            </div>
                        );
                    })()
                )}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

const ExtendBookingModal = ({ booking, onSave, onClose, feedback, isSubmitting }) => {
  const [newCheckout, setNewCheckout] = useState(booking.check_out);
  const minDate = booking.check_out;

  const handleSave = () => {
    onSave(booking.id, newCheckout);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Extend Booking</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 text-gray-700">
          <p><strong>Current Check-in:</strong> {booking.check_in}</p>
          <p><strong>Current Check-out:</strong> {booking.check_out}</p>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">New Check-out Date</label>
            <input
              type="date"
              value={newCheckout}
              onChange={(e) => setNewCheckout(e.target.value)}
              min={minDate}
              className="w-full border-gray-300 rounded-lg shadow-sm p-2 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSubmitting || newCheckout <= minDate}
          className="mt-6 w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </motion.div>
    </div>
  );
};

const CheckInModal = ({ booking, onSave, onClose, feedback, isSubmitting }) => {
  const [idCardImage, setIdCardImage] = useState(null);
  const [guestPhoto, setGuestPhoto] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [guestPhotoPreview, setGuestPhotoPreview] = useState(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === 'id') {
      setIdCardImage(file);
      setIdCardPreview(previewUrl);
    } else {
      setGuestPhoto(file);
      setGuestPhotoPreview(previewUrl);
    }
  };

  const handleSave = () => {
    if (!idCardImage || !guestPhoto) {
      alert("Please upload both ID card and guest photo.");
      return;
    }
    onSave(booking.id, { id_card_image: idCardImage, guest_photo: guestPhoto });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Check-in Guest: {booking.guest_name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <label className="font-medium text-gray-700 mb-2">ID Card Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'id')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
            {idCardPreview && <img src={idCardPreview} alt="ID Preview" className="mt-4 w-full h-40 object-contain rounded-lg border" />}
          </div>
          <div className="flex flex-col items-center">
            <label className="font-medium text-gray-700 mb-2">Guest Photo</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'guest')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
            {guestPhotoPreview && <img src={guestPhotoPreview} alt="Guest Preview" className="mt-4 w-full h-40 object-contain rounded-lg border" />}
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 font-semibold py-2 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSubmitting || !idCardImage || !guestPhoto} className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400">
            {isSubmitting ? "Checking in..." : "Confirm Check-in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const BookingStatusChart = ({ data }) => {
  const chartData = useMemo(() => {
    const statusCounts = data.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            "rgba(79, 70, 229, 0.7)", // indigo
            "rgba(34, 197, 94, 0.7)", // green
            "rgba(239, 68, 68, 0.7)", // red
            "rgba(107, 114, 128, 0.7)", // gray
          ],
          borderColor: [
            "rgba(79, 70, 229, 1)",
            "rgba(34, 197, 94, 1)",
            "rgba(239, 68, 68, 1)",
            "rgba(107, 114, 128, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex-1">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Bookings by Status</h3>
      <div className="w-full h-64 flex items-center justify-center">
        <Pie data={chartData} />
      </div>
    </div>
  );
};

const Bookings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    guestName: "",
    guestMobile: "",
    guestEmail: "",
    roomTypes: [],
    roomNumbers: [],
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
  });
  const today = new Date().toISOString().split("T")[0];

  const [packages, setPackages] = useState([]);
  const [packageBookingForm, setPackageBookingForm] = useState({
    package_id: "",
    guest_name: "",
    guest_email: "",
    guest_mobile: "",
    check_in: "",
    check_out: "",
    adults: 2,
    children: 0,
    room_ids: []
  });
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [roomNumberFilter, setRoomNumberFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [bannerMessage, setBannerMessage] = useState({ type: null, text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to show banner message
  const showBannerMessage = (type, text) => {
    setBannerMessage({ type, text });
  };

  const closeBannerMessage = () => {
    setBannerMessage({ type: null, text: "" });
  };
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({
    activeBookings: 0,
    cancelledBookings: 0,
    availableRooms: 0,
    todaysGuestsCheckin: 0,
    todaysGuestsCheckout: 0,
  });
  const [modalBooking, setModalBooking] = useState(null);
  const [bookingToExtend, setBookingToExtend] = useState(null);
  const [bookingToCheckIn, setBookingToCheckIn] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [totalBookings, setTotalBookings] = useState(0);
  const [hasMoreBookings, setHasMoreBookings] = useState(true);

  const authHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }), []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const [roomsRes, bookingsRes, packageRes] = await Promise.all([
        API.get("/rooms/", authHeader()),
        API.get("/bookings?skip=0&limit=20&order_by=id&order=desc", authHeader()), // Order by latest first
        API.get("/packages/", authHeader()),
      ]);

      const allRooms = roomsRes.data;
      const { bookings: initialBookings, total } = bookingsRes.data;
      const todaysDate = new Date().toISOString().split("T")[0];

      // We need all bookings for accurate KPIs. This is a trade-off.
      const allBookingsRes = await API.get("/bookings?limit=10000&order_by=id&order=desc", authHeader()); // Fetch all for KPIs with ordering
      const allBookings = allBookingsRes.data.bookings;

      const activeBookingsCount = allBookings.filter(b => b.status === "booked" || b.status === "checked-in").length;
      const cancelledBookingsCount = allBookings.filter(b => b.status === "cancelled").length;
      const availableRoomsCount = allRooms.filter(r => r.status === "Available").length;
      const todaysGuestsCheckin = allBookings
        .filter(b => b.check_in === todaysDate)
        .reduce((sum, b) => sum + b.adults + b.children, 0);
      const todaysGuestsCheckout = allBookings
        .filter(b => b.check_out === todaysDate)
        .reduce((sum, b) => sum + b.adults + b.children, 0);


      setRooms(allRooms.filter((r) => r.status === "Available"));
      setBookings(initialBookings);
      setPackages(packageRes.data || []);
      setTotalBookings(total);
      setHasMoreBookings(initialBookings.length < total);
      setKpis({
        activeBookings: activeBookingsCount,
        cancelledBookings: cancelledBookingsCount,
        availableRooms: availableRoomsCount,
        todaysGuestsCheckin,
        todaysGuestsCheckout,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      showBannerMessage("error", "Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [authHeader, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadMoreBookings = async () => {
    if (!hasMoreBookings) return;
    setIsSubmitting(true);
    try {
      const response = await API.get(`/bookings?skip=${bookings.length}&limit=20&order_by=id&order=desc`, authHeader());
      const { bookings: newBookings, total } = response.data;
      setBookings(prev => [...prev, ...newBookings]);
      setHasMoreBookings(bookings.length + newBookings.length < total);
    } catch (err) {
      console.error("Failed to load more bookings:", err);
      showBannerMessage("error", "Could not load more bookings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadMoreRef = useInfiniteScroll(loadMoreBookings, hasMoreBookings, isSubmitting);

  const roomTypes = useMemo(() => {
    return [...new Set(rooms.map((r) => r.type))];
  }, [rooms]);

  const allRoomNumbers = useMemo(() => {
    const numbers = new Set();
    bookings.forEach(booking => {
      if (booking.rooms) {
        booking.rooms.forEach(room => numbers.add(room.number));
      }
    });
    return ["All", ...Array.from(numbers).sort()];
  }, [bookings]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => r.type === formData.roomTypes[0]);
  }, [rooms, formData.roomTypes]);

  const selectedRoomDetails = useMemo(() => {
    return formData.roomNumbers.map(roomNumber =>
      rooms.find(r => r.number === roomNumber && r.type === formData.roomTypes[0])
    ).filter(room => room !== null);
  }, [rooms, formData.roomNumbers, formData.roomTypes]);

  const totalGuests = useMemo(() => {
    return parseInt(formData.adults) + parseInt(formData.children);
  }, [formData.adults, formData.children]);

  const handlePackageBookingChange = e => setPackageBookingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePackageRoomSelect = roomId => {
    setPackageBookingForm(prev => ({
      ...prev,
      room_ids: prev.room_ids.includes(roomId)
        ? prev.room_ids.filter(id => id !== roomId)
        : [...prev.room_ids, roomId]
    }));
  };

  const handlePackageBookingSubmit = async e => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setFeedback({ message: "", type: "" });
    try {
      // --- MINIMUM BOOKING DURATION VALIDATION ---
      if (packageBookingForm.check_in && packageBookingForm.check_out) {
        const checkInDate = new Date(packageBookingForm.check_in);
        const checkOutDate = new Date(packageBookingForm.check_out);
        const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        if (daysDiff < 1) {
          showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
          setIsSubmitting(false);
          return;
        }
      }

      const bookingData = {
        ...packageBookingForm,
        package_id: parseInt(packageBookingForm.package_id),
        adults: parseInt(packageBookingForm.adults),
        children: parseInt(packageBookingForm.children),
        room_ids: packageBookingForm.room_ids.map(id => parseInt(id))
      };
      await API.post("/packages/book", bookingData, authHeader());
      showBannerMessage("success", "Package booked successfully!");
      setPackageBookingForm({ package_id: "", guest_name: "", guest_email: "", guest_mobile: "", check_in: "", check_out: "", adults: 2, children: 0, room_ids: [] });
      fetchData();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || "Failed to process package booking.";
      showBannerMessage("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCapacity = useMemo(() => {
    return selectedRoomDetails.reduce((sum, room) => sum + (room.adults + room.children), 0);
  }, [selectedRoomDetails]);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const statusMatch = statusFilter === "All" || b.status.toLowerCase() === statusFilter.toLowerCase();
        const roomNumberMatch = roomNumberFilter === "All" || (b.rooms && b.rooms.some(r => r.number === roomNumberFilter));
        const checkInDate = new Date(b.check_in);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        const dateMatch = (!from || checkInDate >= from) && (!to || checkInDate <= to);
        return statusMatch && roomNumberMatch && dateMatch;
      })
      .sort((a, b) => b.id - a.id); // Sort by ID descending (latest first)
  }, [bookings, statusFilter, roomNumberFilter, fromDate, toDate]);

  const handleRoomNumberToggle = (roomNumber) => {
    const isSelected = formData.roomNumbers.includes(roomNumber);
    let newRoomNumbers;
    if (isSelected) {
      newRoomNumbers = formData.roomNumbers.filter(num => num !== roomNumber);
    } else {
      newRoomNumbers = [...formData.roomNumbers, roomNumber];
    }
    setFormData(prev => ({ ...prev, roomNumbers: newRoomNumbers }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomTypeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, roomTypes: [value], roomNumbers: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setFeedback({ message: "", type: "" });

    try {
      // --- MINIMUM BOOKING DURATION VALIDATION ---
      if (formData.checkIn && formData.checkOut) {
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);
        const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        if (daysDiff < 1) {
          showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
          setIsSubmitting(false);
          return;
        }
      }

      if (formData.roomNumbers.length === 0) {
        showBannerMessage("error", "Please select at least one room.");
        setIsSubmitting(false);
        return;
      }

      if (totalGuests > totalCapacity) {
        showBannerMessage("error", `The total number of guests (${totalGuests}) exceeds the capacity of the selected rooms (${totalCapacity}).`);
        setIsSubmitting(false);
        return;
      }

      const roomIds = formData.roomNumbers.map((roomNumber) => {
        const room = rooms.find((r) => r.number === roomNumber);
        return room ? room.id : null;
      }).filter(id => id !== null);

      if (roomIds.length !== formData.roomNumbers.length) {
        showBannerMessage("error", "One or more selected rooms are invalid.");
        setIsSubmitting(false);
        return;
      }

      const response = await API.post(
        "/bookings",
        {
          room_ids: roomIds,
          guest_name: formData.guestName,
          guest_mobile: formData.guestMobile,
          guest_email: formData.guestEmail,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          adults: parseInt(formData.adults),
          children: parseInt(formData.children),
        },
        authHeader()
      );

      showBannerMessage("success", "Bookings created successfully!");
      setFormData({
        guestName: "",
        guestMobile: "",
        guestEmail: "",
        roomTypes: [],
        roomNumbers: [],
        checkIn: "",
        checkOut: "",
        adults: 1,
        children: 0,
      });
      // Add the new booking to the state instead of refetching all data
      const newBooking = {
        ...response.data,
        is_package: false,
        rooms: formData.roomNumbers.map(roomNumber => {
          const room = rooms.find(r => r.number === roomNumber);
          return room ? { id: room.id, number: room.number, type: room.type } : null;
        }).filter(Boolean)
      };
      setBookings(prev => [newBooking, ...prev]); // Add to beginning of list
    } catch (err) {
      console.error("Booking creation error:", err);
      const errorMessage = err.response?.data?.message || "Error creating booking.";
      showBannerMessage("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtendBooking = async (bookingId, newCheckoutDate) => {
    setFeedback({ message: "", type: "" });
    setIsSubmitting(true);

    try {
      await API.put(
        `/bookings/${bookingId}/extend?new_checkout=${newCheckoutDate}`,
        {},
        authHeader()
      );
      showBannerMessage("success", "Booking checkout extended successfully!");
      setBookingToExtend(null);
      fetchData();
    } catch (err) {
      console.error("Booking extension error:", err);
      const errorMessage = err.response?.data?.message || "Failed to extend booking.";
      showBannerMessage("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (bookingId, images) => {
    setFeedback({ message: "", type: "" });
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("id_card_image", images.id_card_image);
    formData.append("guest_photo", images.guest_photo);

    const booking = bookings.find(b => b.id === bookingId);
    const url = booking?.is_package ? `/packages/booking/${bookingId}/check-in` : `/bookings/${bookingId}/check-in`;

    try {
      const response = await API.put(url, formData, {
        headers: {
          ...authHeader().headers,
          "Content-Type": "multipart/form-data",
        },
      });

      // Directly update the booking in the state with the response data
      setBookings(prevBookings =>
        prevBookings.map(b => 
          (b.id === bookingId && b.is_package === booking.is_package) 
            // Merge old booking data with new to preserve fields like `is_package`
            ? { ...b, ...response.data } 
            : b
        )
      );

      showBannerMessage("success", "Guest checked in successfully!");
      setBookingToCheckIn(null);
      // fetchData(); // No longer need to refetch everything
    } catch (err) {
      console.error("Check-in error:", err);
      const errorMessage = err.response?.data?.detail || "Failed to check in guest.";
      showBannerMessage("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  const viewDetails = async (id, is_package) => {
    // Set a temporary booking to open the modal instantly, then fetch full details
    const tempBooking = bookings.find(b => b.id === id && b.is_package === is_package);
    setModalBooking(tempBooking || { guest_name: "Loading..." }); // Show a loading state

    try {
      const response = await API.get(`/bookings/details/${id}?is_package=${is_package}`, authHeader());
      setModalBooking(response.data); // Update the modal with full, fresh data
    } catch (err) {
      console.error("Failed to fetch booking details:", err);
      showBannerMessage("error", "Could not load booking details.");
      // Close modal on error
      setModalBooking(null);
    }
  };

  const cancelBooking = async (id, is_package) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const response = await API.put(`/bookings/${id}/cancel?is_package=${is_package}`, {}, authHeader());
      showBannerMessage("success", "Booking cancelled successfully.");
      // Update the booking in state instead of refetching everything
      setBookings(prevBookings =>
        prevBookings.map(b =>
          (b.id === id && b.is_package === is_package) ? { ...b, ...response.data } : b
        )
      );
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      showBannerMessage("error", "Failed to cancel booking.");
    }
  };

  const RoomSelection = ({ rooms, selectedRoomNumbers, onRoomToggle }) => {
    return (
      <div className="flex flex-wrap gap-4 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ scale: 1.05 }}
              className={`
                p-4 rounded-xl shadow-md cursor-pointer transition-all duration-200
                ${selectedRoomNumbers.includes(room.number)
                  ? 'bg-indigo-600 text-white transform scale-105 ring-2 ring-indigo-500'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
                }
              `}
              onClick={() => onRoomToggle(room.number)}
            >
              <div className="w-full h-24 mb-2 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                {/* Placeholder for Room Image */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-10a1 1 0 011-1h2a1 1 0 011 1v10m-6 0h6" />
                </svg>
              </div>
              <div className={`font-semibold text-lg ${selectedRoomNumbers.includes(room.number) ? 'text-white' : 'text-indigo-700'}`}>
                Room {room.number}
              </div>
              <div className={`text-sm ${selectedRoomNumbers.includes(room.number) ? 'text-indigo-200' : 'text-gray-500'}`}>
                <p>Capacity: {room.adults} Adults, {room.children} Children</p>
              </div>
            </motion.div>
          ))
        ) : (
          <span className="text-gray-500 italic text-sm">No rooms available for this type.</span>
        )}
      </div>
    );
  };


  return (
    <DashboardLayout>
      <BannerMessage 
        message={bannerMessage} 
        onClose={closeBannerMessage}
        autoDismiss={true}
        duration={5000}
      />
      {/* Animated Background */}
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

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">Booking Management Dashboard</h1>

        {/* KPI Row and Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <KPI_Card title="Total Bookings" value={kpis.activeBookings} />
          <KPI_Card title="Cancelled Bookings" value={kpis.cancelledBookings} />
          <KPI_Card title="Available Rooms" value={kpis.availableRooms} />
          <KPI_Card title="Guests Today Check-in" value={kpis.todaysGuestsCheckin} />
          <KPI_Card title="Guests Today Check-out" value={kpis.todaysGuestsCheckout} />
        </div>

        {/* Booking Form & Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col"
            initial={{ opacity: 0, y: 20 }} // This should be on the form itself
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Create Room Booking</h2>

            {feedback.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-4 rounded-lg text-sm font-semibold ${
                  feedback.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {feedback.message}
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 flex-grow">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                  <input
                    type="text" name="guestName" value={formData.guestName}
                    onChange={handleChange} placeholder="Enter guest's full name"
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="text" name="guestMobile" value={formData.guestMobile}
                    onChange={handleChange} placeholder="e.g., +1234567890"
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email" name="guestEmail" value={formData.guestEmail}
                    onChange={handleChange} placeholder="email@example.com"
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select
                    name="roomTypes" value={formData.roomTypes[0] || ""}
                    onChange={handleRoomTypeChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Room Type</option>
                    {roomTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Room Number(s)</label>
                  <AnimatePresence mode="wait">
                    {formData.roomTypes.length > 0 && (
                      <motion.div
                        key={formData.roomTypes[0]}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RoomSelection
                          rooms={filteredRooms}
                          selectedRoomNumbers={formData.roomNumbers}
                          onRoomToggle={handleRoomNumberToggle}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                  <input
                    type="date" name="checkIn" value={formData.checkIn}
                    onChange={handleChange} min={today}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                  <input
                    type="date" name="checkOut" value={formData.checkOut}
                    onChange={handleChange} min={formData.checkIn || today}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Number of Adults</label>
                  <input
                    type="number" name="adults" value={formData.adults}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                    min="1"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                  <input
                    type="number" name="children" value={formData.children}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                    min="0"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Creating..." : "Create Booking"}
              </button>
            </form>
          </motion.div>

          {/* Package Booking Form */}
          <motion.div
            onSubmit={handlePackageBookingSubmit}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Book a Package</h2>
            <form onSubmit={handlePackageBookingSubmit} className="flex flex-col h-full">
              <div className="space-y-4 flex-grow">
                <select name="package_id" value={packageBookingForm.package_id} onChange={handlePackageBookingChange} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all" required>
                  <option value="">Select Package</option>
                  {packages.map(p => (<option key={p.id} value={p.id}>{p.title} - ₹{p.price}</option>))}
                </select>
                <input name="guest_name" placeholder="Guest Name" value={packageBookingForm.guest_name} onChange={handlePackageBookingChange} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all" required />
                <input type="email" name="guest_email" placeholder="Guest Email" value={packageBookingForm.guest_email} onChange={handlePackageBookingChange} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all" />
                <input name="guest_mobile" placeholder="Guest Mobile" value={packageBookingForm.guest_mobile} onChange={handlePackageBookingChange} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all" required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="date" name="check_in" value={packageBookingForm.check_in} min={today} onChange={handlePackageBookingChange} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all" required />
                  <input type="date" name="check_out" value={packageBookingForm.check_out} min={packageBookingForm.check_in || today} onChange={handlePackageBookingChange} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="number" name="adults" min={1} placeholder="Adults" value={packageBookingForm.adults} onChange={handlePackageBookingChange} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all" required />
                  <input type="number" name="children" min={0} placeholder="Children" value={packageBookingForm.children} onChange={handlePackageBookingChange} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all" />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Select Rooms:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg border">
                    {rooms.map(room => (
                      <div key={room.id} onClick={() => handlePackageRoomSelect(room.id)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                                           ${packageBookingForm.room_ids.includes(room.id) ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white border-gray-300 hover:border-indigo-500'}
                      `}>
                        <p className="font-semibold">Room {room.number}</p>
                        <p className={`text-sm ${packageBookingForm.room_ids.includes(room.id) ? 'text-indigo-200' : 'text-gray-600'}`}>{room.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-md transition-transform transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Booking..." : "Book Package ✅"}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg overflow-x-auto">
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-700">All Bookings</h2>
            <div className="flex flex-wrap gap-3 items-center">
              <select // Status Filter
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="border-gray-300 rounded-lg p-2 shadow-sm"
              >
                <option value="All">All Statuses</option>
                <option value="booked">Booked</option>
                <option value="cancelled">Cancelled</option>
                <option value="checked-in">Checked-in</option>
                <option value="checked-out">Checked-out</option>
              </select>
              <select // Room Number Filter
                value={roomNumberFilter} onChange={(e) => setRoomNumberFilter(e.target.value)}
                className="border-gray-300 rounded-lg p-2 shadow-sm"
              >
                {allRoomNumbers.map(roomNumber => (
                  <option key={roomNumber} value={roomNumber}>{roomNumber === "All" ? "All Rooms" : `Room ${roomNumber}`}</option>
                ))}
              </select>
              <input // From Date
                type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="border-gray-300 rounded-lg p-2 shadow-sm"
              />
              <input // To Date
                type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="border-gray-300 rounded-lg p-2 shadow-sm"
              />
            </div>
          </div>

          <table className="min-w-full text-sm border-collapse rounded-xl">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-800">ID</th>
                <th className="p-4 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-800">Guest</th>
                <th className="p-4 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-800">Booking Type</th>
                <th className="p-4 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-800">Rooms</th>
                <th className="p-4 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-800">Check-in</th>
                <th className="p-4 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-800">Check-out</th>
                <th className="p-4 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-800">Guests</th>
                <th className="p-4 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-800">Status</th>
                <th className="p-4 border-b border-gray-200 text-center text-xs font-semibold uppercase tracking-wider text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b, index) => (
                  <motion.tr
                    key={b.id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="p-4">{b.id}</td>
                    <td className="p-4 font-medium text-gray-900">
                      {b.guest_name}
                    </td>
                    <td className="p-4">
                      {b.is_package ? (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {b.package?.title || 'Package'}
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">Room</span>
                      )}
                    </td>
                    <td className="p-4">
                      {b.rooms && b.rooms.length > 0 ? b.rooms.map(room => `${room.number} (${room.type})`).join(", ") : "N/A"}
                    </td>
                    <td className="p-4 text-gray-800">{b.check_in}</td>
                    <td className="p-4 text-gray-800">{b.check_out}</td>
                    <td className="p-4 text-gray-800">{b.adults} A, {b.children} C</td>
                    <td className="p-4">
                      <BookingStatusBadge status={b.status || "Pending"} />
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => viewDetails(b.id, b.is_package)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setBookingToCheckIn(b)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={b.status !== "booked"}
                      >
                        Check-in
                      </button>
                      <button
                        onClick={() => setBookingToExtend(b)}
                        className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!["booked", "checked-in"].includes(b.status)}
                      >
                        Extend
                      </button>
                      <button
                        onClick={() => cancelBooking(b.id, b.is_package)}
                        className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={b.status !== "booked"}
                      >
                        Cancel
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500 italic">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredBookings.length > 0 && hasMoreBookings && (
              <div ref={loadMoreRef} className="text-center p-4">
                {isSubmitting && <span className="text-indigo-600">Loading more bookings...</span>}
              </div>
            )}
          </table>
        </div>
      </div>
      <AnimatePresence>
        {modalBooking && (
          <BookingDetailsModal
            booking={modalBooking}
            onClose={() => setModalBooking(null)}
            onImageClick={(imageUrl) => setSelectedImage(imageUrl)}
          />
        )}
        {bookingToExtend && (
          <ExtendBookingModal
            booking={bookingToExtend}
            onClose={() => setBookingToExtend(null)}
            onSave={handleExtendBooking}
            feedback={feedback}
            isSubmitting={isSubmitting}
          />
        )}
        {bookingToCheckIn && (
          <CheckInModal
            booking={bookingToCheckIn}
            onClose={() => setBookingToCheckIn(null)}
            onSave={handleCheckIn}
            feedback={feedback}
            isSubmitting={isSubmitting}
          />
        )}
        {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Bookings;