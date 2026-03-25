"use client";

import { useState } from "react";
import { Message } from "@/lib/mockData";
import { Search, Filter, MessageSquare } from "lucide-react";

interface MessagesTableProps {
  messages: Message[];
}

export default function MessagesTable({ messages }: MessagesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Filter messages based on selected filters
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      searchQuery === "" ||
      message.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || message.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || message.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Unread":
        return "bg-yellow-100 text-yellow-800";
      case "Read":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare size={24} className="text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Customer Messages</h2>
            <p className="text-sm text-gray-500 mt-1">
              Messages from customers regarding queries and conflict resolution
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Category Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">
                <Filter size={14} className="inline mr-1" />
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              >
                <option value="all">All Categories</option>
                <option value="Query">Query</option>
                <option value="Conflict Resolution">Conflict Resolution</option>
                <option value="Feedback">Feedback</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              >
                <option value="all">All Status</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {(searchQuery ||
              categoryFilter !== "all" ||
              statusFilter !== "all" ||
              priorityFilter !== "all") && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  }}
                  className="px-3 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <tr
                  key={message.id}
                  className={`hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                    message.status === "Unread" ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div>
                      <p className="font-semibold">{message.userName}</p>
                      <p className="text-xs text-gray-500">{message.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {message.subject}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                        message.category
                      )}`}
                    >
                      {message.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        message.status
                      )}`}
                    >
                      {message.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                        message.priority
                      )}`}
                    >
                      {message.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {message.timestamp}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No messages match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Results summary */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-600">
        Showing {filteredMessages.length} of {messages.length} messages
      </div>
    </div>
  );
}
