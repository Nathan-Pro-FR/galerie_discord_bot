// Sélection de la grille HTML où intégrer les médias
const galleryGrid = document.getElementById('gallery-grid');
const mainGalerie = document.getElementById('main-galerie');

// Conservé ici pour plus tard
const HASH_VALIDE = "bbc733059449d0c366316f888f5b0c84ccc63e700df360d9b9b07bbe10b0233d";

async function générerSHA256(chaine) {
    const utf8 = new TextEncoder().encode(chaine);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(bytes => bytes.toString(16).padStart(2, '0')).join('');
}

async function verifierMotDePasse() {
    // --- MODIFICATION ICI : On force l'accès direct sans demander de mot de passe ---
    if (mainGalerie) mainGalerie.style.display = 'block';
    chargerGalerie();
    return;
    // --------------------------------------------------------------------------------
    
    // Tout le reste du code est conservé en dessous mais ne s'exécutera pas pour l'instant
    if (sessionStorage.getItem('galerie_authentifiee') === 'true') {
        if (mainGalerie) mainGalerie.style.display = 'block';
        chargerGalerie();
        return;
    }

    const mdpSaisi = prompt("🔒 Cet espace est privé. Veuillez entrer le mot de passe d'accès :");

    if (mdpSaisi === null) {
        if (galleryGrid) {
            galleryGrid.innerHTML = `<p style="color: gray; text-align: center; grid-column: 1/-1; padding: 40px;">Accès refusé. Veuillez rafraîchir la page pour réessayer.</p>`;
        }
        if (mainGalerie) mainGalerie.style.display = 'block';
        return;
    }
    
    const hashSaisi = await générerSHA256(mdpSaisi);

    if (hashSaisi === HASH_VALIDE) {
        sessionStorage.setItem('galerie_authentifiee', 'true');
        if (mainGalerie) mainGalerie.style.display = 'block';
        chargerGalerie();
    } else {
        alert("❌ Mot de passe incorrect !");
        verifierMotDePasse(); 
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
        const reponse = await fetch('donnees.json');
        
        if (!reponse.ok) {
            throw new Error(`Erreur HTTP ! Statut : ${reponse.status}`);
        }

        const mediaUrls = await reponse.json();
        console.log("Contenu de donnees.json reçu :", mediaUrls);

        if (!galleryGrid) return;

        if (mediaUrls.length === 0) {
            galleryGrid.innerHTML = `<p style="color: gray; text-align: center; grid-column: 1/-1;">Aucun média trouvé dans le salon Discord. Postez-en un !</p>`;
            return;
        }

        galleryGrid.innerHTML = ''; 

        mediaUrls.forEach(url => {
            const card = document.createElement('div');
            card.className = 'media-card';

            if (isVideo(url)) {
                const video = document.createElement('video');
                video.src = url;
                video.controls = true;
                video.preload = "metadata";
                video.className = "w-full h-full object-cover";
                card.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = url;
                img.alt = "Média de la galerie";
                img.loading = "lazy"; 
                
                img.onerror = function() {
                    this.src = 'https://placehold.co/600x400?text=Lien+Discord+Expire';
                    this.style.objectFit = 'contain';
                };
                card.appendChild(img);
            }

            galleryGrid.appendChild(card);
        });

    } catch (erreur) {
        console.error("Impossible de charger la galerie :", erreur);
        if (galleryGrid) {
            galleryGrid.innerHTML = `<p style="color: red; text-align: center; grid-column: 1/-1;">Erreur lors du chargement des médias. Vérifiez la console.</p>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', verifierMotDePasse);
