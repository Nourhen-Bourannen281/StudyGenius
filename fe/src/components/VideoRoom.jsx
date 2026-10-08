import { useEffect, useRef, useState } from "react";
import { getVideoToken } from "../services/groupService";

const VideoRoom = ({ groupId, groupName, userName, onClose }) => {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let disposed = false;

    getVideoToken(groupId)
      .then(({ token, roomName, appId }) => {
        if (disposed) return;

        apiRef.current = new window.JitsiMeetExternalAPI("8x8.vc", {
          roomName: `${appId}/${roomName}`,
          jwt: token,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName: userName },
          configOverwrite: {
            prejoinPageEnabled: false,
          },
        });
      })
      .catch((err) => {
        console.error("Erreur JaaS :", err);
        setError("Impossible de rejoindre l'appel. Réessaie.");
      });

    return () => {
      disposed = true;
      apiRef.current?.dispose();
    };
  }, [groupId, userName]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 bg-surface-light border-b border-white/10">
        <p className="text-white font-medium text-sm">Appel vidéo — {groupName}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          Quitter l'appel
        </button>
      </div>
      {error ? (
        <div className="flex-1 flex items-center justify-center text-red-400">{error}</div>
      ) : (
        <div ref={containerRef} className="flex-1" />
      )}
    </div>
  );
};

export default VideoRoom;