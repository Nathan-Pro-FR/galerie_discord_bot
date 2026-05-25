// Sélection de la grille HTML où intégrer les médias
const galleryGrid = document.getElementById('gallery-grid');

/**
 * Fonction simplifiée pour vérifier si un lien correspond à une vidéo
 * @param {string} url - Le lien du média à tester
 * @returns {boolean} - Vrai si c'est une vidéo, faux sinon
 */
function isVideo(url) {
    const urlMinuscule = url.toLowerCase();
    return urlMinuscule.includes('.mp4') || 
           urlMinuscule.includes('.mov') || 
           urlMinuscule.includes('.webm') || 
           urlMinuscule.includes('.ogg');
}

/**
 * Fonction principale qui récupère les données et affiche la galerie
 */
async function chargerGalerie() {
    try {
        // 1. Récupération du fichier JSON généré par GitHub Actions
        const reponse = await fetch('donnees.json');
        
        // Vérification si le fichier a bien été trouvé
        if (!reponse.ok) {
            throw new Error(`Erreur HTTP ! Statut : ${reponse.status}`);
        }

        // 2. Conversion du contenu en tableau JavaScript
        const mediaUrls = await reponse.json();
        console.log("Contenu de donnees.json reçu :", mediaUrls);

        // Si le fichier JSON existe mais qu'il ne contient aucune image
        if (mediaUrls.length === 0) {
            galleryGrid.innerHTML = `<p style="color: gray; text-align: center; grid-column: 1/-1;">Aucun média trouvé dans le salon Discord. Postez-en un !</p>`;
            return;
        }

        // Vider la grille avant d'ajouter les éléments (évite les doublons)
        galleryGrid.innerHTML = '';

        // 3. Boucle sur chaque lien pour créer les éléments visuels
        mediaUrls.forEach(url => {
            const card = document.createElement('div');
            card.className = 'media-card';

            if (isVideo(url)) {
                // Configuration pour une vidéo
                const video = document.createElement('video');
                video.src = url;
                video.controls = true;
                video.preload = "metadata";
                card.appendChild(video);
            } else {
                // Configuration pour une image
                const img = document.createElement('img');
                img.src = url;
                img.alt = "Média de la galerie";
                img.loading = "lazy"; // Optimise le chargement
                
                // Gestion de l'erreur si le lien Discord a expiré
                img.onerror = function() {
                    this.src = 'https://placehold.co/600x400?text=Lien+Discord+Expire';
                    this.style.objectFit = 'contain';
                };
                card.appendChild(img);
            }

            // Ajout de la carte finale dans notre grille de site
            galleryGrid.appendChild(card);
        });

    } catch (erreur) {
        console.error("Impossible de charger la galerie :", erreur);
        galleryGrid.innerHTML = `<p style="color: red; text-align: center; grid-column: 1/-1;">Erreur lors du chargement des médias. Vérifiez la console.</p>`;
    }
}

// Lancement automatique de la fonction au chargement de la page
chargerGalerie();
