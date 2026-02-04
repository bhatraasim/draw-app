"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, Plus, Search, FileText, Pencil, X } from "lucide-react";
import { BACKEND_URL } from "../conif";
import { StudioButton } from "../components/StudioButton";
import { GlassPanel } from "../components/GlassPanel";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Rooms on Component Mount
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

  // Handle Create Room
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
        { headers: { Authorization: token } },
      );

      // Optimistically add the new room to the UI
      const newRoom = response.data.room;
      setRooms((prev) => [
        ...prev,
        {
          _id: newRoom.id,
          slug: newRoom.slug,
          createdAt: newRoom.createdAt,
          adimId: newRoom.adminId,
        },
      ]);

      setSlugInput("");
      setShowCreateModal(false);
      // Navigate to the new room
      router.push(`/canvas/${newRoom.id}`);
    } catch (err) {
      console.log("Room creation failed", err);
      setError("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  // Filter rooms based on search
  const filteredRooms = rooms.filter((room) =>
    room.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Determine thumbnail type based on room id (for variety)
  const getThumbnailType = (id: string): "rect" | "circle" | "mixed" => {
    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const types: ("rect" | "circle" | "mixed")[] = ["rect", "circle", "mixed"];
    return types[hash % 3];
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-accent"
        >
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface/80 border-b border-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Pencil className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-xl text-ink hidden sm:block">
                Studio Canvas
              </span>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 max-w-md"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-accent focus:outline-none transition-all font-ui text-ink placeholder:text-ink/40"
                />
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <StudioButton onClick={() => setShowCreateModal(true)}>
                <Plus className="w-5 h-5 mr-2 inline" />
                <span className="hidden sm:inline">New Room</span>
              </StudioButton>
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-ink hover:bg-danger/10 hover:text-danger transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-display text-4xl md:text-5xl text-ink mb-2">
            Your Workspaces
          </h1>
          <p className="font-ui text-lg text-ink/70 mb-12">
            Pick up where you left off or start fresh
          </p>

          {/* Room Grid */}
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room, index) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  index={index}
                  thumbnailType={getThumbnailType(room._id)}
                  onClick={() => router.push(`/canvas/${room._id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState onCreate={() => setShowCreateModal(true)} />
          )}
        </motion.div>
      </main>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel className="p-8 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-ink">
                    Create New Room
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-ink/60" />
                  </button>
                </div>

                <form onSubmit={createRoom} className="space-y-6">
                  <div>
                    <label className="block text-sm font-ui font-medium text-ink mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter room name (e.g. design-sprint-1)"
                      value={slugInput}
                      onChange={(e) => setSlugInput(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-accent focus:outline-none transition-all font-ui text-ink placeholder:text-ink/40"
                      autoFocus
                    />
                    {error && (
                      <p className="mt-2 text-sm text-danger font-ui animate-shake">
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <StudioButton
                      variant="secondary"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </StudioButton>
                    <StudioButton
                      type="submit"
                      disabled={isCreating || !slugInput.trim()}
                      className="flex-1"
                    >
                      {isCreating ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        "Create Room"
                      )}
                    </StudioButton>
                  </div>
                </form>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoomCard({
  room,
  index,
  thumbnailType,
  onClick,
}: {
  room: Room;
  index: number;
  thumbnailType: "rect" | "circle" | "mixed";
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.05 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <GlassPanel animate={false} className="overflow-hidden hover-lift">
        {/* Thumbnail Preview */}
        <div className="bg-white p-8 h-48 flex items-center justify-center relative overflow-hidden">
          <RoomThumbnail type={thumbnailType} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-muted/30">
          <h3 className="font-ui text-lg text-ink mb-1 truncate">
            {room.slug}
          </h3>
          <p className="font-mono text-sm text-ink/60">
            {new Date(room.createdAt).toLocaleDateString()}
          </p>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

function RoomThumbnail({ type }: { type: "rect" | "circle" | "mixed" }) {
  if (type === "rect") {
    return (
      <svg width="120" height="80" viewBox="0 0 120 80">
        <rect
          x="10"
          y="10"
          width="100"
          height="60"
          fill="none"
          stroke="#1A1A1B"
          strokeWidth="2"
        />
        <rect
          x="30"
          y="25"
          width="60"
          height="30"
          fill="none"
          stroke="#3050FF"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (type === "circle") {
    return (
      <svg width="120" height="80" viewBox="0 0 120 80">
        <circle
          cx="60"
          cy="40"
          r="30"
          fill="none"
          stroke="#3050FF"
          strokeWidth="2"
        />
        <circle
          cx="60"
          cy="40"
          r="15"
          fill="none"
          stroke="#1A1A1B"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg width="120" height="80" viewBox="0 0 120 80">
      <rect
        x="10"
        y="20"
        width="40"
        height="40"
        fill="none"
        stroke="#1A1A1B"
        strokeWidth="2"
      />
      <circle
        cx="85"
        cy="40"
        r="25"
        fill="none"
        stroke="#3050FF"
        strokeWidth="2"
      />
      <path
        d="M 55 40 L 65 40"
        stroke="#1A1A1B"
        strokeWidth="2"
        markerEnd="url(#arrow)"
      />
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#1A1A1B" />
        </marker>
      </defs>
    </svg>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <GlassPanel className="p-12 text-center max-w-md">
        <div className="w-24 h-24 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-6">
          <FileText className="w-12 h-12 text-ink/30" />
        </div>
        <h2 className="font-display text-3xl text-ink mb-3">
          No masterpieces yet
        </h2>
        <p className="font-ui text-ink/70 mb-8">
          Start your first canvas and bring your ideas to life
        </p>
        <StudioButton onClick={onCreate}>Create Your First Room</StudioButton>
      </GlassPanel>
    </motion.div>
  );
}
