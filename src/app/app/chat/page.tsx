import ChatSection from "./_components/chat-section";
import "@llamaindex/chat-ui/styles/markdown.css"; // code, latex and custom markdown styling
import "@llamaindex/chat-ui/styles/pdf.css";

const ChatPage = async () => {
  return (
    <div>
      <ChatSection />
    </div>
  );
};

export default ChatPage;
