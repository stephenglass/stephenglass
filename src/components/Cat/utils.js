export function getEmojiByClickCount(count) {
    // Add more conditions here for future emoji changes
    if (count % 10 === 0) {
        return "🐀";
    }
    return "❤️"
}