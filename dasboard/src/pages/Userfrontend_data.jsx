import React, { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { FaStar, FaTrashAlt, FaPencilAlt, FaPlus, FaTimes } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

// Get the correct base URL based on environment
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath; // Already a full URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://www.teqmates.com' 
    : 'http://localhost:8000';
  // Ensure imagePath starts with / for proper URL construction
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

const API_URL = process.env.NODE_ENV === 'production' ? 'https://www.teqmates.com' : 'http://localhost:8000';

// --- Reusable Components ---

const ManagementSection = ({ title, onAdd, children, isLoading }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-semibold shadow-md hover:bg-violet-700 transition-all duration-200">
                <FaPlus size={14} /> Add New
            </button>
        </div>
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto pr-2">
                {children}
            </div>
        )}
    </div>
);

const FormModal = ({ isOpen, onClose, onSubmit, fields, initialData, title, isMultipart = false }) => {
    const [formState, setFormState] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormState(initialData);
            if (initialData.image_url) {
                setImagePreview(getImageUrl(initialData.image_url));
            }
        } else {
            setFormState({});
            setImagePreview(null);
        }
    }, [initialData, isOpen]);

    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file' && files.length > 0) {
            setSelectedFile(files[0]);
            setImagePreview(URL.createObjectURL(files[0]));
            setFormState({ ...formState, [name]: files[0] });
        } else if (type === 'checkbox') {
            setFormState({ ...formState, [name]: checked });
        } else {
            setFormState({ ...formState, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit(formState, selectedFile);
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map(field => (
                            <div key={field.name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{field.placeholder}</label>
                                {field.type === 'file' ? (
                                    <input type="file" name={field.name} onChange={handleFormChange} className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                                ) : field.type === 'checkbox' ? (
                                    <input type="checkbox" name={field.name} checked={!!formState[field.name]} onChange={handleFormChange} className="h-5 w-5 text-violet-600 border-gray-300 rounded focus:ring-violet-500" />
                                ) : field.type === 'textarea' ? (
                                    <textarea name={field.name} placeholder={field.placeholder} value={formState[field.name] || ''} onChange={handleFormChange} required={field.required !== false} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors" />
                                ) : (
                                    <input type={field.type || "text"} name={field.name} placeholder={field.placeholder} value={formState[field.name] || ''} onChange={handleFormChange} required={field.required !== false} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors" />
                                )}
                            </div>
                        ))}
                        {imagePreview && <div className="mt-4"><img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-lg shadow-md" /></div>}
                        <button type="submit" disabled={isLoading} className="w-full mt-6 py-3 px-6 bg-violet-600 text-white rounded-lg font-semibold shadow-md hover:bg-violet-700 transition-all duration-200 disabled:bg-gray-400">
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- Main CMS Component ---

export default function ResortCMS() {
    const [resortData, setResortData] = useState({
        banners: [],
        gallery: [],
        reviews: [],
        resortInfo: [],
        signatureExperiences: [],
        planWeddings: [],
        nearbyAttractions: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({ isOpen: false, config: null, initialData: null });

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [bannersRes, galleryRes, reviewsRes, resortInfoRes, signatureExpRes, planWeddingRes, nearbyAttrRes] = await Promise.all([
                api.get("/header-banner/"),
                api.get("/gallery/"),
                api.get("/reviews/"),
                api.get("/resort-info/"),
                api.get("/signature-experiences/"),
                api.get("/plan-weddings/"),
                api.get("/nearby-attractions/"),
            ]);
            setResortData({
                banners: bannersRes.data || [],
                gallery: galleryRes.data || [],
                reviews: reviewsRes.data || [],
                resortInfo: resortInfoRes.data || [],
                signatureExperiences: signatureExpRes.data || [],
                planWeddings: planWeddingRes.data || [],
                nearbyAttractions: nearbyAttrRes.data || [],
            });
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleDelete = async (endpoint, id, name) => {
        if (window.confirm(`Are you sure you want to delete this ${name}?`)) {
            // Optimistically remove from UI immediately
            setResortData(prev => {
                if (endpoint.includes('header-banner')) {
                    return { ...prev, banners: prev.banners.filter(item => item.id !== id) };
                } else if (endpoint.includes('gallery')) {
                    return { ...prev, gallery: prev.gallery.filter(item => item.id !== id) };
                } else if (endpoint.includes('reviews')) {
                    return { ...prev, reviews: prev.reviews.filter(item => item.id !== id) };
                } else if (endpoint.includes('resort-info')) {
                    return { ...prev, resortInfo: prev.resortInfo.filter(item => item.id !== id) };
                } else if (endpoint.includes('signature-experiences')) {
                    return { ...prev, signatureExperiences: prev.signatureExperiences.filter(item => item.id !== id) };
                } else if (endpoint.includes('plan-weddings')) {
                    return { ...prev, planWeddings: prev.planWeddings.filter(item => item.id !== id) };
                } else if (endpoint.includes('nearby-attractions')) {
                    return { ...prev, nearbyAttractions: prev.nearbyAttractions.filter(item => item.id !== id) };
                }
                return prev;
            });
            
            try {
                await api.delete(`${endpoint}/${id}`);
                toast.success(`${name} deleted successfully!`);
                // Optionally refresh to sync with server
                fetchAll();
            } catch (err) {
                console.error("Delete error:", err);
                toast.error(`Failed to delete ${name}.`);
                // Re-fetch to restore original state if delete failed
                fetchAll();
            }
        }
    };

    const handleFormSubmit = async (config, initialData, formData, file) => {
        const isEditing = initialData && initialData.id;
        const endpoint = isEditing ? `${config.endpoint}/${initialData.id}` : config.endpoint;
        const method = isEditing ? 'put' : 'post';

        let payload = formData;
        if (config.isMultipart) {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'image') data.append(key, formData[key]);
            });
            if (file) data.append('image', file);
            payload = data;
        }

        try {
            const response = await api({
                method: method,
                url: endpoint,
                data: payload,
            });
            toast.success(`${config.title} ${isEditing ? 'updated' : 'added'} successfully!`);
            
            // Optimistically update the UI
            if (config.endpoint.includes('header-banner')) {
                setResortData(prev => ({
                    ...prev,
                    banners: isEditing 
                        ? prev.banners.map(item => item.id === initialData.id ? response.data : item)
                        : [response.data, ...prev.banners]
                }));
            } else if (config.endpoint.includes('gallery')) {
                setResortData(prev => ({
                    ...prev,
                    gallery: isEditing
                        ? prev.gallery.map(item => item.id === initialData.id ? response.data : item)
                        : [response.data, ...prev.gallery]
                }));
            } else if (config.endpoint.includes('reviews')) {
                setResortData(prev => ({
                    ...prev,
                    reviews: isEditing
                        ? prev.reviews.map(item => item.id === initialData.id ? response.data : item)
                        : [response.data, ...prev.reviews]
                }));
            } else if (config.endpoint.includes('resort-info')) {
                setResortData(prev => ({
                    ...prev,
                    resortInfo: isEditing
                        ? prev.resortInfo.map(item => item.id === initialData.id ? response.data : item)
                        : [response.data, ...prev.resortInfo]
                }));
            } else if (config.endpoint.includes('signature-experiences')) {
                setResortData(prev => ({
                    ...prev,
                    signatureExperiences: isEditing
                        ? prev.signatureExperiences.map(item => item.id === initialData.id ? response.data : item)
                        : [response.data, ...prev.signatureExperiences]
                }));
            } else if (config.endpoint.includes('plan-weddings')) {
                setResortData(prev => ({
                    ...prev,
                    planWeddings: isEditing
                        ? prev.planWeddings.map(item => item.id === initialData.id ? response.data : item)
                        : [response.data, ...prev.planWeddings]
                }));
            } else if (config.endpoint.includes('nearby-attractions')) {
                setResortData(prev => ({
                    ...prev,
                    nearbyAttractions: isEditing
                        ? prev.nearbyAttractions.map(item => item.id === initialData.id ? response.data : item)
                        : [response.data, ...prev.nearbyAttractions]
                }));
            }
            
            // Close modal after successful save
            setModalState({ isOpen: false, config: null, initialData: null });
        } catch (error) {
            console.error(`Failed to ${isEditing ? 'update' : 'add'} ${config.title}:`, error.response?.data || error.message);
            const errorMsg = error.response?.data?.detail;
            const message = typeof errorMsg === 'string' ? errorMsg : `Failed to save ${config.title}.`;
            toast.error(message);
        }
    };

    const openModal = (config, initialData = null) => {
        setModalState({ isOpen: true, config, initialData });
    };

    const sectionConfigs = {
        banners: { title: "Header Banner", endpoint: "/header-banner", fields: [{ name: "title", placeholder: "Banner Title" }, { name: "subtitle", placeholder: "Banner Description" }, { name: "image", type: "file" }, { name: "is_active", type: "checkbox", placeholder: "Is Active?" }], isMultipart: true },
        gallery: { title: "Gallery Image", endpoint: "/gallery", fields: [{ name: "caption", placeholder: "Image Caption" }, { name: "image", type: "file" }], isMultipart: true },
        reviews: { title: "Review", endpoint: "/reviews", fields: [{ name: "name", placeholder: "Customer Name" }, { name: "comment", placeholder: "Review Comment" }, { name: "rating", placeholder: "Rating (1-5)", type: "number" }], isMultipart: false },
        resortInfo: { title: "Resort Info", endpoint: "/resort-info", fields: [{ name: "name", placeholder: "Resort Name" }, { name: "address", placeholder: "Resort Address" }, { name: "facebook", placeholder: "Facebook URL" }, { name: "instagram", placeholder: "Instagram URL" }, { name: "twitter", placeholder: "Twitter URL" }, { name: "linkedin", placeholder: "LinkedIn URL" }, { name: "is_active", type: "checkbox", placeholder: "Is Active?" }], isMultipart: false },
        signatureExperiences: { title: "Signature Experience", endpoint: "/signature-experiences", fields: [{ name: "title", placeholder: "Experience Title" }, { name: "description", placeholder: "Description", type: "textarea" }, { name: "image", type: "file" }, { name: "is_active", type: "checkbox", placeholder: "Is Active?" }], isMultipart: true },
        planWeddings: { title: "Plan Your Wedding", endpoint: "/plan-weddings", fields: [{ name: "title", placeholder: "Title" }, { name: "description", placeholder: "Description", type: "textarea" }, { name: "image", type: "file" }, { name: "is_active", type: "checkbox", placeholder: "Is Active?" }], isMultipart: true },
        nearbyAttractions: { title: "Nearby Attraction", endpoint: "/nearby-attractions", fields: [{ name: "title", placeholder: "Attraction Title" }, { name: "description", placeholder: "Description", type: "textarea" }, { name: "image", type: "file" }, { name: "is_active", type: "checkbox", placeholder: "Is Active?" }], isMultipart: true },
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen text-2xl text-gray-500">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Loading CMS...
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 md:p-10 space-y-10 bg-gray-50 min-h-screen">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center">Resort Website CMS</h1>

                <FormModal
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState({ isOpen: false, config: null, initialData: null })}
                    onSubmit={(data, file) => handleFormSubmit(modalState.config, modalState.initialData, data, file)}
                    fields={modalState.config?.fields || []}
                    initialData={modalState.initialData}
                    title={`${modalState.initialData ? 'Edit' : 'Add'} ${modalState.config?.title}`}
                    isMultipart={modalState.config?.isMultipart}
                />

                <div className="space-y-10">
                    <ManagementSection title="Header Banners" onAdd={() => openModal(sectionConfigs.banners)} isLoading={isLoading}>
                        {resortData.banners.length > 0 ? resortData.banners.map(item => (
                            <div key={item.id} className="bg-gray-50 border rounded-lg p-4 space-y-3">
                                <img src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-32 object-cover rounded-md shadow-sm" />
                                <h3 className="font-bold text-gray-800">{item.title}</h3>
                                <p className="text-xs text-gray-600">{item.subtitle}</p>
                                <p className="text-xs font-semibold">{item.is_active ? "🟢 Active" : "🔴 Inactive"}</p>
                                <div className="flex gap-2 pt-2 border-t">
                                    <button onClick={() => openModal(sectionConfigs.banners, item)} className="text-blue-600 hover:text-blue-800"><FaPencilAlt /></button>
                                    <button onClick={() => handleDelete(sectionConfigs.banners.endpoint, item.id, 'banner')} className="text-red-600 hover:text-red-800"><FaTrashAlt /></button>
                                </div>
                            </div>
                        )) : <p className="col-span-full text-center text-gray-500">No banners found.</p>}
                    </ManagementSection>

                    <ManagementSection title="Gallery" onAdd={() => openModal(sectionConfigs.gallery)} isLoading={isLoading}>
                        {resortData.gallery.length > 0 ? resortData.gallery.map(item => (
                            <div key={item.id} className="bg-gray-50 border rounded-lg p-4 space-y-3">
                                <img src={getImageUrl(item.image_url)} alt={item.caption} className="w-full h-32 object-cover rounded-md shadow-sm" />
                                <p className="text-xs text-gray-600">{item.caption}</p>
                                <div className="flex gap-2 pt-2 border-t">
                                    <button onClick={() => openModal(sectionConfigs.gallery, item)} className="text-blue-600 hover:text-blue-800"><FaPencilAlt /></button>
                                    <button onClick={() => handleDelete(sectionConfigs.gallery.endpoint, item.id, 'gallery image')} className="text-red-600 hover:text-red-800"><FaTrashAlt /></button>
                                </div>
                            </div>
                        )) : <p className="col-span-full text-center text-gray-500">No gallery images found.</p>}
                    </ManagementSection>

                    <ManagementSection title="Reviews" onAdd={() => openModal(sectionConfigs.reviews)} isLoading={isLoading}>
                        {resortData.reviews.length > 0 ? resortData.reviews.map(item => (
                            <div key={item.id} className="bg-gray-50 border rounded-lg p-4 space-y-2">
                                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                <div className="flex text-yellow-400">{[...Array(item.rating)].map((_, i) => <FaStar key={i} />)}</div>
                                <p className="text-sm text-gray-600 italic">"{item.comment}"</p>
                                <div className="flex gap-2 pt-2 border-t">
                                    <button onClick={() => openModal(sectionConfigs.reviews, item)} className="text-blue-600 hover:text-blue-800"><FaPencilAlt /></button>
                                    <button onClick={() => handleDelete(sectionConfigs.reviews.endpoint, item.id, 'review')} className="text-red-600 hover:text-red-800"><FaTrashAlt /></button>
                                </div>
                            </div>
                        )) : <p className="col-span-full text-center text-gray-500">No reviews found.</p>}
                    </ManagementSection>

                    <ManagementSection title="Resort Info" onAdd={() => openModal(sectionConfigs.resortInfo)} isLoading={isLoading}>
                        {resortData.resortInfo.length > 0 ? resortData.resortInfo.map(item => (
                            <div key={item.id} className="bg-gray-50 border rounded-lg p-4 space-y-2 col-span-full">
                                <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.address}</p>
                                <p className="text-xs font-semibold">{item.is_active ? "🟢 Active" : "🔴 Inactive"}</p>
                                <div className="flex gap-4 text-sm pt-2">
                                    {item.facebook && <a href={item.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Facebook</a>}
                                    {item.instagram && <a href={item.instagram} target="_blank" rel="noreferrer" className="text-pink-600 hover:underline">Instagram</a>}
                                    {item.twitter && <a href={item.twitter} target="_blank" rel="noreferrer" className="text-sky-500 hover:underline">Twitter</a>}
                                    {item.linkedin && <a href={item.linkedin} target="_blank" rel="noreferrer" className="text-blue-800 hover:underline">LinkedIn</a>}
                                </div>
                                <div className="flex gap-2 pt-2 border-t">
                                    <button onClick={() => openModal(sectionConfigs.resortInfo, item)} className="text-blue-600 hover:text-blue-800"><FaPencilAlt /></button>
                                    <button onClick={() => handleDelete(sectionConfigs.resortInfo.endpoint, item.id, 'resort info')} className="text-red-600 hover:text-red-800"><FaTrashAlt /></button>
                                </div>
                            </div>
                        )) : <p className="col-span-full text-center text-gray-500">No resort info found.</p>}
                    </ManagementSection>

                    <ManagementSection title="✦ Signature Experiences ✦" onAdd={() => openModal(sectionConfigs.signatureExperiences)} isLoading={isLoading}>
                        {resortData.signatureExperiences.length > 0 ? resortData.signatureExperiences.map(item => (
                            <div key={item.id} className="bg-gray-50 border rounded-lg p-4 space-y-3">
                                <img src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-32 object-cover rounded-md shadow-sm" />
                                <h3 className="font-bold text-gray-800">{item.title}</h3>
                                <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                                <p className="text-xs font-semibold">{item.is_active ? "🟢 Active" : "🔴 Inactive"}</p>
                                <div className="flex gap-2 pt-2 border-t">
                                    <button onClick={() => openModal(sectionConfigs.signatureExperiences, item)} className="text-blue-600 hover:text-blue-800"><FaPencilAlt /></button>
                                    <button onClick={() => handleDelete(sectionConfigs.signatureExperiences.endpoint, item.id, 'signature experience')} className="text-red-600 hover:text-red-800"><FaTrashAlt /></button>
                                </div>
                            </div>
                        )) : <p className="col-span-full text-center text-gray-500">No signature experiences found.</p>}
                    </ManagementSection>

                    <ManagementSection title="Plan Your Wedding" onAdd={() => openModal(sectionConfigs.planWeddings)} isLoading={isLoading}>
                        {resortData.planWeddings.length > 0 ? resortData.planWeddings.map(item => (
                            <div key={item.id} className="bg-gray-50 border rounded-lg p-4 space-y-3">
                                <img src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-32 object-cover rounded-md shadow-sm" />
                                <h3 className="font-bold text-gray-800">{item.title}</h3>
                                <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                                <p className="text-xs font-semibold">{item.is_active ? "🟢 Active" : "🔴 Inactive"}</p>
                                <div className="flex gap-2 pt-2 border-t">
                                    <button onClick={() => openModal(sectionConfigs.planWeddings, item)} className="text-blue-600 hover:text-blue-800"><FaPencilAlt /></button>
                                    <button onClick={() => handleDelete(sectionConfigs.planWeddings.endpoint, item.id, 'plan wedding')} className="text-red-600 hover:text-red-800"><FaTrashAlt /></button>
                                </div>
                            </div>
                        )) : <p className="col-span-full text-center text-gray-500">No wedding plans found.</p>}
                    </ManagementSection>

                    <ManagementSection title="Nearby Attractions" onAdd={() => openModal(sectionConfigs.nearbyAttractions)} isLoading={isLoading}>
                        {resortData.nearbyAttractions.length > 0 ? resortData.nearbyAttractions.map(item => (
                            <div key={item.id} className="bg-gray-50 border rounded-lg p-4 space-y-3">
                                <img src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-32 object-cover rounded-md shadow-sm" />
                                <h3 className="font-bold text-gray-800">{item.title}</h3>
                                <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                                <p className="text-xs font-semibold">{item.is_active ? "🟢 Active" : "🔴 Inactive"}</p>
                                <div className="flex gap-2 pt-2 border-t">
                                    <button onClick={() => openModal(sectionConfigs.nearbyAttractions, item)} className="text-blue-600 hover:text-blue-800"><FaPencilAlt /></button>
                                    <button onClick={() => handleDelete(sectionConfigs.nearbyAttractions.endpoint, item.id, 'nearby attraction')} className="text-red-600 hover:text-red-800"><FaTrashAlt /></button>
                                </div>
                            </div>
                        )) : <p className="col-span-full text-center text-gray-500">No nearby attractions found.</p>}
                    </ManagementSection>
                </div>
            </div>
        </DashboardLayout>
    );
}