"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

interface VideoCallProps {
  participantName: string;
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd?: () => void;
}

export function VideoCall({
  participantName,
  isIncoming = false,
  onAccept,
  onDecline,
  onEnd,
}: VideoCallProps) {
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [callDuration, setCallDuration] = React.useState(0);
  const [callStatus, setCallStatus] = React.useState<"ringing" | "connecting" | "connected" | "ended">(
    isIncoming ? "ringing" : "connecting"
  );

  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (callStatus !== "connected") return;
    const interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleVideo = () => setIsVideoEnabled(!isVideoEnabled);
  const toggleAudio = () => setIsAudioEnabled(!isAudioEnabled);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleAccept = () => {
    setCallStatus("connecting");
    onAccept?.();
    setTimeout(() => setCallStatus("connected"), 1500);
  };

  const handleDecline = () => {
    setCallStatus("ended");
    onDecline?.();
  };

  const handleEnd = () => {
    setCallStatus("ended");
    onEnd?.();
  };

  if (callStatus === "ended") {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 bg-background flex flex-col",
          isFullscreen && "bg-black"
        )}
      >
        {/* Incoming Call Overlay */}
        {callStatus === "ringing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
<Avatar className="h-32 w-32 ring-4 ring-primary/30">
                <AvatarFallback className="bg-linear-to-br from-primary/10 to-purple-500/10 text-primary text-4xl font-bold">
                  {getInitials(participantName)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <h2 className="text-2xl font-bold mt-6">{participantName}</h2>
            <p className="text-muted-foreground mt-2">Incoming video call...</p>
            <div className="flex gap-4 mt-8">
              <Button
                variant="destructive"
                size="icon-lg"
                className="rounded-full"
                onClick={handleDecline}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button
                variant="default"
                size="icon-lg"
                className="rounded-full bg-emerald-500 hover:bg-emerald-600"
                onClick={handleAccept}
              >
                <Phone className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Connecting State */}
        {callStatus === "connecting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl z-10">
<Avatar className="h-24 w-24 ring-4 ring-primary/30">
              <AvatarFallback className="bg-linear-to-br from-primary/10 to-purple-500/10 text-primary text-3xl font-bold">
                {getInitials(participantName)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mt-4">{participantName}</h2>
            <p className="text-muted-foreground mt-2 animate-pulse">Connecting...</p>
          </div>
        )}

        {/* Video Streams */}
        <div className="flex-1 relative">
          {/* Remote Video */}
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
<Avatar className="h-32 w-32">
                  <AvatarFallback className="bg-linear-to-br from-primary/10 to-purple-500/10 text-primary text-4xl font-bold">
                    {getInitials(participantName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {/* Local Video (PiP) */}
          <motion.div
            drag
            dragConstraints={{ top: 0, left: 0, right: 300, bottom: 400 }}
            className="absolute bottom-24 right-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl cursor-grab active:cursor-grabbing z-10"
          >
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </motion.div>

          {/* Call Info */}
          <div className="absolute top-4 left-4 z-10">
            <div className="glass-strong rounded-2xl px-4 py-2 text-white">
              <p className="font-semibold">{participantName}</p>
              <p className="text-xs opacity-70">
                {callStatus === "connected" ? formatDuration(callDuration) : "Connecting..."}
              </p>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="glass-strong text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isAudioEnabled ? "glass" : "destructive"}
              size="icon-lg"
              className="rounded-full"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
            <Button
              variant={isVideoEnabled ? "glass" : "destructive"}
              size="icon-lg"
              className="rounded-full"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
            <Button
              variant={isScreenSharing ? "default" : "glass"}
              size="icon-lg"
              className="rounded-full"
              onClick={toggleScreenShare}
            >
              <Monitor className="h-6 w-6" />
            </Button>
            <Button
              variant="destructive"
              size="icon-lg"
              className="rounded-full"
              onClick={handleEnd}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}