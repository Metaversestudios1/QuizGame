import { useEffect, useState } from "react";
import socket from "../socket"; // Import socket instance

const Intro = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Listen for real-time updates
    socket.on("currentQuestionUpdated", (question, sessionId) => {
      if (question.videoUrl?.url) {
        setVideoUrl(question.videoUrl.url);
        setShowMessage(false);
      }
    });

    return () => socket.off("currentQuestionUpdated");
  }, []);

  const handleVideoEnd = () => {
    setVideoUrl("");
    setShowMessage(true);
  };

  return (
    <div>
      {showMessage ? (
        <h1>Thank you for watching the video!</h1>
      ) : videoUrl ? (
        <video src={videoUrl} controls autoPlay onEnded={handleVideoEnd} />
      ) : (
        <h1>Waiting for the video...</h1>
      )}
    </div>
  );
};

export default Intro;
