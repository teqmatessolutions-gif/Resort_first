import React, { useState, useEffect, useRef } from "react";
// Lucide React is used for elegant icons
import { BedDouble, Coffee, ConciergeBell, Package, ChevronRight, Image as ImageIcon, Star, Quote, ChevronUp, MessageSquare, Send, X, Facebook, Instagram, Linkedin, Twitter, Moon, Sun, Droplet } from 'lucide-react';

// Custom hook to detect if an element is in the viewport
const useOnScreen = (ref, rootMargin = "0px") => {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIntersecting(entry.isIntersecting);
            },
            { rootMargin }
        );
        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, rootMargin]);
    return isIntersecting;
};

// Define the themes with a consistent structure for easy switching
const themes = {
    dark: {
        id: 'dark',
        name: 'Dark',
        icon: <Moon className="w-5 h-5" />,
        bgPrimary: "bg-neutral-950",
        bgSecondary: "bg-neutral-900",
        bgCard: "bg-neutral-900",
        textPrimary: "text-white",
        textSecondary: "text-neutral-400",
        textAccent: "text-amber-400",
        textTitleGradient: "from-gray-200 via-white to-gray-400",
        border: "border-neutral-700",
        borderHover: "hover:border-amber-500/50",
        buttonBg: "bg-amber-500",
        buttonText: "text-neutral-950",
        buttonHover: "hover:bg-amber-400",
        placeholderBg: "bg-neutral-800",
        placeholderText: "text-neutral-400",
        chatBg: "bg-neutral-900",
        chatHeaderBg: "bg-neutral-800",
        chatInputBorder: "border-neutral-700",
        chatInputBg: "bg-neutral-700",
        chatInputPlaceholder: "placeholder-neutral-400",
        chatUserBg: "bg-amber-500",
        chatUserText: "text-neutral-950",
        chatModelBg: "bg-neutral-800",
        chatModelText: "text-neutral-100",
        chatLoaderBg: "bg-neutral-400",
    },
    light: {
        id: 'light',
        name: 'Light',
        icon: <Sun className="w-5 h-5" />,
        bgPrimary: "bg-neutral-50",
        bgSecondary: "bg-neutral-200",
        bgCard: "bg-white",
        textPrimary: "text-neutral-900",
        textSecondary: "text-neutral-600",
        textAccent: "text-purple-600",
        textTitleGradient: "from-neutral-700 via-neutral-900 to-black",
        border: "border-neutral-300",
        borderHover: "hover:border-purple-600/50",
        buttonBg: "bg-purple-600",
        buttonText: "text-white",
        buttonHover: "hover:bg-purple-500",
        placeholderBg: "bg-neutral-100",
        placeholderText: "text-neutral-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-neutral-100",
        chatInputBorder: "border-neutral-200",
        chatInputBg: "bg-neutral-100",
        chatInputPlaceholder: "placeholder-neutral-500",
        chatUserBg: "bg-purple-600",
        chatUserText: "text-white",
        chatModelBg: "bg-neutral-100",
        chatModelText: "text-neutral-900",
        chatLoaderBg: "bg-neutral-600",
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean',
        icon: <Droplet className="w-5 h-5" />,
        bgPrimary: "bg-blue-950",
        bgSecondary: "bg-blue-900",
        bgCard: "bg-blue-900",
        textPrimary: "text-blue-100",
        textSecondary: "text-blue-300",
        textAccent: "text-cyan-400",
        textTitleGradient: "from-blue-200 via-cyan-300 to-teal-400",
        border: "border-blue-700",
        borderHover: "hover:border-cyan-400/50",
        buttonBg: "bg-cyan-500",
        buttonText: "text-blue-950",
        buttonHover: "hover:bg-cyan-400",
        placeholderBg: "bg-blue-800",
        placeholderText: "text-blue-400",
        chatBg: "bg-blue-900",
        chatHeaderBg: "bg-blue-800",
        chatInputBorder: "border-blue-700",
        chatInputBg: "bg-blue-700",
        chatInputPlaceholder: "placeholder-blue-400",
        chatUserBg: "bg-cyan-500",
        chatUserText: "text-blue-950",
        chatModelBg: "bg-blue-800",
        chatModelText: "text-blue-100",
        chatLoaderBg: "bg-blue-400",
    },
    forest: {
        id: 'forest',
        name: 'Forest',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tree-pine"><path d="M17 19h2c.5 0 1-.5 1-1V9c0-2-3-3-3-3H8c-3 0-4 1.5-4 4.5v3.5c0 1.5 1 2 2 2h2"/><path d="M14 15v.5"/><path d="M13 14v.5"/><path d="M12 13v.5"/><path d="M11 12v.5"/><path d="M10 11v.5"/><path d="M9 10v.5"/><path d="M8 9v.5"/><path d="M17 14v.5"/><path d="M16 13v.5"/><path d="M15 12v.5"/><path d="M14 11v.5"/><path d="M13 10v.5"/><path d="M12 9v.5"/><path d="M11 8v.5"/><path d="M10 7v.5"/><path d="M9 6v.5"/><path d="M15 18v1"/><path d="M14 17v1"/><path d="M13 16v1"/><path d="M12 15v1"/><path d="M11 14v1"/><path d="M10 13v1"/><path d="M9 12v1"/><path d="M8 11v1"/><path d="M7 10v1"/><path d="M6 9v1"/><path d="M18 17v1"/><path d="M17 16v1"/><path d="M16 15v1"/><path d="M15 14v1"/><path d="M14 13v1"/><path d="M13 12v1"/><path d="M12 11v1"/><path d="M11 10v1"/><path d="M10 9v1"/><path d="M19 18v1"/><path d="M18 17v1"/><path d="M17 16v1"/><path d="M16 15v1"/><path d="M15 14v1"/><path d="M14 13v1"/><path d="M13 12v1"/><path d="M22 19v2"/><path d="M20 18v1"/><path d="M18 17v1"/><path d="M16 16v1"/><path d="M14 15v1"/><path d="M12 14v1"/><path d="M10 13v1"/><path d="M8 12v1"/><path d="M6 11v1"/><path d="M4 10v1"/><path d="M2 9v1"/><path d="M2 21h20"/><path d="m14 12-2-4-2 4"/><path d="m13 8-1-4-1 4"/><path d="M14 12c.5-1 1.5-2 2.5-3"/><path d="M10 12c-.5-1-1.5-2-2.5-3"/><path d="M12 22v-8"/><path d="m10 16-2 3"/><path d="m14 16 2 3"/></svg>,
        bgPrimary: "bg-emerald-950",
        bgSecondary: "bg-emerald-900",
        bgCard: "bg-emerald-900",
        textPrimary: "text-emerald-100",
        textSecondary: "text-emerald-300",
        textAccent: "text-lime-400",
        textTitleGradient: "from-emerald-200 via-lime-300 to-green-400",
        border: "border-emerald-700",
        borderHover: "hover:border-lime-400/50",
        buttonBg: "bg-lime-500",
        buttonText: "text-emerald-950",
        buttonHover: "hover:bg-lime-400",
        placeholderBg: "bg-emerald-800",
        placeholderText: "text-emerald-400",
        chatBg: "bg-emerald-900",
        chatHeaderBg: "bg-emerald-800",
        chatInputBorder: "border-emerald-700",
        chatInputBg: "bg-emerald-700",
        chatInputPlaceholder: "placeholder-emerald-400",
        chatUserBg: "bg-lime-500",
        chatUserText: "text-emerald-950",
        chatModelBg: "bg-emerald-800",
        chatModelText: "text-emerald-100",
        chatLoaderBg: "bg-emerald-400",
    },
    rose: {
        id: 'rose',
        name: 'Rose',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flower"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5H12a4.5 4.5 0 1 1-4.5-4.5H12z"/><path d="M12 12a4.5 4.5 0 1 1 4.5 4.5H12a4.5 4.5 0 1 1-4.5-4.5H12z"/><path d="M12 12a4.5 4.5 0 1 1-4.5-4.5H12a4.5 4.5 0 1 1 4.5 4.5H12z"/><path d="M12 12a4.5 4.5 0 1 1 4.5 4.5H12a4.5 4.5 0 1 1-4.5-4.5H12z"/><path d="M7.5 12H12a4.5 4.5 0 0 0 4.5-4.5v-3a4.5 4.5 0 1 1 0 9v3a4.5 4.5 0 1 1 0-9h-4.5a4.5 4.5 0 0 0-4.5 4.5V12z"/></svg>,
        bgPrimary: "bg-rose-50",
        bgSecondary: "bg-rose-200",
        bgCard: "bg-white",
        textPrimary: "text-rose-900",
        textSecondary: "text-rose-600",
        textAccent: "text-fuchsia-600",
        textTitleGradient: "from-rose-700 via-rose-900 to-fuchsia-900",
        border: "border-rose-300",
        borderHover: "hover:border-fuchsia-600/50",
        buttonBg: "bg-fuchsia-600",
        buttonText: "text-white",
        buttonHover: "hover:bg-fuchsia-500",
        placeholderBg: "bg-rose-100",
        placeholderText: "text-rose-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-rose-100",
        chatInputBorder: "border-rose-200",
        chatInputBg: "bg-rose-100",
        chatInputPlaceholder: "placeholder-rose-500",
        chatUserBg: "bg-fuchsia-600",
        chatUserText: "text-white",
        chatModelBg: "bg-rose-100",
        chatModelText: "text-rose-900",
        chatLoaderBg: "bg-rose-600",
    },
    slate: {
        id: 'slate',
        name: 'Slate',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/></svg>,
        bgPrimary: "bg-gray-950",
        bgSecondary: "bg-gray-900",
        bgCard: "bg-gray-900",
        textPrimary: "text-gray-100",
        textSecondary: "text-gray-400",
        textAccent: "text-sky-400",
        textTitleGradient: "from-gray-200 via-gray-400 to-gray-600",
        border: "border-gray-700",
        borderHover: "hover:border-sky-400/50",
        buttonBg: "bg-sky-500",
        buttonText: "text-gray-950",
        buttonHover: "hover:bg-sky-400",
        placeholderBg: "bg-gray-800",
        placeholderText: "text-gray-400",
        chatBg: "bg-gray-900",
        chatHeaderBg: "bg-gray-800",
        chatInputBorder: "border-gray-700",
        chatInputBg: "bg-gray-700",
        chatInputPlaceholder: "placeholder-gray-400",
        chatUserBg: "bg-sky-500",
        chatUserText: "text-gray-950",
        chatModelBg: "bg-gray-800",
        chatModelText: "text-gray-100",
        chatLoaderBg: "bg-gray-400",
    },
    sunrise: {
        id: 'sunrise',
        name: 'Sunrise',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sunrise"><path d="M12 2v2"/><path d="m5 10 1-1"/><path d="m19 10 1-1"/><path d="M12 16a6 6 0 0 0 0 12"/><path d="m3 16 1-1"/><path d="m21 16-1-1"/><path d="m8 20 2-2"/><path d="m16 20-2-2"/></svg>,
        bgPrimary: "bg-orange-50",
        bgSecondary: "bg-yellow-100",
        bgCard: "bg-white",
        textPrimary: "text-orange-900",
        textSecondary: "text-orange-600",
        textAccent: "text-red-500",
        textTitleGradient: "from-orange-500 via-yellow-600 to-red-700",
        border: "border-yellow-200",
        borderHover: "hover:border-red-500/50",
        buttonBg: "bg-red-500",
        buttonText: "text-white",
        buttonHover: "hover:bg-red-400",
        placeholderBg: "bg-yellow-50",
        placeholderText: "text-orange-400",
        chatBg: "bg-white",
        chatHeaderBg: "bg-yellow-100",
        chatInputBorder: "border-yellow-200",
        chatInputBg: "bg-yellow-100",
        chatInputPlaceholder: "placeholder-orange-500",
        chatUserBg: "bg-red-500",
        chatUserText: "text-white",
        chatModelBg: "bg-yellow-100",
        chatModelText: "text-orange-900",
        chatLoaderBg: "bg-red-600",
    },
    lavender: {
        id: 'lavender',
        name: 'Lavender',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lavender"><path d="M14.5 16.5c-2.4-1-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5C3.3 6.7 4 6 5 6c1.1 0 2.4.8 3.5 2.5 1.2 1.9 2 4.2 2.5 5.5.5 1.5 1 3.6 2 4.5 1 .8 2.2 1.3 3.5 1C17.3 17.3 18 16.6 18 15.6c0-1.1-.8-2.4-2.5-3.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5.3-1.3 1-2 2-2 1.1 0 2.4.8 3.5 2.5 1.9 1.2 4.2 2 5.5 2.5 1.5.5 3.6 1 4.5 2 .8 1 1.3 2.2 1 3.5-.3 1.3-1 2-2 2-1.1 0-2.4-.8-3.5-2.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4-.8-3.5-2.5"/><path d="M12 12c-2.4-1-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5.3-1.3 1-2 2-2 1.1 0 2.4.8 3.5 2.5 1.9 1.2 4.2 2 5.5 2.5 1.5.5 3.6 1 4.5 2 .8 1 1.3 2.2 1 3.5-.3 1.3-1 2-2 2-1.1 0-2.4-.8-3.5-2.5"/><path d="M12 12c2.4-1 4.2-2 5.5-2.5 1.5-.5 3.6-1 4.5-2 .8-1 1.3 2.2 1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4.8-3.5 2.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4-.8-3.5-2.5"/></svg>,
        bgPrimary: "bg-indigo-950",
        bgSecondary: "bg-indigo-900",
        bgCard: "bg-indigo-900",
        textPrimary: "text-indigo-100",
        textSecondary: "text-indigo-300",
        textAccent: "text-violet-400",
        textTitleGradient: "from-indigo-200 via-violet-300 to-purple-400",
        border: "border-indigo-700",
        borderHover: "hover:border-violet-400/50",
        buttonBg: "bg-violet-500",
        buttonText: "text-indigo-950",
        buttonHover: "hover:bg-violet-400",
        placeholderBg: "bg-indigo-800",
        placeholderText: "text-indigo-400",
        chatBg: "bg-indigo-900",
        chatHeaderBg: "bg-indigo-800",
        chatInputBorder: "border-indigo-700",
        chatInputBg: "bg-indigo-700",
        chatInputPlaceholder: "placeholder-indigo-400",
        chatUserBg: "bg-violet-500",
        chatUserText: "text-indigo-950",
        chatModelBg: "bg-indigo-800",
        chatModelText: "text-indigo-100",
        chatLoaderBg: "bg-indigo-400",
    },
    desert: {
        id: 'desert',
        name: 'Desert',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sunrise"><path d="M12 2v2"/><path d="m5 10 1-1"/><path d="m19 10 1-1"/><path d="M12 16a6 6 0 0 0 0 12"/><path d="m3 16 1-1"/><path d="m21 16-1-1"/><path d="m8 20 2-2"/><path d="m16 20-2-2"/></svg>,
        bgPrimary: "bg-stone-100",
        bgSecondary: "bg-stone-200",
        bgCard: "bg-white",
        textPrimary: "text-stone-900",
        textSecondary: "text-stone-600",
        textAccent: "text-orange-700",
        textTitleGradient: "from-stone-700 via-stone-900 to-amber-900",
        border: "border-stone-300",
        borderHover: "hover:border-orange-700/50",
        buttonBg: "bg-orange-700",
        buttonText: "text-white",
        buttonHover: "hover:bg-orange-600",
        placeholderBg: "bg-stone-50",
        placeholderText: "text-stone-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-stone-100",
        chatInputBorder: "border-stone-200",
        chatInputBg: "bg-stone-100",
        chatInputPlaceholder: "placeholder-stone-500",
        chatUserBg: "bg-orange-700",
        chatUserText: "text-white",
        chatModelBg: "bg-stone-100",
        chatModelText: "text-stone-900",
        chatLoaderBg: "bg-stone-600",
    },
    grape: {
        id: 'grape',
        name: 'Grape',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grape"><path d="M22 6c0 4-4 8-10 8S2 10 2 6"/><path d="M12 14c-6 0-10 4-10 8s4 8 10 8"/><path d="M22 14c-6 0-10 4-10 8s4 8 10 8"/></svg>,
        bgPrimary: "bg-purple-950",
        bgSecondary: "bg-purple-900",
        bgCard: "bg-purple-900",
        textPrimary: "text-purple-100",
        textSecondary: "text-purple-300",
        textAccent: "text-pink-400",
        textTitleGradient: "from-purple-200 via-pink-300 to-fuchsia-400",
        border: "border-purple-700",
        borderHover: "hover:border-pink-400/50",
        buttonBg: "bg-pink-500",
        buttonText: "text-purple-950",
        buttonHover: "hover:bg-pink-400",
        placeholderBg: "bg-purple-800",
        placeholderText: "text-purple-400",
        chatBg: "bg-purple-900",
        chatHeaderBg: "bg-purple-800",
        chatInputBorder: "border-purple-700",
        chatInputBg: "bg-purple-700",
        chatInputPlaceholder: "placeholder-purple-400",
        chatUserBg: "bg-pink-500",
        chatUserText: "text-purple-950",
        chatModelBg: "bg-purple-800",
        chatModelText: "text-purple-100",
        chatLoaderBg: "bg-purple-400",
    },
    sky: {
        id: 'sky',
        name: 'Sky',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-sun"><path d="M12 2v2"/><path d="m4.9 10 1-1"/><path d="m19.1 10-1-1"/><path d="M14 16a6 6 0 0 0 0 12"/><path d="m3 16 1-1"/><path d="m21 16-1-1"/><path d="m8 20 2-2"/><path d="m16 20-2-2"/></svg>,
        bgPrimary: "bg-sky-50",
        bgSecondary: "bg-sky-100",
        bgCard: "bg-white",
        textPrimary: "text-sky-900",
        textSecondary: "text-sky-600",
        textAccent: "text-blue-500",
        textTitleGradient: "from-sky-700 via-blue-800 to-indigo-900",
        border: "border-sky-300",
        borderHover: "hover:border-blue-500/50",
        buttonBg: "bg-blue-500",
        buttonText: "text-white",
        buttonHover: "hover:bg-blue-400",
        placeholderBg: "bg-sky-50",
        placeholderText: "text-sky-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-sky-100",
        chatInputBorder: "border-sky-200",
        chatInputBg: "bg-sky-100",
        chatInputPlaceholder: "placeholder-sky-500",
        chatUserBg: "bg-blue-500",
        chatUserText: "text-white",
        chatModelBg: "bg-sky-100",
        chatModelText: "text-sky-900",
        chatLoaderBg: "bg-blue-600",
    },
    fire: {
        id: 'fire',
        name: 'Fire',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame"><path d="M18 10c-1.2-1.2-3-2-5-2-1.2 0-2.8.8-4 2-1.2 1.2-2 3-2 5-2.2 2.2-2.5 4.5-2.5 5.5s.8 1.5 1.5 1.5c.7 0 1.5-.8 1.5-1.5s.3-3.3 2.5-5.5c1.2-1.2 3-2 5-2 1.2 0 2.8.8 4 2 1.2 1.2 2 3 2 5 2.2 2.2 2.5 4.5 2.5 5.5s-.8 1.5-1.5 1.5c-.7 0-1.5-.8-1.5-1.5s-.3-3.3-2.5-5.5z"/></svg>,
        bgPrimary: "bg-red-950",
        bgSecondary: "bg-red-900",
        bgCard: "bg-red-900",
        textPrimary: "text-red-100",
        textSecondary: "text-red-300",
        textAccent: "text-orange-400",
        textTitleGradient: "from-orange-200 via-orange-300 to-yellow-400",
        border: "border-red-700",
        borderHover: "hover:border-orange-400/50",
        buttonBg: "bg-orange-500",
        buttonText: "text-red-950",
        buttonHover: "hover:bg-orange-400",
        placeholderBg: "bg-red-800",
        placeholderText: "text-red-400",
        chatBg: "bg-red-900",
        chatHeaderBg: "bg-red-800",
        chatInputBorder: "border-red-700",
        chatInputBg: "bg-red-700",
        chatInputPlaceholder: "placeholder-red-400",
        chatUserBg: "bg-orange-500",
        chatUserText: "text-red-950",
        chatModelBg: "bg-red-800",
        chatModelText: "text-red-100",
        chatLoaderBg: "bg-red-400",
    },
    mint: {
        id: 'mint',
        name: 'Mint',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf"><path d="M2 13c3.5-3.5 12-5 18 0 0 0-4 4-8 8s-8-4-10-6z"/></svg>,
        bgPrimary: "bg-teal-50",
        bgSecondary: "bg-teal-100",
        bgCard: "bg-white",
        textPrimary: "text-teal-900",
        textSecondary: "text-teal-600",
        textAccent: "text-emerald-600",
        textTitleGradient: "from-teal-700 via-emerald-900 to-green-900",
        border: "border-teal-200",
        borderHover: "hover:border-emerald-600/50",
        buttonBg: "bg-emerald-600",
        buttonText: "text-white",
        buttonHover: "hover:bg-emerald-500",
        placeholderBg: "bg-teal-50",
        placeholderText: "text-teal-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-teal-100",
        chatInputBorder: "border-teal-200",
        chatInputBg: "bg-teal-100",
        chatInputPlaceholder: "placeholder-teal-500",
        chatUserBg: "bg-emerald-600",
        chatUserText: "text-white",
        chatModelBg: "bg-teal-100",
        chatModelText: "text-teal-900",
        chatLoaderBg: "bg-teal-600",
    },

};

// Background animation component for the floating bubbles
const BackgroundAnimation = ({ theme }) => {
    const bubbles = Array.from({ length: 30 }, (_, i) => { // Reduced bubble count for a smoother, more elegant effect
        const size = `${2 + Math.random() * 4}rem`;
        const animationDelay = `${Math.random() * 20}s`;
        const animationDuration = `${25 + Math.random() * 25}s`; // Longer duration for a calmer float
        const opacity = 0.1 + Math.random() * 0.15; // Reduced max opacity for a more subtle look

        let bubbleColor = "";
        switch (theme.id) {
            case 'dark': bubbleColor = "bg-white/20"; break;
            case 'light': bubbleColor = "bg-neutral-400"; break;
            case 'ocean': bubbleColor = "bg-cyan-400"; break;
            case 'forest': bubbleColor = "bg-lime-400"; break;
            case 'rose': bubbleColor = "bg-fuchsia-400"; break;
            case 'slate': bubbleColor = "bg-sky-400"; break;
            case 'sunrise': bubbleColor = "bg-red-400"; break;
            case 'lavender': bubbleColor = "bg-violet-400"; break;
            case 'desert': bubbleColor = "bg-orange-400"; break;
            case 'grape': bubbleColor = "bg-pink-400"; break;
            case 'sky': bubbleColor = "bg-blue-400"; break;
            case 'fire': bubbleColor = "bg-yellow-400"; break;
            case 'mint': bubbleColor = "bg-emerald-400"; break;
            default: bubbleColor = "bg-neutral-400";
        }
        
        const direction = Math.floor(Math.random() * 4);
        let style = {
            width: size,
            height: size,
            animationDelay,
            animationDuration,
            opacity,
        };
        let animationClass = "";

        switch (direction) {
            case 0: // from bottom to top
                style.bottom = '-10%';
                style.left = `${Math.random() * 100}%`;
                animationClass = 'bubble-up';
                break;
            case 1: // from left to right
                style.left = '-10%';
                style.top = `${Math.random() * 100}%`;
                animationClass = 'bubble-right';
                break;
            case 2: // from top to bottom
                style.top = '-10%';
                style.left = `${Math.random() * 100}%`;
                animationClass = 'bubble-down';
                break;
            case 3: // from right to left
            default:
                style.right = '-10%';
                style.top = `${Math.random() * 100}%`;
                animationClass = 'bubble-left';
                break;
        }

        return (
            <li
                key={i}
                className={`absolute rounded-full list-none block z-0 ${bubbleColor} ${animationClass}`}
                style={style}
            ></li>
        );
    });

    return (
        <>
            <style>{`
                @keyframes bubble-up { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(20px, -25vh) rotate(45deg); } 50% { transform: translate(-20px, -50vh) rotate(90deg); } 75% { transform: translate(20px, -75vh) rotate(135deg); } 100% { transform: translate(0, -110vh) rotate(180deg); } }
                @keyframes bubble-down { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-20px, 25vh) rotate(-45deg); } 50% { transform: translate(20px, 50vh) rotate(-90deg); } 75% { transform: translate(-20px, 75vh) rotate(-135deg); } 100% { transform: translate(0, 110vh) rotate(-180deg); } }
                @keyframes bubble-left { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-25vw, 20px) rotate(45deg); } 50% { transform: translate(-50vw, -20px) rotate(90deg); } 75% { transform: translate(-75vw, 20px) rotate(135deg); } 100% { transform: translate(-110vw, 0) rotate(180deg); } }
                @keyframes bubble-right { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(25vw, -20px) rotate(-45deg); } 50% { transform: translate(50vw, 20px) rotate(-90deg); } 75% { transform: translate(75vw, -20px) rotate(-135deg); } 100% { transform: translate(110vw, 0) rotate(-180deg); } }
                .bubble-up { animation: bubble-up ease-in-out infinite; }
                .bubble-down { animation: bubble-down ease-in-out infinite; }
                .bubble-left { animation: bubble-left ease-in-out infinite; }
                .bubble-right { animation: bubble-right ease-in-out infinite; }
            `}</style>
            <ul className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                {bubbles}
            </ul>
        </>
    );
};

/**
 * A helper function to ensure a URL is valid for an external link.
 * It prepends "https://" if the protocol is missing.
 * @param {string} url The URL to format.
 * @returns {string} A valid, absolute URL.
 */
const formatUrl = (url) => {
    if (!url || typeof url !== 'string') return '#'; // Return a safe, non-navigating link if URL is missing
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

export default function App() {
    const [rooms, setRooms] = useState([]);
    const [services, setServices] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [packages, setPackages] = useState([]);
    const [resortInfo, setResortInfo] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [bannerData, setBannerData] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { role: "model", parts: [{ text: "Hello! I am your personal AI Concierge. How can I assist you with your stay at the Elysian Retreat today?" }] }
    ]);
    const [userMessage, setUserMessage] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

    // Banner Message State
    const [bannerMessage, setBannerMessage] = useState({ type: null, text: "" });

    // Function to show banner message with auto-dismiss
    const showBannerMessage = (type, text) => {
        setBannerMessage({ type, text });
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setBannerMessage({ type: null, text: "" });
        }, 5000);
    };

    // Booking Modals State
    const [isRoomBookingFormOpen, setIsRoomBookingFormOpen] = useState(false);
    const [isPackageBookingFormOpen, setIsPackageBookingFormOpen] = useState(false);
    const [isServiceBookingFormOpen, setIsServiceBookingFormOpen] = useState(false);
    const [isFoodOrderFormOpen, setIsFoodOrderFormOpen] = useState(false);
    const [isGeneralBookingOpen, setIsGeneralBookingOpen] = useState(false);

    const [bookingData, setBookingData] = useState({
        room_ids: [],
        guest_name: "",
        guest_mobile: "",
        guest_email: "",
        check_in: "",
        check_out: "",
        adults: 1,
        children: 0,
    });
    const [packageBookingData, setPackageBookingData] = useState({
        package_id: null,
        room_ids: [],
        guest_name: "",
        guest_mobile: "",
        guest_email: "",
        check_in: "",
        check_out: "",
        adults: 1,
        children: 0,
    });
    const [serviceBookingData, setServiceBookingData] = useState({
        service_id: null,
        guest_name: "",
        guest_mobile: "",
        guest_email: "",
        room_id: null,
    });
    const [foodOrderData, setFoodOrderData] = useState({
        room_id: null,
        items: {},
    });

    const [bookingMessage, setBookingMessage] = useState({ type: null, text: "" });
    const [isBookingLoading, setIsBookingLoading] = useState(false);

    const [currentTheme, setCurrentTheme] = useState(() => {
        const savedTheme = localStorage.getItem('selectedTheme');
        return savedTheme && themes[savedTheme] ? savedTheme : 'dark';
    });

    const theme = themes[currentTheme];

    const bannerRef = useRef(null);
    const chatMessagesRef = useRef(null);
    const isBannerVisible = useOnScreen(bannerRef);
    
    const ITEM_PLACEHOLDER = "https://placehold.co/400x300/2d3748/cbd5e0?text=Image+Not+Available";

    // *** FIX: Added useEffect to fetch all resort data on component mount ***
    useEffect(() => {
        const fetchResortData = async () => {
            const API_BASE_URL = process.env.NODE_ENV === 'production' ? "https://www.teqmates.com" : "http://127.0.0.1:8000";
            const endpoints = {
                rooms: '/rooms/test',  // Use working test endpoint for real room data
                foodItems: '/food-items/',
                packages: '/packages/',
                resortInfo: '/resort-info/',
                gallery: '/gallery/',
                reviews: '/reviews/',
                banners: '/header-banner/'
            };

            try {
                const responses = await Promise.all(
                    Object.values(endpoints).map(endpoint => fetch(`${API_BASE_URL}${endpoint}`))
                );

                for (const res of responses) {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status} for ${res.url}`);
                    }
                }

                const data = await Promise.all(responses.map(res => res.json()));

                const [
                    roomsData, foodItemsData, packagesData,
                    resortInfoData, galleryData, reviewsData, bannerData
                ] = data;

                setRooms(roomsData);
                setServices([]); // Set empty array since services endpoint is not available
                setFoodItems(foodItemsData);
                setPackages(packagesData);
                setResortInfo(resortInfoData.length > 0 ? resortInfoData[0] : null);
                setGalleryImages(galleryData);
                setReviews(reviewsData);
                setBannerData(bannerData);

            } catch (err) {
                console.error("Failed to fetch resort data:", err);
                setError("Failed to load resort data. Please ensure the backend server is running and accessible.");
            } finally {
                setLoading(false);
            }
        };

        fetchResortData();
    }, []); // Empty dependency array ensures this runs only once on mount

    const toggleChat = () => setIsChatOpen(!isChatOpen);
    const changeTheme = (themeId) => setCurrentTheme(themeId);

    // Handlers for opening booking modals
    const handleOpenRoomBookingForm = (roomId) => {
        setBookingData(prev => ({ ...prev, room_ids: [roomId] }));
        setIsRoomBookingFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    const handleOpenPackageBookingForm = (packageId) => {
        setPackageBookingData({ ...packageBookingData, package_id: packageId });
        setIsPackageBookingFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    const handleOpenServiceBookingForm = (serviceId) => {
        setServiceBookingData({ ...serviceBookingData, service_id: serviceId });
        setIsServiceBookingFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    const handleOpenFoodOrderForm = () => {
        setIsFoodOrderFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    // Handlers for form changes
    const handleRoomBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoomSelection = (roomId) => {
        setBookingData(prev => {
            const newRoomIds = prev.room_ids.includes(roomId)
                ? prev.room_ids.filter(id => id !== roomId)
                : [...prev.room_ids, roomId];
            return { ...prev, room_ids: newRoomIds };
        });
    };

    const handlePackageBookingChange = (e) => {
        const { name, value } = e.target;
        setPackageBookingData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceBookingChange = (e) => {
        const { name, value } = e.target;
        setServiceBookingData(prev => ({ ...prev, [name]: value }));
    };

    const handlePackageRoomSelection = (roomId) => {
        setPackageBookingData(prev => {
            const newRoomIds = prev.room_ids.includes(roomId)
                ? prev.room_ids.filter(id => id !== roomId)
                : [...prev.room_ids, roomId];
            return { ...prev, room_ids: newRoomIds };
        });
    };

    const handleFoodOrderChange = (e, foodItemId) => {
        const { value } = e.target;
        setFoodOrderData(prev => ({
            ...prev,
            items: {
                ...prev.items,
                [foodItemId]: parseInt(value) || 0,
            }
        }));
    };

    // Handlers for form submissions
    const handleRoomBookingSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isBookingLoading) {
            return;
        }
        
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        if (bookingData.room_ids.length === 0) {
            showBannerMessage("error", "Please select at least one room before booking.");
            setIsBookingLoading(false);
            return;
        }

        // --- MINIMUM BOOKING DURATION VALIDATION ---
        if (bookingData.check_in && bookingData.check_out) {
            const checkInDate = new Date(bookingData.check_in);
            const checkOutDate = new Date(bookingData.check_out);
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            
            if (daysDiff < 1) {
                showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
                setIsBookingLoading(false);
                return;
            }
        }

        // --- CAPACITY VALIDATION ---
        const totalGuests = parseInt(bookingData.adults) + parseInt(bookingData.children);
        const selectedRoomDetails = bookingData.room_ids.map(roomId => rooms.find(r => r.id === roomId)).filter(Boolean);
        const totalCapacity = selectedRoomDetails.reduce((sum, room) => sum + (room.adults || 0) + (room.children || 0), 0);

        if (totalGuests > totalCapacity) {
            showBannerMessage("error", `Guest count (${totalGuests}) exceeds the total capacity (${totalCapacity}) of the selected rooms.`);
            setIsBookingLoading(false);
            return;
        }
        // -------------------------

        try {
            const API_BASE_URL = process.env.NODE_ENV === 'production' ? "https://www.teqmates.com" : "http://127.0.0.1:8000";
            const response = await fetch(`${API_BASE_URL}/bookings/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                showBannerMessage("success", "Room booking successful! We look forward to your stay.");
                setBookingData({ room_ids: [], guest_name: "", guest_mobile: "", guest_email: "", check_in: "", check_out: "", adults: 1, children: 0 });
                // Close the booking form after successful booking
                setTimeout(() => {
                    setIsRoomBookingFormOpen(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                // Check if it's a validation error from the backend
                if (errorData.detail && errorData.detail.includes("Check-out date must be at least 1 day")) {
                    showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
                } else {
                    showBannerMessage("error", `Booking failed: ${errorData.detail || "An unexpected error occurred."}`);
                }
            }
        } catch (err) {
            console.error("Booking API Error:", err);
            showBannerMessage("error", "An error occurred while booking. Please try again.");
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handlePackageBookingSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isBookingLoading) {
            return;
        }
        
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        if (packageBookingData.room_ids.length === 0) {
            showBannerMessage("error", "Please select at least one room for the package.");
            setIsBookingLoading(false);
            return;
        }

        // --- MINIMUM BOOKING DURATION VALIDATION ---
        if (packageBookingData.check_in && packageBookingData.check_out) {
            const checkInDate = new Date(packageBookingData.check_in);
            const checkOutDate = new Date(packageBookingData.check_out);
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            
            if (daysDiff < 1) {
                showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
                setIsBookingLoading(false);
                return;
            }
        }

        // --- CAPACITY VALIDATION ---
        const totalGuests = parseInt(packageBookingData.adults) + parseInt(packageBookingData.children);
        const selectedRoomDetails = packageBookingData.room_ids.map(roomId => rooms.find(r => r.id === roomId)).filter(Boolean);
        const totalCapacity = selectedRoomDetails.reduce((sum, room) => sum + (room.adults || 0) + (room.children || 0), 0);

        if (totalGuests > totalCapacity) {
            showBannerMessage("error", `Guest count (${totalGuests}) exceeds the total capacity (${totalCapacity}) of the selected rooms for this package.`);
            setIsBookingLoading(false);
            return;
        }
        // -------------------------

        try {
            const API_BASE_URL = process.env.NODE_ENV === 'production' ? "https://www.teqmates.com" : "http://127.0.0.1:8000";
            const payload = {
                ...packageBookingData,
                room_ids: packageBookingData.room_ids.map(id => parseInt(id)),
            };
            const response = await fetch(`${API_BASE_URL}/packages/book/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showBannerMessage("success", "Package booking successful! We look forward to your stay.");
                setPackageBookingData({ package_id: null, room_ids: [], guest_name: "", guest_mobile: "", guest_email: "", check_in: "", check_out: "", adults: 1, children: 0 });
                // Close the booking form after successful booking
                setTimeout(() => {
                    setIsPackageBookingFormOpen(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                // Check if it's a validation error from the backend
                if (errorData.detail && errorData.detail.includes("Check-out date must be at least 1 day")) {
                    showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
                } else {
                    showBannerMessage("error", `Package booking failed: ${errorData.detail || "An unexpected error occurred."}`);
                }
            }
        } catch (err) {
            console.error("Package Booking API Error:", err);
            showBannerMessage("error", "An error occurred while booking the package. Please try again.");
        } finally {
            setIsBookingLoading(false);
        }
    };
    
    const handleServiceBookingSubmit = async (e) => {
        e.preventDefault();
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        try {
            const API_BASE_URL = process.env.NODE_ENV === 'production' ? "https://www.teqmates.com" : "http://127.0.0.1:8000";
            const response = await fetch(`${API_BASE_URL}/services/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceBookingData)
            });

            if (response.ok) {
                showBannerMessage("success", "Service booking successful! Our staff will be with you shortly.");
                setServiceBookingData({ service_id: null, guest_name: "", guest_mobile: "", guest_email: "", room_id: null });
                // Close the booking form after successful booking
                setTimeout(() => {
                    setIsServiceBookingFormOpen(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                showBannerMessage("error", `Service booking failed: ${errorData.detail || "An unexpected error occurred."}`);
            }
        } catch (err) {
            console.error("Service Booking API Error:", err);
            showBannerMessage("error", "An error occurred while booking the service. Please try again.");
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handleFoodOrderSubmit = async (e) => {
        e.preventDefault();
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        const itemsPayload = Object.entries(foodOrderData.items)
                                .filter(([, quantity]) => quantity > 0)
                                .map(([food_item_id, quantity]) => ({ food_item_id: parseInt(food_item_id), quantity }));
        
        if (itemsPayload.length === 0) {
            showBannerMessage("error", "Please select at least one food item.");
            setIsBookingLoading(false);
            return;
        }

        const payload = {
            room_id: foodOrderData.room_id,
            items: itemsPayload,
            amount: 0, // Amount will be calculated by the backend
            assigned_employee_id: 0,
            billing_status: "unbilled"
        };
        
        try {
            const API_BASE_URL = process.env.NODE_ENV === 'production' ? "https://www.teqmates.com" : "http://127.0.0.1:8000";
            const response = await fetch(`${API_BASE_URL}/food-orders/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showBannerMessage("success", "Food order placed successfully! Your meal will be delivered shortly.");
                setFoodOrderData({ room_id: null, items: {} });
                // Close the booking form after successful order
                setTimeout(() => {
                    setIsFoodOrderFormOpen(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                showBannerMessage("error", `Food order failed: ${errorData.detail || "An unexpected error occurred."}`);
            }
        } catch (err) {
            console.error("Food Order API Error:", err);
            showBannerMessage("error", "An error occurred while placing the food order. Please try again.");
        } finally {
            setIsBookingLoading(false);
        }
    };
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userMessage.trim() || isChatLoading) return;

        const newUserMessage = { role: "user", parts: [{ text: userMessage }] };
        setChatHistory(prev => [...prev, newUserMessage]);
        setUserMessage("");
        setIsChatLoading(true);

        try {
            // Replace with your actual Gemini API key
            const apiKey = "YOUR_GEMINI_API_KEY";
            if (apiKey === "YOUR_GEMINI_API_KEY") {
                 setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "Please replace 'YOUR_GEMINI_API_KEY' with your actual API key in App.js." }] }]);
                 setIsChatLoading(false);
                 return;
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const payload = { contents: [...chatHistory, newUserMessage] };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API call failed: ${response.status}`);

            const result = await response.json();
            const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (botResponse) {
                setChatHistory(prev => [...prev, { role: "model", parts: [{ text: botResponse }] }]);
            } else {
                setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "I'm sorry, I couldn't generate a response." }] }]);
            }
        } catch (err) {
            console.error("Gemini API Error:", err);
            setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "I'm having trouble connecting. Please check your API key and network." }] }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        localStorage.setItem('selectedTheme', currentTheme);
    }, [currentTheme]);

    useEffect(() => {
        if (bannerData.length > 1) {
            const interval = setInterval(() => {
                setCurrentBannerIndex(prev => (prev + 1) % bannerData.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [bannerData]);

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const sectionTitleStyle = `text-3xl md:text-5xl font-extrabold mb-8 text-center tracking-tight bg-gradient-to-r ${theme.textTitleGradient} text-transparent bg-clip-text`;
    const cardStyle = `flex-none w-80 md:w-96 ${theme.bgCard} rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out border ${theme.border} ${theme.borderHover} transform group-hover:-translate-y-1 group-hover:shadow-lg`;
    const iconStyle = `w-6 h-6 ${theme.textAccent} transition-transform duration-300 group-hover:rotate-12`;
    const textPrimary = theme.textPrimary;
    const textSecondary = theme.textSecondary;
    const priceStyle = `font-bold text-xl ${theme.textAccent} tracking-wider`;
    const buttonStyle = `mt-4 inline-flex items-center text-sm font-semibold ${theme.textAccent} hover:text-white transition duration-300`;

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${theme.bgPrimary} ${theme.textPrimary}`}>
                <div className="flex flex-col items-center">
                    <svg className={`animate-spin h-10 w-10 ${theme.textAccent}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4">Loading resort data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${theme.bgPrimary} text-red-400`}>
                <p className={`p-4 ${theme.bgCard} rounded-lg shadow-lg`}>{error}</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
              @keyframes auto-scroll-bobbing { 0% { transform: translate(0, 0); } 25% { transform: translate(-12.5%, 3px); } 50% { transform: translate(-25%, 0); } 75% { transform: translate(-37.5%, -3px); } 100% { transform: translate(-50%, 0); } }
              @keyframes auto-scroll-bobbing-reverse { 0% { transform: translate(-50%, 0); } 25% { transform: translate(-37.5%, 3px); } 50% { transform: translate(-25%, 0); } 75% { transform: translate(-12.5%, -3px); } 100% { transform: translate(0, 0); } }
              @keyframes auto-scroll-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
              @keyframes auto-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
              .horizontal-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
              .horizontal-scroll-container::-webkit-scrollbar { display: none; }
              @keyframes bounce-dot { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
              .animate-bounce-dot > div { animation: bounce-dot 1.4s infinite ease-in-out both; }
            `}</style>

            <div className={`relative ${theme.bgPrimary} ${theme.textPrimary} font-sans min-h-screen transition-colors duration-500`}>
                <BackgroundAnimation theme={theme} />
                
                {/* Banner Message */}
                {bannerMessage.text && (
                    <div className={`fixed top-0 left-0 right-0 z-[60] p-4 ${bannerMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white text-center font-medium shadow-lg transform transition-transform duration-300`}>
                        <div className="flex items-center justify-center">
                            <span className="mr-2">
                                {bannerMessage.type === 'success' ? '✅' : '❌'}
                            </span>
                            {bannerMessage.text}
                        </div>
                    </div>
                )}
                
                <header className={`fixed left-0 right-0 z-50 ${theme.bgSecondary} bg-opacity-80 backdrop-blur-sm ${bannerMessage.text ? 'top-16' : 'top-0'}`}>
                    <div className="container mx-auto px-2 sm:px-4 md:px-12 py-2 sm:py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <BedDouble className={`w-6 h-6 sm:w-8 sm:h-8 ${theme.textAccent}`} />
                            <span className="text-lg sm:text-xl font-bold tracking-tight">Elysian Retreat</span>
                        </div>
                        <nav className="flex items-center space-x-2 sm:space-x-4">
                            <div className="relative">
                                <button onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                                    className={`p-1 sm:p-2 rounded-full transition-colors duration-300 ${theme.textSecondary} hover:${theme.textAccent}`}
                                    title="Change Theme">
                                    {themes[currentTheme].icon}
                                </button>
                                {isThemeDropdownOpen && (
                                    <div className={`absolute right-0 mt-2 w-40 sm:w-48 ${theme.bgCard} rounded-lg shadow-xl border ${theme.border} z-50`}>
                                        <div className="p-2 grid grid-cols-3 sm:grid-cols-4 gap-1">
                                            {Object.values(themes).map((t) => (
                                                <button key={t.id} onClick={() => { changeTheme(t.id); setIsThemeDropdownOpen(false); }}
                                                    className={`p-2 rounded-md transition-colors duration-300 ${t.id === currentTheme ? `${t.buttonBg} ${t.buttonText}` : `${theme.textSecondary} hover:${t.textAccent} hover:${theme.bgSecondary}`}`}
                                                    title={t.name}>
                                                    {t.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => setIsGeneralBookingOpen(true)} 
                                className={`px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base ${theme.buttonBg} ${theme.buttonText} font-bold rounded-full shadow-lg ${theme.buttonHover} transition-colors`}
                            >
                                Book Now
                            </button>
                        </nav>
                    </div>
                </header>

                <main className="w-full pt-12 sm:pt-16 space-y-8 sm:space-y-12 relative z-10 overflow-hidden">
                  {/* Banner Section */}
<div
  ref={bannerRef}
  className="relative w-full h-[80vh] overflow-hidden shadow-2xl mt-5 rounded-2xl"
>
    {bannerData.length > 0 ? (
        <>
            {/* Banner Images with Fade Transition */}
            {bannerData.map((banner, index) => (
                <img
                    key={banner.id}
                    src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com${banner.image_url}` : `http://127.0.0.1:8000${banner.image_url}`}
                    alt={banner.title}
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`}
                />
            ))}

            {/* Gradient Overlay and Text Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center text-center px-6">
                <div className="relative w-full max-w-3xl h-48">
                    {bannerData.map((banner, index) => (
                        <div key={banner.id} className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`}>
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-wide drop-shadow-xl text-white">
                                {banner.title}
                            </h1>
                            <p className="mt-4 text-lg md:text-xl text-neutral-200">
                                {banner.subtitle}
                            </p>
                            <a href="#rooms-section" className={`mt-6 inline-block px-8 py-3 text-white font-semibold ${theme.buttonBg} rounded-full shadow-xl ${theme.buttonHover} transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}>
                                Explore Rooms
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Carousel Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {bannerData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBannerIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentBannerIndex
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
        </>
    ) : (
        <div className={`w-full h-full flex items-center justify-center ${theme.placeholderBg} ${theme.placeholderText}`}>
            No banner images available.
        </div>
    )}
</div>


                    {/* Packages Section */}
                    <section>
                        <h2 className={`group ${sectionTitleStyle}`}>
                            <Package className={`inline-block mr-3 mb-1 ${iconStyle}`} /> Luxury Packages
                        </h2>
                        <div className="w-full overflow-hidden">
                            <div className="flex gap-6 animate-[auto-scroll_80s_linear_infinite] hover:[animation-play-state:paused]">
                                {packages.length > 0 ? [...packages, ...packages].map((pkg, index) => (
                                    <div key={`${pkg.id}-${index}`} className={`group ${cardStyle}`}>
                                        <img src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com/${pkg.images?.[0]?.image_url}` : `http://127.0.0.1:8000/${pkg.images?.[0]?.image_url}`} alt={pkg.title} className="w-full h-56 md:h-64 object-cover" onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} />
                                        <div className="p-6">
                                            <h3 className={`font-semibold text-xl mb-2 ${textPrimary}`}>{pkg.title}</h3>
                                            <p className={`mb-1 ${priceStyle}`}>₹{pkg.price}</p>
                                            <p className={`text-sm ${textSecondary}`}>{pkg.description}</p>
                                            <button onClick={() => handleOpenPackageBookingForm(pkg.id)} className={buttonStyle}>Book Package <ChevronRight className="ml-1 w-4 h-4" /></button>
                                        </div>
                                    </div>
                                )) : <p className={`flex-none w-full text-center ${textSecondary}`}>No packages available.</p>}
                            </div>
                        </div>
                    </section>
                    
                    {/* Rooms Section */}
                    <section id="rooms-section">
                        <h2 className={`group ${sectionTitleStyle}`}>
                            <BedDouble className={`inline-block mr-3 mb-1 ${iconStyle}`} /> Our Rooms
                        </h2>
                        <div className="w-full overflow-hidden">
                           <div className="flex gap-6 animate-[auto-scroll-bobbing-reverse_70s_linear_infinite] hover:[animation-play-state:paused]">
                                {rooms.length > 0 ? [...rooms, ...rooms].map((room, index) => (
                                    <div key={`${room.id}-${index}`} className={`group ${cardStyle}`}>
                                        <img src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com${room.image_url}` : `http://127.0.0.1:8000${room.image_url}`} alt={room.type} className="w-full h-56 md:h-64 object-cover" onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} />
                                        <div className="p-6">
                                            <h3 className={`font-semibold text-xl mb-2 ${textPrimary}`}>{room.type}</h3>
                                            <p className={`text-sm mb-1 ${textSecondary}`}>Room Number: {room.number}</p>
                                            <p className={`mb-1 ${priceStyle}`}>₹{room.price}</p>
                                            <p className={`font-semibold text-sm ${room.status === "Available" ? "text-green-400" : "text-red-400"}`}>{room.status}</p>
                                            <button onClick={() => handleOpenRoomBookingForm(room.id)} className={`${buttonStyle} disabled:opacity-50 disabled:cursor-not-allowed`} disabled={room.status !== "Available"}>
                                                Book Now <ChevronRight className="ml-1 w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )) : <p className={`flex-none w-full text-center ${textSecondary}`}>No rooms available.</p>}
                            </div>
                        </div>
                    </section>

                    {/* Services Section */}
                    <section>
                         <h2 className={`group ${sectionTitleStyle}`}>
                             <ConciergeBell className={`inline-block mr-3 mb-1 ${iconStyle}`} /> Exclusive Services
                         </h2>
                        <div className="w-full overflow-hidden">
                            <div className="flex gap-6 animate-[auto-scroll_60s_linear_infinite] hover:[animation-play-state:paused]">
                                 {services.length > 0 ? [...services, ...services].map((service, index) => (
                                     <div key={`${service.id}-${index}`} className={`group ${cardStyle} p-6 flex flex-col justify-between`}>
                                         <div>
                                             <h3 className={`font-semibold text-xl mb-2 ${textPrimary}`}>{service.name}</h3>
                                             <p className={`text-sm mb-4 ${textSecondary}`}>{service.description}</p>
                                         </div>
                                         <p className={priceStyle}>Charges: ₹{service.charges}</p>
                                          {/* <button onClick={() => handleOpenServiceBookingForm(service.id)} className={buttonStyle}>Book Service <ChevronRight className="ml-1 w-4 h-4" /></button> */}
                                     </div>
                                 )) : <p className={`flex-none w-full text-center ${textSecondary}`}>No services available.</p>}
                             </div>
                         </div>
                    </section>

                    {/* Food Items Section */}
                    <section>
                        <h2 className={`group ${sectionTitleStyle}`}>
                            <Coffee className={`inline-block mr-3 mb-1 ${iconStyle}`} /> Gourmet Cuisine
                        </h2>
                        <div className="w-full overflow-hidden">
                           <div className="flex gap-6 animate-[auto-scroll-reverse_80s_linear_infinite] hover:[animation-play-state:paused]">
                                {foodItems.length > 0 ? [...foodItems, ...foodItems].map((food, index) => (
                                    <div key={`${food.id}-${index}`} className={`group ${cardStyle}`}>
                                        <img src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com/${food.images?.[0]?.image_url}` : `http://127.0.0.1:8000/${food.images?.[0]?.image_url}`} alt={food.name} className="w-full h-56 md:h-64 object-cover" onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} />
                                        <div className="p-6">
                                            <h3 className={`font-semibold text-xl mb-2 ${textPrimary}`}>{food.name}</h3>
                                            <p className={`mb-1 ${priceStyle}`}>₹{food.price}</p>
                                            <p className={`font-semibold text-sm ${food.available ? "text-green-400" : "text-red-400"}`}>{food.available ? "Available" : "Unavailable"}</p>
                                        </div>
                                    </div>
                                )) : <p className={`flex-none w-full text-center ${textSecondary}`}>No food items available.</p>}
                            </div>
                        </div>
                    </section>

                    {/* Gallery Section */}
                    <section className="mt-12">
                        <h2 className={`group ${sectionTitleStyle}`}>
                            <ImageIcon className={`inline-block mr-3 mb-1 ${iconStyle}`} /> Gallery
                        </h2>
                        <div className="w-full overflow-hidden">
                            <div className="flex gap-6 animate-[auto-scroll_75s_linear_infinite] hover:[animation-play-state:paused]">
                                {galleryImages.length > 0 ? [...galleryImages, ...galleryImages].map((image, index) => (
                                    <div key={`${image.id}-${index}`} className="flex-none w-64 h-48 md:w-80 md:h-64 rounded-2xl overflow-hidden shadow-2xl transition duration-500 hover:scale-105">
                                        <img src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com${image.image_url}` : `http://127.0.0.1:8000${image.image_url}`} alt={image.caption || 'Gallery image'} className="w-full h-full object-cover" onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} />
                                    </div>
                                )) : <p className={`flex-none w-full text-center ${textSecondary}`}>No images available.</p>}
                            </div>
                        </div>
                    </section>
                    
                    {/* Reviews Section */}
                    <section>
                        <h2 className={`group ${sectionTitleStyle}`}>
                            <Quote className={`inline-block mr-3 mb-1 ${iconStyle}`} /> What Our Guests Say
                        </h2>
                        <div className="w-full overflow-hidden" >
                           <div className="flex gap-6 animate-[auto-scroll-bobbing-reverse_90s_linear_infinite] hover:[animation-play-state:paused]" >
                                {reviews.length > 0 ? [...reviews, ...reviews].map((review, index) => (
                                    <div key={`${review.id}-${index}`} className={`group flex-none w-80 md:w-96 ${theme.bgCard} rounded-3xl p-8 shadow-2xl border ${theme.border}`} >
                                        <div className="flex justify-center mb-4" >
                                            {[...Array(review.rating)].map((_, i) => <Star key={i} className={`w-5 h-5 fill-current ${theme.textAccent}`} />)}
                                            {[...Array(5 - review.rating)].map((_, i) => <Star key={i + review.rating} className={`${theme.textSecondary} w-5 h-5`} />)}
                                        </div>
                                        <p className={`text-sm italic mb-4 ${textSecondary}`} >{`"${review.comment}"`}</p>
                                        <p className={`font-semibold ${textPrimary}`} >- {review.guest_name}</p>
                                    </div>
                                )) : <p className={`flex-none w-full text-center ${textSecondary}`} >No reviews available.</p>}
                            </div >
                        </div>
                    </section>
                </main>

                {/* Floating UI Elements */}
                <button onClick={scrollToTop} className={`fixed bottom-8 right-8 p-3 rounded-full ${theme.buttonBg} ${theme.buttonText} shadow-lg transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} aria-label="Back to Top">
                    <ChevronUp className="w-6 h-6" />
                </button>

                <button onClick={toggleChat} className={`fixed bottom-8 left-8 p-4 rounded-full ${theme.buttonBg} ${theme.buttonText} shadow-lg transition-all duration-300 z-50 ${theme.buttonHover}`} aria-label="Open Chat">
                    <MessageSquare className="w-6 h-6" />
                </button>

                {/* AI Concierge Chat Modal */}
                {isChatOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-end justify-center">
                        <div className={`w-full max-w-lg h-3/4 md:h-4/5 ${theme.chatBg} rounded-t-3xl shadow-2xl flex flex-col`}>
                            <div className={`${theme.chatHeaderBg} p-4 rounded-t-3xl flex items-center justify-between border-b ${theme.chatInputBorder}`}>
                                <h3 className="text-lg font-bold flex items-center"><MessageSquare className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> AI Concierge</h3>
                                <button onClick={toggleChat} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <div ref={chatMessagesRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-xl max-w-xs md:max-w-md shadow-lg ${msg.role === 'user' ? `${theme.chatUserBg} ${theme.chatUserText} rounded-br-none` : `${theme.chatModelBg} ${theme.chatModelText} rounded-bl-none`}`}>
                                            <p className="text-sm break-words">{msg.parts[0].text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className={`p-3 rounded-xl ${theme.chatModelBg} shadow-lg`}>
                                            <div className="flex items-center space-x-2 animate-bounce-dot">
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0s' }}></div>
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0.2s' }}></div>
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleSendMessage} className={`p-4 border-t ${theme.chatInputBorder} ${theme.chatHeaderBg} flex items-center`}>
                                <input type="text" value={userMessage} onChange={(e) => setUserMessage(e.target.value)} placeholder="Ask me anything..."
                                    className={`flex-1 p-3 rounded-full ${theme.chatInputBg} ${theme.textPrimary} ${theme.chatInputPlaceholder} focus:outline-none focus:ring-2 focus:ring-amber-500`} />
                                <button type="submit" className={`ml-2 p-3 rounded-full ${theme.buttonBg} ${theme.buttonText} ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={!userMessage.trim() || isChatLoading}>
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                
                {/* General Booking Modal */}
                {isGeneralBookingOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-md ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><BedDouble className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Start Your Booking</h3>
                                <button onClick={() => setIsGeneralBookingOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className={`${theme.textSecondary} text-center`}>How would you like to book your stay?</p>
                                <button 
                                    onClick={() => { setIsGeneralBookingOpen(false); setIsRoomBookingFormOpen(true); }}
                                    className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors flex items-center justify-center space-x-2`}
                                >
                                    <BedDouble className="w-5 h-5" />
                                    <span>Book a Room</span>
                                </button>
                                <button 
                                    onClick={() => { setIsGeneralBookingOpen(false); setIsPackageBookingFormOpen(true); }}
                                    className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors flex items-center justify-center space-x-2`}
                                >
                                    <Package className="w-5 h-5" />
                                    <span>Book a Package</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Room Booking Modal */}
                {isRoomBookingFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><BedDouble className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Book a Room</h3>
                                <button onClick={() => setIsRoomBookingFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleRoomBookingSubmit} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Select Room(s)</label>
                                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-3 rounded-xl ${theme.bgSecondary}`}>
                                        {rooms.filter(r => r.status === 'Available').map(room => (
                                            <div key={room.id} onClick={() => handleRoomSelection(room.id)}
                                                className={`rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden ${bookingData.room_ids.includes(room.id) ? `${theme.buttonBg} ${theme.buttonText} border-transparent` : `${theme.bgCard} ${theme.textPrimary} ${theme.border} hover:border-amber-500`}`}
                                            >
                                                <img 
                                                    src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com${room.image_url}` : `http://127.0.0.1:8000${room.image_url}`} 
                                                    alt={room.type} 
                                                    className="w-full h-20 object-cover" 
                                                    onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                />
                                                <div className="p-2 text-center">
                                                    <p className="font-semibold text-xs">Room {room.number}</p>
                                                    <p className="text-xs opacity-80">{room.type}</p>
                                                    <p className="text-xs opacity-60 mt-1">Max: {room.adults}A, {room.children}C</p>
                                                    <p className="text-xs font-bold mt-1">₹{room.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Full Name</label>
                                    <input type="text" name="guest_name" value={bookingData.guest_name} onChange={handleRoomBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={bookingData.guest_email} onChange={handleRoomBookingChange} placeholder="user@example.com" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={bookingData.guest_mobile} onChange={handleRoomBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-in Date</label>
                                        <input type="date" name="check_in" value={bookingData.check_in} onChange={handleRoomBookingChange} required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-out Date</label>
                                        <input type="date" name="check_out" value={bookingData.check_out} onChange={handleRoomBookingChange} required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Adults</label>
                                        <input type="number" name="adults" value={bookingData.adults} onChange={handleRoomBookingChange} min="1" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Children</label>
                                        <input type="number" name="children" value={bookingData.children} onChange={handleRoomBookingChange} min="0" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Package Booking Modal */}
                {isPackageBookingFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><Package className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Book a Package</h3>
                                <button onClick={() => setIsPackageBookingFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handlePackageBookingSubmit} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Package ID</label>
                                    <input type="number" name="package_id" value={packageBookingData.package_id || ''} readOnly className={`w-full p-3 rounded-xl ${theme.placeholderBg} ${theme.placeholderText} focus:outline-none`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Select Room(s) for Package</label>
                                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-3 rounded-xl ${theme.bgSecondary}`}>
                                        {rooms.filter(r => r.status === 'Available').map(room => (
                                            <div key={room.id} onClick={() => handlePackageRoomSelection(room.id)}
                                                className={`rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden ${packageBookingData.room_ids.includes(room.id) ? `${theme.buttonBg} ${theme.buttonText} border-transparent` : `${theme.bgCard} ${theme.textPrimary} ${theme.border} hover:border-amber-500`}`}
                                            >
                                                <img 
                                                    src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com${room.image_url}` : `http://127.0.0.1:8000${room.image_url}`} 
                                                    alt={room.type} 
                                                    className="w-full h-20 object-cover" 
                                                    onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                />
                                                <div className="p-2 text-center">
                                                    <p className="font-semibold text-xs">Room {room.number}</p>
                                                    <p className="text-xs opacity-80">{room.type}</p>
                                                    <p className="text-xs opacity-60 mt-1">Max: {room.adults}A, {room.children}C</p>
                                                    <p className="text-xs font-bold mt-1">₹{room.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Full Name</label>
                                    <input type="text" name="guest_name" value={packageBookingData.guest_name} onChange={handlePackageBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={packageBookingData.guest_email} onChange={handlePackageBookingChange} placeholder="user@example.com" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={packageBookingData.guest_mobile} onChange={handlePackageBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-in Date</label>
                                        <input type="date" name="check_in" value={packageBookingData.check_in} onChange={handlePackageBookingChange} required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-out Date</label>
                                        <input type="date" name="check_out" value={packageBookingData.check_out} onChange={handlePackageBookingChange} required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Adults</label>
                                        <input type="number" name="adults" value={packageBookingData.adults} onChange={handlePackageBookingChange} min="1" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Children</label>
                                        <input type="number" name="children" value={packageBookingData.children} onChange={handlePackageBookingChange} min="0" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
                
                {/* Service Booking Modal */}
                {isServiceBookingFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><ConciergeBell className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Book a Service</h3>
                                <button onClick={() => setIsServiceBookingFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleServiceBookingSubmit} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Service ID</label>
                                    <input type="number" name="service_id" value={serviceBookingData.service_id || ''} readOnly className={`w-full p-3 rounded-xl ${theme.placeholderBg} ${theme.placeholderText} focus:outline-none`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Full Name</label>
                                    <input type="text" name="guest_name" value={serviceBookingData.guest_name} onChange={handleServiceBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={serviceBookingData.guest_email} onChange={handleServiceBookingChange} placeholder="user@example.com" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={serviceBookingData.guest_mobile} onChange={handleServiceBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Room ID (Optional)</label>
                                    <input type="number" name="room_id" value={serviceBookingData.room_id || ''} onChange={handleServiceBookingChange} placeholder="Enter your room ID if assigned" className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
                
                {/* Food Order Modal */}
                {isFoodOrderFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><Coffee className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Place a Food Order</h3>
                                <button onClick={() => setIsFoodOrderFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleFoodOrderSubmit} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Room ID</label>
                                    <input type="number" name="room_id" value={foodOrderData.room_id || ''} onChange={(e) => setFoodOrderData(prev => ({ ...prev, room_id: parseInt(e.target.value) || '' }))} placeholder="Enter your room ID" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <h4 className={`text-md font-semibold ${theme.textPrimary}`}>Select Items:</h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto">
                                    {foodItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <img src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com/${item.images?.[0]?.image_url}` : `http://127.0.0.1:8000/${item.images?.[0]?.image_url}`} alt={item.name} className="w-12 h-12 object-cover rounded-full" />
                                                <div>
                                                    <p className={`font-semibold ${theme.textPrimary}`}>{item.name}</p>
                                                    <p className={`text-sm ${theme.textSecondary}`}>₹{item.price}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={foodOrderData.items[item.id] || 0}
                                                onChange={(e) => handleFoodOrderChange(e, item.id)}
                                                className={`w-20 p-2 text-center rounded-lg ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Placing Order...' : 'Place Order'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
                
                <footer className={`${theme.bgSecondary} py-8 px-4 md:px-12 mt-12`}>
                    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        {resortInfo && (
                            <>
                                <div className="text-center md:text-left">
                                    <h3 className={`text-xl font-bold tracking-tight ${theme.textPrimary}`}>{resortInfo.name}</h3>
                                    <p className={`text-sm ${theme.textSecondary} mt-1`}>{resortInfo.address}</p>
                                    <p className={`text-xs ${theme.textSecondary} mt-2`}>&copy; 2024 Elysian Retreat. All Rights Reserved.</p>
                                </div>
                                <div className="flex space-x-4">
                                    <a href={formatUrl(resortInfo.facebook)} target="_blank" rel="noopener noreferrer" className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Facebook /></a>
                                    <a href={formatUrl(resortInfo.instagram)} target="_blank" rel="noopener noreferrer" className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Instagram /></a>
                                    <a href={formatUrl(resortInfo.twitter)} target="_blank" rel="noopener noreferrer" className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Twitter /></a>
                                    <a href={formatUrl(resortInfo.linkedin)} target="_blank" rel="noopener noreferrer" className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Linkedin /></a>
                                </div>
                            </>
                        )}
                    </div>
                </footer>
            </div>
        </>
    );
}