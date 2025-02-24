export default function ChatBotApp() {
  return (
    <div className="chat-app">
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Chat List</h2>
          <i className="bx bx-edit-alt new-chat"></i>
        </div>
        <div className="chat-list-item">
          <h4>Chat 2024/02/24 21.39</h4>
          <i className="bx bx-x circle"></i>
        </div>
        <div className="chat-list-item">
          <h4>Chat 2024/02/24 21.39</h4>
          <i className="bx bx-x circle"></i>
        </div>
        <div className="chat-list-item">
          <h4>Chat 2024/02/24 21.39</h4>
          <i className="bx bx-x circle"></i>
        </div>
      </div>
      <div className="chat-window">
        <div className="chat-title">
          <h3>Chat with AI</h3>
          <i className="bx-bx-arrow-back arrow"></i>
        </div>
        <div className="chat">
          <div className="prompt">
            Hi, how are you?
            <span>12:59:51</span>
            <div className="response">
              Hello, Im just a compouter program, so, I dont have feelings, but
              Im here and ready to assist you.
              <span>13:02:01</span>
            </div>
            <div className="typing">Typing...</div>
          </div>
          <form className="msg-form">
            <i className="fa-solid fa-face smile emoji"></i>
            <input
              type="text"
              className="msg-input"
              placeholder="Type a message..."
            />
            <i className="fa-solid fa-paper-plane"></i>
          </form>
        </div>
      </div>
    </div>
  );
}
