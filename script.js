// Sélection de la grille HTML où intégrer les médias
const galleryGrid = document.getElementById('gallery-grid');
const mainGalerie = document.getElementById('main-galerie');

const HASH_VALIDE = "59cf0d210dfa6c76dbcb129997cfda86cf103598beabf58062ec87ad9fa96985";

async function générerSHA256(chaine) {
    const utf8 = new TextEncoder().encode(chaine);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(bytes => bytes.toString(16).padStart(2, '0')).join('');
}

async function verifierMotDePasse() {
    if (sessionStorage.getItem('galerie_authentifiee') === 'true') {
        if (mainGalerie) mainGalerie.style.display = 'block';
        chargerGalerie();
        return;
    }

   
    const mdpSaisi = prompt("🔒 Cet espace est privé. Veuillez entrer le mot de passe d'accès :");

    if (mdpSaisi === null) {
        galleryGrid.innerHTML = `<p style="color: gray; text-align: center; grid-column: 1/-1; padding: 40px;">Accès refusé. Veuillez rafraîchir la page pour réessayer.</p>`;
        if (mainGalerie) mainGalerie.style.display = 'block';
        return;
    }
    const hashSaisi = await générerSHA256(mdpSaisi);

    if (hashSaisi === HASH_VALIDE) {
        sessionStorage.setItem('galerie_authentifiee', 'true');
        if (mainGalerie) mainGalerie.style.display = 'block';
        chargerGalerie();
    } else {
        // Mauvais mot de passe
        alert("❌ Mot de passe incorrect !");
        verifierMotDePasse(); // Relance la demande
    }
}

function isVideo(url) {
    const urlMinuscule = url.toLowerCase();
    return urlMinuscule.includes('.mp4') || 
           urlMinuscule.includes('.mov') || 
           urlMinuscule.includes('.webm') || 
           urlMinuscule.includes('.ogg');
}

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

        galleryGrid.innerHTML = ''; // Vide le message de chargement

        // 3. Parcours des URLs pour créer les éléments HTML
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

// Lancement de la vérification de sécurité au chargement de la page
document.addEventListener('DOMContentLoaded', verifierMotDePasse);
