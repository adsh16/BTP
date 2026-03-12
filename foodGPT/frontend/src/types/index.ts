export interface FoodQualityData {
    quality_score: number;
    rating: string;
    analysis: {
        freshness: string;
        texture: string;
        color_quality: string;
        cooking_level: string;
        presentation: string;
        hygiene_estimate: string;
    };
    explanation: string;
}

export interface Recipe {
    title: string;
    ingredients: string[];
    instructions: string[];
    image_url: string;
    food_quality?: FoodQualityData;
}

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}
