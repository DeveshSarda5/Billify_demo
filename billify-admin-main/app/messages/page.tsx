"use client";

import { useState, useMemo } from "react";
import ChatList from "../components/ChatList";
import ChatView from "../components/ChatView";
import { mockMessages } from "@/lib/mockData";

export default function MessagesPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Sort messages by timestamp (newest first)
  const sortedMessages = useMemo(() => {
    return [...mockMessages].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  }, []);

  // Get the selected message
  const selectedMessage = selectedUserId
    ? sortedMessages.find((m) => m.id === selectedUserId) || null
    : null;

  return (
    <div className="flex w-full h-screen bg-white">
      {/* Chat List Sidebar */}
      <div className="w-96 shrink-0 border-r border-gray-200 overflow-hidden">
        <ChatList
          messages={sortedMessages}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
      </div>

      {/* Chat View - Full Width */}
      <div className="flex-1 overflow-hidden">
        <ChatView
          selectedMessage={selectedMessage}
          onClose={() => setSelectedUserId(null)}
        />
      </div>
    </div>
  );
}
