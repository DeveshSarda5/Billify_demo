"use client";

import { useState } from "react";
import { Message } from "@/lib/mockData";
import { Send, Phone, Video, Info, MoreVertical, Paperclip, Smile, Mic } from "lucide-react";

interface ChatViewProps {
  selectedMessage: Message | null;
  onClose: () => void;
}

export default function ChatView({ selectedMessage, onClose }: ChatViewProps) {
  const [replyText, setReplyText] = useState("");

  if (!selectedMessage) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 h-full">
        <MessageNoBubble size={64} className="text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg font-medium">Select a conversation to view</p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Query":
        return "bg-blue-100 text-blue-800";
      case "Conflict Resolution":
        return "bg-red-100 text-red-800";
      case "Feedback":
        return "bg-green-100 text-green-800";
      case "Other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-300";
      case "Medium":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      setReplyText("");
      // Here you would typically send the reply to your backend
    }
  };

  return (
    <div className="flex flex-col bg-white h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {selectedMessage.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {selectedMessage.userName}
                </h2>
                <p className="text-sm text-gray-500">{selectedMessage.userEmail}</p>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Info size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
        {/* Date Divider */}
        <div className="flex items-center justify-center mb-6">
          <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
            {new Date(selectedMessage.timestamp).toLocaleDateString("en-IN")}
          </span>
        </div>

        {/* Message Details */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            {/* Subject Line */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-600 mb-1">Subject</p>
              <h3 className="text-lg font-bold text-gray-900">
                {selectedMessage.subject}
              </h3>
            </div>

            {/* Category and Priority Badge */}
            <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-200">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                  selectedMessage.category
                )}`}
              >
                {selectedMessage.category}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                  selectedMessage.priority
                )}`}
              >
                {selectedMessage.priority} Priority
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                {selectedMessage.status}
              </span>
            </div>

            {/* Message Content */}
            <p className="text-gray-700 leading-relaxed">
              {selectedMessage.message}
            </p>

            {/* Timestamp */}
            <p className="text-xs text-gray-500 mt-5 pt-4 border-t border-gray-200">
              Sent on {selectedMessage.timestamp}
            </p>
          </div>
        </div>
      </div>

      {/* Reply Input Area - WhatsApp Style */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shrink-0">
        <div className="flex items-end gap-3">
          {/* Attachment Button */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-600">
            <Paperclip size={22} />
          </button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Message..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Emoji Button */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-600">
            <Smile size={22} />
          </button>

          {/* Send or Microphone Button */}
          {replyText.trim() ? (
            <button
              onClick={handleSendReply}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <Send size={22} />
            </button>
          ) : (
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-600">
              <Mic size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for empty state
function MessageNoBubble({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
