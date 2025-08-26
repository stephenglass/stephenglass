export function getEmojiByClickCount(count) {
    // Add more conditions here for future emoji changes
    if (count % 20 === 0) {
        return "🐟";
    }
    if (count % 10 === 0) {
        return "🐀";
    }
    return "❤️";
}

export function getAnimationByClickCount(count) {
    // Add more conditions here for future animation changes
    if (count % 30 === 0) {
        return "animate-spin";
    }
    if (count % 20 === 0) {
        return "animate-bounce";
    }
    return "animate-[wiggle_0.3s_ease-in-out]";
}