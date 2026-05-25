const fs = require('fs');

// Récupération des variables d'environnement (configurées sur GitHub)
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!DISCORD_TOKEN || !CHANNEL_ID) {
    console.error("Erreur : Les variables DISCORD_TOKEN ou CHANNEL_ID sont manquantes.");
    process.exit(1);
}

async function obtenirMediasDiscord() {
    try {
        // Appel à l'API Discord pour récupérer les 50 derniers messages du salon
        const reponse = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=50`, {
            headers: {
                'Authorization': `Bot ${DISCORD_TOKEN}`
            }
        });

        if (!reponse.ok) {
            throw new Error(`Erreur API Discord : ${reponse.status} ${reponse.statusText}`);
        }

        const messages = await reponse.json();
        const listeMedias = [];

        // Parcours des messages pour extraire les fichiers joints
        messages.forEach(msg => {
            if (msg.attachments && msg.attachments.length > 0) {
                msg.attachments.forEach(attachment => {
                    // On vérifie si c'est une image ou une vidéo
                    const estMedia = attachment.content_type && (
                        attachment.content_type.startsWith('image/') || 
                        attachment.content_type.startsWith('video/')
                    );

                    if (estMedia) {
                        // On ajoute le lien tout neuf fourni par l'API
                        listeMedias.push(attachment.url);
                    }
                });
            }
        });

        // Écriture des liens mis à jour dans le fichier donnees.json
        fs.writeFileSync('donnees.json', JSON.stringify(listeMedias, null, 2));
        console.log(`Succès : ${listeMedias.length} médias synchronisés avec donnees.json !`);

    } catch (erreur) {
        console.error("Erreur lors de la récupération des médias :", erreur);
        process.exit(1);
    }
}

obtenirMediasDiscord();