"use client";
import Link from "next/link";
import "./ChatBotApp.css";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

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

  useEffect(() => {
    const activeChatObj = chats.find((chat) => chat.id === activeChat);
    setMessages(activeChatObj ? activeChatObj.messages : []);
  }, [activeChat, chats]);

  function handleIputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  async function sendMessage() {
    if (inputValue.trim() === "") return;

    const newMessage = {
      type: "prompt",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    if (!activeChat) {
      createNewChat(inputValue);
      setInputValue("");
    } else {
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setInputValue("");

      const updatedChats = chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      });

      setChats(updatedChats);

      const response = await fetch("https://api.openai.com/v1/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          message: [{ role: "user", content: inputValue }],
          max_tokens: 500,
        }),
      });

      const data = await response.json();

      const chatResponse = data.choices[0].message.content.trim();
      const newResponse = {
        type: "response",
        text: chatResponse,
        timestamp: new Date().toLocaleTimeString(),
      };

      const updatedMessagesWithResponse = [...updatedMessages, newResponse];
      setMessages(updatedMessagesWithResponse);

      const updatedChatsWithResponse = chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: updatedMessagesWithResponse };
        }
        return chat;
      });
      setChats(updatedChatsWithResponse);
    }
  }

  // TODO(Armen) Behövs denna?
  function handleChat() {
    if (chats.length === 0) {
      createNewChat();
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
    setActiveChat(newChat.id);
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
    }
  }

  return (
    <div className="chat-app">
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Chat List</h2>
          <i
            className="bx bx-edit-alt new-chat"
            onClick={() => createNewChat()}
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
