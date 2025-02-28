"use client";
import Link from "next/link";
import "./ChatBotApp.css";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { chatService } from "@/services/chatService";

interface Message {
  type: string;
  text: string;
  timestamp: string;
}

interface Chat {
  id: string;
  displayId: string;
  messages: Message[];
}
export default function ChatBotApp() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>(chats[0]?.messages || []);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const activeChatObj = chats.find((chat) => chat.id === activeChat);
    setMessages(activeChatObj ? activeChatObj.messages : []);
  }, [activeChat, chats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem("chats") || "[]");
    setChats(storedChats);

    if (storedChats.length > 0) {
      setActiveChat(storedChats[0].id);
    }
  }, []);

  useEffect(() => {
    if (activeChat) {
      const storedMessages = JSON.parse(
        localStorage.getItem(activeChat) || "[]"
      );
      setMessages(storedMessages);
    }
  }, [activeChat]);

  async function sendMessage() {
    if (inputValue.trim() === "") return;

    const messageText = inputValue;
    const newMessage: Message = {
      type: "prompt",
      text: messageText,
      timestamp: new Date().toLocaleTimeString(),
    };

    let currentChatId = activeChat;
    let currentMessages: Message[];
    let chatsForResponse: Chat[];

    if (!activeChat) {
      const newChat: Chat = {
        id: uuidv4(),
        displayId: `Chat ${new Date().toLocaleDateString(
          "en-GB"
        )} ${new Date().toLocaleTimeString()}`,
        messages: [newMessage],
      };

      currentChatId = newChat.id;
      currentMessages = newChat.messages;
      const newChats = [newChat, ...chats];
      setChats(newChats);
      localStorage.setItem("chats", JSON.stringify(newChats));
      localStorage.setItem(newChat.id, JSON.stringify(newChat.messages));
      setActiveChat(newChat.id);
      chatsForResponse = newChats;
    } else {
      currentMessages = [...messages, newMessage];
      localStorage.setItem(activeChat, JSON.stringify(currentMessages));
      const newChats = chats.map((chat) =>
        chat.id === activeChat ? { ...chat, messages: currentMessages } : chat
      );
      setChats(newChats);
      localStorage.setItem("chats", JSON.stringify(newChats));
      chatsForResponse = chats;
    }

    setMessages(currentMessages);
    setInputValue("");
    setIsTyping(true);

    const response = await chatService.sendMessage(messageText);

    if (response.text) {
      const newResponse: Message = {
        type: "response",
        text: response.text,
        timestamp: new Date().toLocaleTimeString(),
      };

      const updatedMessages = [...currentMessages, newResponse];
      setMessages(updatedMessages);
      localStorage.setItem(currentChatId!, JSON.stringify(updatedMessages));
      setIsTyping(false);

      if (response.audio) {
        const audioSrc = `data:audio/mpeg;base64,${response.audio}`;
        const audio = new Audio(audioSrc);
        audio.play();
      }

      const updatedChats = chatsForResponse.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: updatedMessages }
          : chat
      );
      setChats(updatedChats);
      localStorage.setItem("chats", JSON.stringify(updatedChats));
    }
  }

  function createNewChat(initialMessage?: string) {
    const newChat = {
      id: uuidv4(),
      displayId: `Chat ${new Date().toLocaleDateString(
        "en-GB"
      )} ${new Date().toLocaleTimeString()}`,
      messages: initialMessage
        ? [
            {
              type: "prompt",
              text: initialMessage,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]
        : [],
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    localStorage.setItem("chats", JSON.stringify(updatedChats));
    localStorage.setItem(newChat.id, JSON.stringify(newChat.messages));
    setActiveChat(newChat.id);
  }

  function handleEmojiSelect(emoji: { native: string }) {
    setInputValue((prevInput) => prevInput + emoji.native);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleSelectChat(id: string) {
    setActiveChat(id);
  }

  function handleDeleteChat(id: string) {
    const updatedChats = chats.filter((chat) => chat.id !== id);
    setChats(updatedChats);

    if (id === activeChat) {
      const newActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
      setActiveChat(newActiveChat);
      localStorage.setItem("chats", JSON.stringify(updatedChats));
      localStorage.removeItem(id);
    }
  }

  return (
    <div className="chat-app">
      <div className={`chat-list ${showChatList ? "show" : ""}`}>
        <div className="chat-list-header">
          <h2>Chat List</h2>
          <i
            className="bx bx-edit-alt new-chat"
            onClick={() => createNewChat()}
          ></i>
          <i
            className="bx bx-x close-list"
            onClick={() => setShowChatList(false)}
          ></i>
        </div>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-list-item ${
              chat.id === activeChat ? "active" : ""
            }`}
            onClick={() => handleSelectChat(chat.id)}
          >
            <h4>{chat.displayId}</h4>
            <i
              className="bx bx-x"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat.id);
              }}
            ></i>
          </div>
        ))}
      </div>
      <div className="chat-window">
        <div className="chat-title">
          <h3>Chat with AI</h3>
          <i className="bx bx-menu" onClick={() => setShowChatList(true)}></i>
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
              <span>{msg.timestamp}</span>
            </div>
          ))}
          {isTyping && <div className="typing">Typing...</div>}
          <div ref={chatEndRef}></div>
        </div>
        <form className="msg-form" onSubmit={(e) => e.preventDefault()}>
          <i
            className="fa-solid fa-face-smile emoji"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          ></i>
          {showEmojiPicker && (
            <div className="picker">
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
          <input
            type="text"
            className="msg-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowEmojiPicker(false)}
          />
          <i className="fa-solid fa-paper-plane" onClick={sendMessage}></i>
        </form>
      </div>
    </div>
  );
}
