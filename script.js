// Sélection de la grille HTML où intégrer les médias
const galleryGrid = document.getElementById('gallery-grid');

/**
 * Fonction pour vérifier si un lien correspond à une vidéo
 * @param {string} url - Le lien du média à tester
 * @returns {boolean} - Vrai si c'est une vidéo, faux sinon
 */
function isVideo(url) {
    return url.match(/\.(mp4|mov|webm|ogg)($|\?)/i) !== null;
}

/**
 * Fonction principale qui récupère les données et affiche la galerie
 */
async function chargerGalerie() {
    try {
        // 1. Récupération du fichier JSON (il doit être dans le même dossier)
        const reponse = await fetch('donnees.json');
        
        // Vérification si le fichier a bien été trouvé
        if (!reponse.ok) {
            throw new Error(`Erreur HTTP ! Statut : ${reponse.status}`);
        }

        // 2. Conversion du contenu du fichier en tableau JavaScript
        const mediaUrls = await reponse.json();

        // 3. Boucle sur chaque lien pour créer les éléments visuels
        mediaUrls.forEach(url => {
            const card = document.createElement('div');
            card.className = 'media-card';

            if (isVideo(url)) {
                // Configuration pour une vidéo
                const video = document.createElement('video');
                video.src = url;
                video.controls = true;
                card.appendChild(video);
            } else {
                // Configuration pour une image
                const img = document.createElement('img');
                img.src = url;
                img.alt = "Média de la galerie";
                
                // Gestion de l'erreur si le lien a expiré entre temps
                img.onerror = function() {
                    this.src = 'https://placehold.co/600x400?text=Lien+Discord+Expire';
                };
                card.appendChild(img);
            }

            // Ajout de la carte finale dans notre grille de site
            galleryGrid.appendChild(card);
        });

    } catch (erreur) {
        console.error("Impossible de charger la galerie :", erreur);
        galleryGrid.innerHTML = `<p style="color: red; text-align: center;">Erreur lors du chargement des médias.</p>`;
    }
}

// Lancement automatique de la fonction au chargement de la page
chargerGalerie();