"use client";

import { useState } from "react";
import { Message } from "@/lib/mockData";
import { Search, MessageCircle } from "lucide-react";

interface ChatListProps {
  messages: Message[];
  selectedUserId: number | null;
  onSelectUser: (userId: number) => void;
}

export default function ChatList({
  messages,
  selectedUserId,
  onSelectUser,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Group messages by user (get the latest message per user)
  const conversationList = messages.reduce(
    (acc: { [key: number]: Message }, message) => {
      const existingConversation = acc[message.id];
      if (
        !existingConversation ||
        new Date(message.timestamp).getTime() >
          new Date(existingConversation.timestamp).getTime()
      ) {
        acc[message.id] = message;
      }
      return acc;
    },
    {}
  );

  // Sort conversations by timestamp (newest first)
  const sortedConversations = Object.values(conversationList).sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Filter conversations based on search query
  const filteredConversations = sortedConversations.filter((message) => {
    return (
      searchQuery === "" ||
      message.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Unread":
        return "bg-blue-600";
      case "Read":
        return "bg-gray-400";
      case "Resolved":
        return "bg-green-600";
      default:
        return "bg-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return "High";
      case "Medium":
        return "Med";
      case "Low":
        return "Low";
      default:
        return "—";
    }
  };

  return (
    <div className="w-full bg-white flex flex-col h-screen">
      {/* Header */}
      {/* <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle size={28} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>
      </div> */}

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((message) => (
            <div
              key={message.id}
              onClick={() => onSelectUser(message.id)}
              className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors duration-150 hover:bg-gray-50 ${
                selectedUserId === message.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                    selectedUserId === message.id ? "bg-blue-600" : "bg-gray-400"
                  }`}
                >
                  {message.userName.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {message.userName}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {message.timestamp.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {message.subject}
                  </p>
                  <div className="flex justify-between items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusBadgeColor(
                        message.status
                      )}`}
                    >
                      {message.status}
                    </span>
                    <span className="text-lg">{getPriorityIcon(message.priority)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageCircle size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
