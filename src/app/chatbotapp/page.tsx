"use client";
import Link from "next/link";
import "./ChatBotApp.css";
import { useState } from "react";

interface Message {
  type: string;
  text: string;
  timeStamp: string;
}

interface Chat {
  id: string;
  messages: Message[];
}
export default function ChatBotApp() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>(chats[0]?.messages || []);
  const [activeChat, setActiveChat] = useState(null);

  function handleIputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function sendMessage() {
    if (inputValue.trim() === "") return;

    const newMessage = {
      type: "prompt",
      text: inputValue,
      timeStamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputValue("");

    const updatedChats = chats.map((chat, index) => {
      if (index === 0) {
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    });

    setChats(updatedChats);
  }

  // TODO(Armen) Behövs denna?
  function handleChat() {
    if (chats.length === 0) {
      const newChat = {
        id: `Chat ${new Date().toLocaleDateString(
          "en-GB"
        )} ${new Date().toLocaleDateString()}`,
        messages: [],
      };
      setChats([newChat]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-app">
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Chat List</h2>
          <i className="bx bx-edit-alt new-chat"></i>
        </div>
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`chat-list-item ${index === 0 ? "active" : ""}`}
          >
            <h4>{chat.id}</h4>
            <i className="bx bx-x"></i>
          </div>
        ))}
      </div>
      <div className="chat-window">
        <div className="chat-title">
          <h3>Chat with AI</h3>
          <Link href="/">
            <i className="bx bx-arrow-back arrow"></i>
          </Link>
        </div>
        <div className="chat">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.type === "prompt" ? "prompt" : "response"}
            >
              {msg.text}
              <span>{msg.timeStamp}</span>
            </div>
          ))}

          <div className="typing">Typing...</div>
        </div>
        <form className="msg-form" onSubmit={(e) => e.preventDefault()}>
          <i className="fa-solid fa-face-smile emoji"></i>
          <input
            type="text"
            className="msg-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={handleIputChange}
            onKeyDown={handleKeyDown}
          />
          <i className="fa-solid fa-paper-plane" onClick={sendMessage}></i>
        </form>
      </div>
    </div>
  );
}
