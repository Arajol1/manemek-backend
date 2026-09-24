const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY manquante dans .env');
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function genererAnalyseIA(type, donnees, periodeDebut, periodeFin) {
    const prompt = `Tu es l'assistant intelligent de la plateforme Manemek.

Manemek est une plateforme de gestion des collaborateurs,
des missions, des présences, des équipements, des incidents
et des comptes rendus.

Tu dois analyser les statistiques fournies par le système.

Type d'analyse :
${type}

Période :
Du ${periodeDebut} au ${periodeFin}

STATISTIQUES :
${JSON.stringify(donnees, null, 2)}

Consignes :

- Analyse uniquement les données fournies.
- Ne fabrique aucune information.
- Ne considère pas les données manquantes comme des problèmes.
- Identifie les tendances importantes.
- Identifie les anomalies éventuelles.
- Fournis des recommandations concrètes et réalistes.
- Utilise un langage professionnel et simple.
- Réponds en français.

Structure obligatoire :

RÉSUMÉ
Présente une synthèse courte de la situation.

OBSERVATIONS
Présente les principaux éléments observés.

POINTS D'ATTENTION
Présente les anomalies, risques ou problèmes détectés.
S'il n'y en a pas, indique-le.

RECOMMANDATIONS
Propose des actions concrètes basées uniquement sur les données.

Ne donne aucune recommandation qui n'est pas justifiée par
les données disponibles.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt,
            config: {
                temperature: 0.3,
                maxOutputTokens: 2000,
            },
        });

        return response.text;

    } catch (error) {
        console.error('Erreur Gemini API :', error?.message || error);
        throw new Error('Impossible de générer l’analyse avec Gemini.');
    }
}

module.exports = { genererAnalyseIA };