import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function ChatPreview({ config, messages }) {
    const isDark = config.theme === "dark";
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const platformStyles = {
        whatsapp: {
            bg: isDark ? "bg-[#0b141a]" : "bg-[#efeae2]",
            header: isDark ? "bg-[#1f2c33]" : "bg-[#075e54]",
            headerText: "text-white",
        },
        instagram: {
            bg: isDark ? "bg-black" : "bg-white",
            header: isDark ? "bg-neutral-900" : "bg-white",
            headerText: isDark ? "text-white" : "text-black",
        },
        chatgpt: {
            bg: isDark ? "bg-[#343541]" : "bg-white",
            header: isDark ? "bg-[#202123]" : "bg-white",
            headerText: isDark ? "text-white" : "text-black",
        },
    };

    const style = platformStyles[config.platform];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-xl mx-auto">
                <div className={`${style.header} px-4 py-3 flex items-center gap-3`}>
                    <div className="size-10 rounded-full bg-neutral-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className={`${style.headerText} font-medium truncate`}>
                            {config.title || "Chat Title"}
                        </div>
                        {config.subtitle && (
                            <div className={`${style.headerText} text-xs opacity-70 truncate`}>
                                {config.subtitle}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`${style.bg} h-[650px] overflow-y-auto p-4 space-y-2`}>
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className={isDark ? "text-neutral-500" : "text-neutral-400"}>
                                No messages yet. Add your first message!
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    platform={config.platform}
                                    theme={config.theme}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
