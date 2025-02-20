import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button, Placeholder, View } from "@aws-amplify/ui-react";
import { amplifyClient } from "@/app/amplify-utils";
import { FeedbackButtons } from "./FeedbackButtons"; // <--- Import here

// Types
type Message = {
  role: string;
  content: { text: string }[];
};

type Conversation = Message[];

export function Chat() {
  const [conversation, setConversation] = useState<Conversation>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const message = setNewUserMessage();
      fetchChatResponse(message);
    }
  };

  const fetchChatResponse = async (message: Message) => {
    setInputValue("");
    setIsLoading(true);

    try {
      const { data, errors } = await amplifyClient.queries.chat({
        conversation: JSON.stringify([...conversation, message]),
      });

      if (!errors && data) {
        setConversation((prevConversation) => [
          ...prevConversation,
          JSON.parse(data),
        ]);
      } else {
        throw new Error(errors?.[0].message || "An unknown error occurred.");
      }
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching chat response:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // scroll to newest message
    (messagesRef.current as HTMLDivElement | null)?.lastElementChild?.scrollIntoView();
  }, [conversation]);

  const setNewUserMessage = (): Message => {
    const newUserMessage: Message = {
      role: "user",
      content: [{ text: inputValue }],
    };
    setConversation((prevConversation) => [...prevConversation, newUserMessage]);
    setInputValue("");
    return newUserMessage;
  };

  // (Optional) Provide these handlers if you want to do more with the feedback
  const handleThumbsUp = (messageIndex: number) => {
    console.log(`Thumbs-up for message at index ${messageIndex}`);
    // e.g., call an API or GraphQL mutation to store feedback
  };

  const handleThumbsDown = (messageIndex: number) => {
    console.log(`Thumbs-down for message at index ${messageIndex}`);
    // e.g., call an API or GraphQL mutation to store feedback
  };

  return (
    <View className="chat-container">
      <View className="messages" ref={messagesRef}>
        {conversation.map((msg, index) => (
          <View key={index} className={`message ${msg.role}`}>
            {/* The message text */}
            {msg.content[0].text}

            {/* Conditionally show FeedbackButtons if this message is from the "assistant" */}
            {msg.role === "assistant" && (
              <FeedbackButtons
                messageIndex={index}
                onThumbsUp={handleThumbsUp}
                onThumbsDown={handleThumbsDown}
              />
            )}
          </View>
        ))}
      </View>

      {isLoading && (
        <View className="loader-container">
          <p>Thinking...</p>
          <Placeholder size="large" />
        </View>
      )}

      <form onSubmit={handleSubmit} className="input-container">
        <input
          name="prompt"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="input"
          type="text"
        />
        <Button
          type="submit"
          className="send-button"
          isDisabled={isLoading}
          loadingText="Sending..."
        >
          Send
        </Button>
      </form>

      {error ? <View className="error-message">{error}</View> : null}
    </View>
  );
}

export default Chat;
