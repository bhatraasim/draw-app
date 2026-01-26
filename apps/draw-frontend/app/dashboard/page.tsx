"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { LogOut, Plus, LayoutGrid, Loader2, Search } from "lucide-react";
import { BACKEND_URL } from "../conif";

// Define the shape of a Room object
interface Room {
  _id: string;
  slug: string;
  adimId: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  
  // State Management
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [slugInput, setSlugInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // Configuration
  // 1. Fetch Rooms on Component Mount
  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem("token");
      
      // Security Check: Redirect if no token
      if (!token) {
        router.push("/signin");
        return;
      }

      try {
        const response = await axios.get(`${BACKEND_URL}/getRooms`, {
          headers: { Authorization: token },
        });
        setRooms(response.data.rooms);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
        // If 401 Unauthorized, force logout
        if (axios.isAxiosError(err) && err.response?.status === 401) {
            localStorage.removeItem("token");
            router.push("/signin");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [router]);

  // 2. Handle Create Room
  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slugInput.trim()) return;
    
    setIsCreating(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${BACKEND_URL}/room`,
        { slug: slugInput },
        { headers: { Authorization: token } }
      );

      // Optimistically add the new room to the UI
      const newRoom = response.data.room;
      
      // Note: Adjust the object structure below if your backend returns differently
      setRooms((prev) => [
          ...prev, 
          { _id: newRoom.id, slug: newRoom.slug, createdAt: newRoom.createdAt , adimId: newRoom.adminId}
      ]);
      
      setSlugInput(""); // Clear input
    } catch (err) {
      console.log("Room creation failed", err);  
      
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Handle Logout (Backend + Frontend)
  const handleLogout = async () => {
    try {
        const token = localStorage.getItem("token");
        // Notify backend (optional but good practice)
        await axios.post(`${BACKEND_URL}/logout`, {}, {
            headers: { Authorization: token }
        });
    } catch (error) {
        console.error("Backend logout failed, proceeding with local logout", error);
    } finally {
        // Always clear local storage and redirect
        localStorage.removeItem("token");
        router.push("/signin");
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-blue-600">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- Navbar --- */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-blue-200 shadow-lg">
             <LayoutGrid className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Azure<span className="text-blue-600">Draw</span>
          </h1>
        </div>
        
        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 group-hover:stroke-red-600" />
          <span>Sign out</span>
        </button>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Dashboard</h2>
          <p className="text-slate-500">Manage your drawing rooms or create a new canvas.</p>
        </div>

        {/* --- Create Room Section --- */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-12">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" /> Create a New Room
            </h3>
            
            <form onSubmit={createRoom} className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 w-full relative">
                    <input 
                        type="text" 
                        placeholder="Enter room name (e.g. design-sprint-1)"
                        value={slugInput}
                        onChange={(e) => setSlugInput(e.target.value)}
                        className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    />
                    {error && <p className="text-red-500 text-sm mt-2 ml-1 animate-pulse">{error}</p>}
                </div>
                
                <button 
                    disabled={isCreating || !slugInput}
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 min-w-[140px]"
                >
                    {isCreating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "Create Room"
                    )}
                </button>
            </form>
        </div>

        {/* --- Rooms Grid Section --- */}
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    Your Rooms <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">{rooms.length}</span>
                </h3>
            </div>

            {rooms.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-slate-900 font-medium mb-1">No rooms found</h4>
                    <p className="text-slate-400 text-sm">Create your first room above to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div key={room._id} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all relative overflow-hidden">
                            {/* Decorative gradient blob */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-blue-50 to-blue-100 rounded-bl-[60px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            
                            <div className="relative z-10">
                                <h4 className="text-xl font-bold text-slate-800 mb-1 truncate pr-8">{room.slug}</h4>
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-6">
                                    {new Date(room.createdAt).toLocaleDateString()}
                                </p>
                                
                                <button 
                                    onClick={() => router.push(`/canvas/${room._id}`)} 
                                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    Join Canvas
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </main>
    </div>
  );
}