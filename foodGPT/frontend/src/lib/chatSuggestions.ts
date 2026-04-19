/**
 * Chat Prompt Suggestions
 * Helpful conversation starters for recipe chat
 */

export const CHAT_SUGGESTIONS = [
    // Substitutions
    "What can I substitute for eggs?",
    "Can I use olive oil instead of butter?",
    "What's a good dairy-free alternative?",
    "How can I make this vegan?",

    // Techniques
    "How do I know when it's done?",
    "What's the best way to dice onions?",
    "Can I make this in an air fryer?",
    "How do I prevent it from sticking?",

    // Modifications
    "How can I make this spicier?",
    "Can I add more vegetables?",
    "How do I reduce the calories?",
    "Can this be made gluten-free?",

    // Timing & Storage
    "How long does this take to cook?",
    "Can I prepare this ahead of time?",
    "How should I store leftovers?",
    "Can I freeze this dish?",

    // Serving
    "What should I serve this with?",
    "How many servings does this make?",
    "What wine pairs well with this?",
    "Can I double the recipe?",

    // Troubleshooting
    "Why is my dish too salty?",
    "How do I fix overcooked pasta?",
    "What if I don't have an oven?",
    "Can I use a different pan size?",
];

export function getRandomSuggestions(count: number = 4): string[] {
    const shuffled = [...CHAT_SUGGESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

export function getCategorizedSuggestions() {
    return {
        substitutions: CHAT_SUGGESTIONS.slice(0, 4),
        techniques: CHAT_SUGGESTIONS.slice(4, 8),
        modifications: CHAT_SUGGESTIONS.slice(8, 12),
        timing: CHAT_SUGGESTIONS.slice(12, 16),
        serving: CHAT_SUGGESTIONS.slice(16, 20),
        troubleshooting: CHAT_SUGGESTIONS.slice(20, 24),
    };
}
