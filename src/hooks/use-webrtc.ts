"use client";

import * as React from "react";

interface UseWebRTCOptions {
  onRemoteStream?: (stream: MediaStream) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  connectionState: RTCPeerConnectionState;
  startCall: () => Promise<void>;
  answerCall: (offer: RTCSessionDescriptionInit) => Promise<void>;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  toggleAudio: () => boolean;
  toggleVideo: () => boolean;
  toggleScreenShare: () => Promise<boolean>;
  endCall: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function useWebRTC(options: UseWebRTCOptions = {}): UseWebRTCReturn {
  const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = React.useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = React.useState<RTCPeerConnectionState>("new");
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);

  const peerConnectionRef = React.useRef<RTCPeerConnection | null>(null);
  const [peerConnection, setPeerConnection] = React.useState<RTCPeerConnection | null>(null);

  const localStreamRef = React.useRef<MediaStream | null>(null);
  const originalVideoTrackRef = React.useRef<MediaStreamTrack | null>(null);

  const toggleScreenShareRef = React.useRef<(() => Promise<boolean>) | null>(null);

  const createPeerConnection = React.useCallback((): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        options.onIceCandidate?.(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        setRemoteStream(stream);
        options.onRemoteStream?.(stream);
      }
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      options.onConnectionStateChange?.(pc.connectionState);
    };

    peerConnectionRef.current = pc;
    setPeerConnection(pc);
    return pc;
  }, [options]);

  const getLocalMedia = React.useCallback(async (constraints: MediaStreamConstraints = {}) => {
    const defaultConstraints: MediaStreamConstraints = {
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(
      constraints.audio !== undefined || constraints.video !== undefined
        ? constraints
        : defaultConstraints
    );

    setLocalStream(stream);
    localStreamRef.current = stream;

    // Store original video track for screen share toggle
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      originalVideoTrackRef.current = videoTrack;
    }

    return stream;
  }, []);

  const startCall = React.useCallback(async () => {
    try {
      const stream = await getLocalMedia();
      const pc = createPeerConnection();

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  }, [getLocalMedia, createPeerConnection]);

  const createOffer = React.useCallback(async (): Promise<RTCSessionDescriptionInit> => {
    const pc = peerConnectionRef.current;
    if (!pc) throw new Error("Peer connection not initialized");

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }, []);

  const answerCall = React.useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      try {
        const stream = await getLocalMedia();
        const pc = createPeerConnection();

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
      } catch (error) {
        console.error("Failed to answer call:", error);
      }
    },
    [getLocalMedia, createPeerConnection]
  );

  const addIceCandidate = React.useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionRef.current;
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  const toggleAudio = React.useCallback((): boolean => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        return audioTrack.enabled;
      }
    }
    return false;
  }, []);

  const toggleVideo = React.useCallback((): boolean => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        return videoTrack.enabled;
      }
    }
    return false;
  }, []);

  const toggleScreenShare = React.useCallback(async (): Promise<boolean> => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing and restore camera
        const stream = localStreamRef.current;
        const screenTrack = stream?.getVideoTracks()[0];

        if (screenTrack) {
          screenTrack.stop();
        }

        if (originalVideoTrackRef.current && stream) {
          const pc = peerConnectionRef.current;
          const sender = pc?.getSenders().find((s) => s.track?.kind === "video");

          if (sender && originalVideoTrackRef.current) {
            await sender.replaceTrack(originalVideoTrackRef.current);
          }

          // Replace track in local stream
          if (screenTrack) {
            stream.removeTrack(screenTrack);
          }
          stream.addTrack(originalVideoTrackRef.current);
          const next = new MediaStream(stream.getTracks());
          localStreamRef.current = next;
          setLocalStream(next);
        }

        setIsScreenSharing(false);
        return false;
      }

      // Start screen sharing
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" },
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      const pc = peerConnectionRef.current;
      const sender = pc?.getSenders().find((s) => s.track?.kind === "video");

      if (sender && screenTrack) {
        await sender.replaceTrack(screenTrack);
      }

      // Replace track in local stream
      const stream = localStreamRef.current;
      if (stream && screenTrack) {
        const currentVideoTrack = stream.getVideoTracks()[0];
        if (currentVideoTrack) {
          stream.removeTrack(currentVideoTrack);
        }
        stream.addTrack(screenTrack);
        const next = new MediaStream(stream.getTracks());
        localStreamRef.current = next;
        setLocalStream(next);
      }

      // Avoid "toggleScreenShare accessed before declaration" by calling via ref
      if (screenTrack) {
        screenTrack.onended = () => {
          void toggleScreenShareRef.current?.();
        };
      }

      setIsScreenSharing(true);
      return true;
    } catch (error) {
      console.error("Screen share failed:", error);
      return false;
    }
  }, [isScreenSharing]);

  React.useEffect(() => {
    toggleScreenShareRef.current = toggleScreenShare;
  }, [toggleScreenShare]);

  const endCall = React.useCallback(() => {
    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setPeerConnection(null);

    setRemoteStream(null);
    setConnectionState("closed");
    setIsAudioEnabled(true);
    setIsVideoEnabled(true);
    setIsScreenSharing(false);
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    remoteStream,
    peerConnection,
    connectionState,
    startCall,
    answerCall,
    createOffer,
    addIceCandidate,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    endCall,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
  };
}
