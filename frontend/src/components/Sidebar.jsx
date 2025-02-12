import { useState, useEffect } from "react";
import { Users, Search } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { getUsersWithChats, usersWithChats, selectedUser, setSelectedUser, isLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsersWithChats();
  }, [getUsersWithChats]);

  const filteredUsers = usersWithChats.filter(user => {
    const search = searchQuery.toLowerCase();
    return user.fullName.toLowerCase().includes(search);
  });

  if (isLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Chat History</span>
        </div>
        <div className="hidden lg:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm w-full pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50" />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            {searchQuery ? "No users found" : "No chat history yet"}
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

            <div className="flex-1 hidden lg:block text-left">
              <p className="font-medium truncate">{user.fullName}</p>
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
