import Link from "next/link";
import "./ChatBotStart.css";

export default function ChatBotStart() {
  return (
    <div className="start-page">
      <Link href="/chatbotapp">
        <button className="start-page-btn">Chat AI</button>
      </Link>
    </div>
  );
}
