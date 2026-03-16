import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { ChatPreview } from "../components/chat-preview";
import { RefreshCw, Download, Upload, Trash2, Sparkles, Loader2 } from "lucide-react";
import { chatApi } from "../api/chatApi";

export function BuilderPage({ config: initialConfig }) {
    const [config, setConfig] = useState(
        initialConfig || {
            platform: "whatsapp",
            title: "My Chat",
            subtitle: "online",
            theme: "light",
        }
    );
    const [messages, setMessages] = useState([]);
    const [sender, setSender] = useState("me");
    const [messageType, setMessageType] = useState("text");
    const [messageText, setMessageText] = useState("");
    const [timestamp, setTimestamp] = useState("12:30 PM");

    const [chatId, setChatId] = useState(null);
    const [meId, setMeId] = useState(null);
    const [otherId, setOtherId] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const debounceTimer = useRef(null);

    // Sync configuration with backend
    useEffect(() => {
        if (!chatId) return;

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            setIsSyncing(true);
            try {
                await chatApi.updateChat(chatId, config);
                setPreviewUrl(chatApi.getPreviewUrl(chatId));
            } catch (error) {
                console.error("Failed to sync config:", error);
            } finally {
                setIsSyncing(false);
            }
        }, 1000);

        return () => clearTimeout(debounceTimer.current);
    }, [config, chatId]);

    const handleAddMessage = async () => {
        if (!messageText.trim()) return;

        try {
            let currentChatId = chatId;
            let currentMeId = meId;
            let currentOtherId = otherId;

            if (!currentChatId) {
                setIsSyncing(true);
                const chatRes = await chatApi.createChat(config);
                currentChatId = chatRes.chat_id;
                currentMeId = chatRes.me_id;
                currentOtherId = chatRes.other_id;
                setChatId(currentChatId);
                setMeId(currentMeId);
                setOtherId(currentOtherId);
            }

            const senderId = sender === "me" ? currentMeId : currentOtherId;
            const direction = sender === "me" ? "outbound" : "inbound";

            await chatApi.addMessage(currentChatId, {
                sender_id: senderId,
                type: messageType,
                content: messageText,
                timestamp: timestamp,
                direction: direction,
            });

            const newMessage = {
                id: Date.now().toString(),
                sender,
                text: messageText,
                timestamp,
                type: messageType,
                direction,
            };

            setMessages([...messages, newMessage]);
            setMessageText("");
            setPreviewUrl(chatApi.getPreviewUrl(currentChatId));
        } catch (error) {
            console.error(error);
            alert("Failed to sync with backend: " + error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !chatId) return;

        setIsUploading(true);
        try {
            // Upload for the current sender
            const targetId = sender === "me" ? meId : otherId;
            await chatApi.uploadAvatar(targetId, file);
            setPreviewUrl(chatApi.getPreviewUrl(chatId));
        } catch (error) {
            console.error("Avatar upload failed:", error);
            alert("Failed to upload avatar");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadImage = () => {
        if (previewUrl) {
            window.open(previewUrl, "_blank");
        } else {
            alert("No message added yet to generate a preview!");
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-zinc-950">
            <div className="w-full min-h-screen flex flex-col lg:flex-row divide-x divide-zinc-800/50">
                {/* Column 1: Configuration */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 bg-zinc-900/10 backdrop-blur-3xl h-screen overflow-y-auto"
                >
                    <Card className="rounded-none border-none shadow-none h-full bg-transparent">
                        <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur-xl">
                            <CardTitle className="text-zinc-50 flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700/50 shadow-inner">
                                    <Sparkles className="size-5 text-zinc-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-lg font-bold tracking-tight text-white">Configuration</span>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Design System</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Platform</Label>
                                    <Select
                                        value={config.platform}
                                        onValueChange={(value) =>
                                            setConfig({ ...config, platform: value })
                                        }
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-zinc-800/30 border-zinc-700/50 text-zinc-100 focus:bg-zinc-800/50 transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                            <SelectItem value="instagram">Instagram</SelectItem>
                                            <SelectItem value="chatgpt">ChatGPT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Theme</Label>
                                    <Select
                                        value={config.theme}
                                        onValueChange={(value) =>
                                            setConfig({ ...config, theme: value })
                                        }
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-zinc-800/30 border-zinc-700/50 text-zinc-100 focus:bg-zinc-800/50 transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Chat Title</Label>
                                <Input
                                    value={config.title}
                                    onChange={(e) =>
                                        setConfig({ ...config, title: e.target.value })
                                    }
                                    className="h-12 rounded-xl bg-zinc-800/30 border-zinc-700/50 text-zinc-100 transition-all focus:bg-zinc-800/50 focus:border-zinc-600 placeholder:text-zinc-600"
                                    placeholder="Enter chat title..."
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Subtitle</Label>
                                <Input
                                    value={config.subtitle}
                                    onChange={(e) =>
                                        setConfig({ ...config, subtitle: e.target.value })
                                    }
                                    className="h-12 rounded-xl bg-zinc-800/30 border-zinc-700/50 text-zinc-100 transition-all focus:bg-zinc-800/50 focus:border-zinc-600 placeholder:text-zinc-600"
                                    placeholder="e.g. online, typing..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Column 2: Message Studio */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 bg-zinc-900/10 backdrop-blur-3xl h-screen overflow-y-auto"
                >
                    <Card className="rounded-none border-none shadow-none h-full bg-transparent">
                        <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur-xl">
                            <CardTitle className="text-white flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700/50 shadow-inner">
                                    <Sparkles className="size-5 text-zinc-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-lg font-bold tracking-tight text-white">Message Studio</span>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Chat Composer</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Sender</Label>
                                    <Select
                                        value={sender}
                                        onValueChange={(value) => setSender(value)}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-zinc-800/30 border-zinc-700/50 text-zinc-100 focus:bg-zinc-800/50 transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                            <SelectItem value="me">Me (Right)</SelectItem>
                                            <SelectItem value="other">Other (Left)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Timestamp</Label>
                                    <Input
                                        value={timestamp}
                                        onChange={(e) => setTimestamp(e.target.value)}
                                        className="h-12 rounded-xl bg-zinc-800/30 border-zinc-700/50 text-zinc-100 focus:bg-zinc-800/50 focus:border-zinc-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Message Content</Label>
                                <Textarea
                                    placeholder="Type your message..."
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    className="min-h-[140px] rounded-2xl bg-zinc-800/30 border-zinc-700/50 text-zinc-100 focus:bg-zinc-800/50 focus:border-zinc-600 resize-none p-5 placeholder:text-zinc-600"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddMessage();
                                        }
                                    }}
                                />
                                <div className="flex items-center gap-2 px-1">
                                    <div className="size-1 rounded-full bg-zinc-700" />
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                        Press Enter to quick send
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleAddMessage}
                                disabled={isSyncing}
                                className="w-full bg-zinc-100 hover:bg-white text-zinc-950 rounded-2xl h-14 font-bold uppercase tracking-[0.15em] text-[11px] transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                {isSyncing ? (
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="size-4 mr-2" />
                                )}
                                Add Message
                            </Button>

                            <div className="pt-6 border-t border-zinc-800/50">
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={!chatId || isUploading}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById("avatar-upload").click()}
                                    disabled={!chatId || isUploading}
                                    className="w-full border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 rounded-2xl h-14 font-bold transition-all border-dashed"
                                >
                                    {isUploading ? (
                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="size-4 mr-2" />
                                    )}
                                    {chatId ? `Upload ${sender === "me" ? "My" : "Other"} Avatar` : "Create Chat First"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Column 3: Live Preview */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 bg-zinc-950/50 h-screen overflow-y-auto"
                >
                    <Card className="rounded-none border-none shadow-none h-full bg-transparent">
                        <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/40 p-8 backdrop-blur-xl">
                            <CardTitle className="text-white flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700/50 shadow-inner">
                                        <Sparkles className="size-5 text-zinc-400" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-lg font-bold tracking-tight text-white">Live Preview</span>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Studio Render</p>
                                    </div>
                                </div>
                                {chatId && (
                                    <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full shadow-sm backdrop-blur-md">
                                        <div className={`size-2 rounded-full ${isSyncing ? "bg-amber-500 animate-spin" : "bg-emerald-500 animate-pulse"} shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                                        <span className="text-zinc-200 text-[10px] font-bold uppercase tracking-widest">
                                            {isSyncing ? "Syncing..." : "Live Studio"}
                                        </span>
                                    </div>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            <div className="relative min-h-[calc(100vh-280px)] flex items-center justify-center rounded-3xl bg-zinc-900/30 border border-zinc-800/50 shadow-[inset_0_2px_12px_rgba(0,0,0,0.1)] overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
                                
                                {previewUrl ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={previewUrl}
                                        className="relative z-10 p-8 w-full max-w-lg"
                                    >
                                        <img 
                                            src={previewUrl} 
                                            alt="Chat Preview" 
                                            className="w-full h-auto rounded-3xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] border border-white/5" 
                                        />
                                    </motion.div>
                                ) : (
                                    <div className="relative z-10 w-full max-w-lg p-8 opacity-40 grayscale">
                                        <ChatPreview config={config} messages={messages} />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setMessages([]);
                                            setChatId(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="flex-1 border-zinc-800 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100 rounded-2xl h-14 font-bold transition-all"
                                    >
                                        <RefreshCw className="size-4 mr-2" />
                                        Reset Studio
                                    </Button>
                                    <Button
                                        onClick={handleDownloadImage}
                                        className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded-2xl h-14 font-bold uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all active:scale-95"
                                    >
                                        <Download className="size-4 mr-2" />
                                        Export Image
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

export default BuilderPage;
