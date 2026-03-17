const API_BASE_URL = "https://chatmemegenerator-production.up.railway.app";

export const chatApi = {
    createChat: async (chatConfig) => {
        const response = await fetch(`${API_BASE_URL}/chats`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                platform: chatConfig.platform.toLowerCase(),
                title: chatConfig.title,
                subtitle: chatConfig.subtitle,
                theme: chatConfig.theme || "light",
            }),
        });
        if (!response.ok) throw new Error("Failed to create chat");
        return response.json();
    },

    updateChat: async (chatId, chatConfig) => {
        const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                platform: chatConfig.platform,
                title: chatConfig.title,
                subtitle: chatConfig.subtitle,
                theme: chatConfig.theme || "light",
            }),
        });
        if (!response.ok) throw new Error("Failed to update chat");
        return response.json();
    },

    addMessage: async (chatId, messageData) => {
        const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messageData),
        });
        if (!response.ok) throw new Error("Failed to add message");
        return response.json();
    },

    uploadAvatar: async (participantId, file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/participants/${participantId}/avatar`, {
            method: "POST",
            body: formData,
        });
        if (!response.ok) throw new Error("Failed to upload avatar");
        return response.json();
    },

    getPreviewUrl: (chatId) => `${API_BASE_URL}/chats/${chatId}/preview?t=${Date.now()}`,
};
