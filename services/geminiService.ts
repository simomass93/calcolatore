import { GoogleGenAI, Type } from "@google/genai";
import type { Coordinates } from "../types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!GEMINI_API_KEY) {
  console.warn('VITE_GEMINI_API_KEY non impostata. Le funzioni di geocoding potrebbero fallire.');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const coordinateSchema = {
    type: Type.OBJECT,
    properties: {
        lat: { type: Type.NUMBER, description: "Latitudine della città" },
        lon: { type: Type.NUMBER, description: "Longitudine della città" },
    },
    required: ["lat", "lon"],
};

const regionSchema = {
    type: Type.OBJECT,
    properties: {
        region: { type: Type.STRING, description: "La regione italiana di appartenenza della città" },
    },
    required: ["region"],
}

export const getCoordinatesForCity = async (cityName: string): Promise<Coordinates> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Fornisci le coordinate geografiche (latitudine e longitudine) per la città: ${cityName}, Italia.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: coordinateSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const coordinates = JSON.parse(jsonText);
        
        if (typeof coordinates.lat === 'number' && typeof coordinates.lon === 'number') {
            return coordinates;
        } else {
            console.error("Parsed coordinates are not in the expected format:", coordinates);
            throw new Error(`Formato coordinate non valido per "${cityName}".`);
        }
    } catch (error) {
        console.error(`Error fetching coordinates for ${cityName}:`, error);
        throw new Error(`Impossibile ottenere le coordinate per "${cityName}". Potrebbe essere un nome di città non valido o un problema di rete. Riprova.`);
    }
};


export const getRegionForCity = async (cityName: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Qual è la regione italiana per la città: ${cityName}?`,
            config: {
                responseMimeType: "application/json",
                responseSchema: regionSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);

        if (typeof data.region === 'string') {
            return data.region;
        } else {
             throw new Error(`Formato regione non valido per "${cityName}".`);
        }
    } catch (error) {
        console.error(`Error fetching region for ${cityName}:`, error);
        throw new Error(`Impossibile ottenere la regione per "${cityName}".`);
    }
}