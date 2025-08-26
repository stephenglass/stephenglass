export function getEmojiByClickCount(count) {
    // Add more conditions here for future emoji changes
    if (count % 10 === 0) {
        return "🐀";
    }
    return "❤️"
}

export function getAnimationByClickCount(count) {
    // Add more conditions here for future emoji changes
    if (count % 20 === 0) {
        return "animate-bounce";
    }
    else if (count % 30 === 0) {
        return "animate-spin";
    }
    return "animate-[wiggle_0.3s_ease-in-out]"
}