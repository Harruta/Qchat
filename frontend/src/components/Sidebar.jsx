import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsersWithChats, usersWithChats, selectedUser, setSelectedUser, isLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsersWithChats();
  }, [getUsersWithChats]);

  const filteredUsers = showOnlineOnly
    ? usersWithChats.filter((user) => onlineUsers.includes(user._id))
    : usersWithChats;

  if (isLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Chat History</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            {showOnlineOnly 
              ? "No online chat partners" 
              : "No chat history yet. Start a conversation!"}
          </div>
        )}
        
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full flex items-center gap-2 hover:bg-base-300 py-2 px-5 transition-colors duration-200 ${
              selectedUser?._id === user._id ? "bg-base-300" : ""
            }`}
          >
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content w-8 rounded-full">
                <img 
                  src={user.profilePic || "/avatar.png"} 
                  alt={user.fullName}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            <div className="flex flex-col items-start hidden lg:block">
              <p className="font-medium">{user.fullName}</p>
            </div>

            {onlineUsers.includes(user._id) && (
              <div className="size-2 bg-success rounded-full ml-auto"></div>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
