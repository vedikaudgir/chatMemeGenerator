import { useState } from "react";
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
import { RefreshCw, Download, Upload, Trash2, Sparkles } from "lucide-react";

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

    const handleAddMessage = () => {
        if (!messageText.trim()) return;

        const newMessage = {
            id: Date.now().toString(),
            sender,
            text: messageText,
            timestamp,
            type: messageType,
        };

        setMessages([...messages, newMessage]);
        setMessageText("");
    };

    const handleDownloadImage = () => {
        alert("Download functionality coming soon!");
    };

    const handleClearMessages = () => {
        setMessages([]);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-neutral-900">
            {/* Header */}
            <div className="bg-gradient-to-br from-neutral-900 via-blue-950 to-purple-950 border-b border-neutral-800">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                    <Sparkles className="size-5 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white">Chat Builder</h1>
                            </div>
                            <p className="text-neutral-400">
                                Design your chat screenshot in real-time
                            </p>
                        </div>
                        {messages.length > 0 && (
                            <div className="px-4 py-2 bg-neutral-800 rounded-xl border border-neutral-700">
                                <p className="text-neutral-400 text-sm">
                                    <span className="text-white font-semibold">{messages.length}</span>{" "}
                                    {messages.length === 1 ? "message" : "messages"}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Builder Controls */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Chat Configuration */}
                        <Card className="bg-neutral-800 border-neutral-700 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <div className="size-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                        <Sparkles className="size-4 text-white" />
                                    </div>
                                    Chat Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-neutral-300">Platform</Label>
                                        <Select
                                            value={config.platform}
                                            onValueChange={(value) =>
                                                setConfig({ ...config, platform: value })
                                            }
                                        >
                                            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                <SelectItem value="instagram">Instagram</SelectItem>
                                                <SelectItem value="chatgpt">ChatGPT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-neutral-300">Theme</Label>
                                        <Select
                                            value={config.theme}
                                            onValueChange={(value) =>
                                                setConfig({ ...config, theme: value })
                                            }
                                        >
                                            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="dark">Dark</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-300">Chat Title</Label>
                                    <Input
                                        value={config.title}
                                        onChange={(e) =>
                                            setConfig({ ...config, title: e.target.value })
                                        }
                                        className="bg-neutral-900 border-neutral-700 text-white rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-300">Subtitle</Label>
                                    <Input
                                        value={config.subtitle}
                                        onChange={(e) =>
                                            setConfig({ ...config, subtitle: e.target.value })
                                        }
                                        className="bg-neutral-900 border-neutral-700 text-white rounded-xl"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Message Builder */}
                        <Card className="bg-neutral-800 border-neutral-700 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Message Builder</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-neutral-300">Sender</Label>
                                        <Select
                                            value={sender}
                                            onValueChange={(value) => setSender(value)}
                                        >
                                            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="me">Me</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-neutral-300">Timestamp</Label>
                                        <Input
                                            value={timestamp}
                                            onChange={(e) => setTimestamp(e.target.value)}
                                            className="bg-neutral-900 border-neutral-700 text-white rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-neutral-300">Message</Label>
                                    <Textarea
                                        placeholder="Type your message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddMessage();
                                            }
                                        }}
                                        className="bg-neutral-900 border-neutral-700 text-white rounded-xl min-h-[100px] resize-none"
                                    />
                                    <p className="text-xs text-neutral-500">
                                        Press Enter to add, Shift+Enter for new line
                                    </p>
                                </div>

                                <Button
                                    onClick={handleAddMessage}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-11"
                                >
                                    Add Message
                                </Button>

                                <div className="pt-4 border-t border-neutral-700">
                                    <Button
                                        variant="outline"
                                        className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-700 rounded-xl h-11"
                                    >
                                        <Upload className="size-4 mr-2" />
                                        Upload Avatar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right Panel - Live Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <Label className="text-white text-lg font-semibold">
                                    Live Preview
                                </Label>
                                {messages.length > 0 && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-full">
                                        Live
                                    </span>
                                )}
                            </div>
                            <ChatPreview config={config} messages={messages} />
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setMessages([])}
                                    className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800 rounded-xl h-11"
                                >
                                    <RefreshCw className="size-4 mr-2" />
                                    Reset
                                </Button>
                                <Button
                                    onClick={handleDownloadImage}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl h-11"
                                >
                                    <Download className="size-4 mr-2" />
                                    Download
                                </Button>
                            </div>

                            {messages.length > 0 && (
                                <Button
                                    variant="destructive"
                                    onClick={handleClearMessages}
                                    className="w-full rounded-xl h-11"
                                >
                                    <Trash2 className="size-4 mr-2" />
                                    Clear All Messages
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
export default BuilderPage;
