# SamaTontine — MVP full stack

SamaTontine est un MVP élégant de gestion de tontines pensé pour le Sénégal.

## Ce que fait cette version
- Créer une tontine
- Ajouter des membres dès la création
- Voir un tableau de bord premium
- Enregistrer des paiements manuels
- Suivre le prochain bénéficiaire
- Enregistrer les redistributions
- Ajouter des membres après création
- Voir l'historique des paiements et bénéficiaires

## Stack technique
- Frontend : React + Vite
- Backend : Node.js + Express
- Base de données : SQLite (fichier local automatique)

## Pourquoi SQLite ici ?
Pour que tu puisses lancer le projet immédiatement sans installer PostgreSQL.
Quand le MVP sera validé, on pourra migrer vers PostgreSQL.

---

## 1. Prérequis à installer
Installe seulement ceci :

### A. Node.js
Télécharge la version LTS depuis le site officiel de Node.js.
Pendant l'installation, laisse les options par défaut.

### B. VS Code
Installe Visual Studio Code.

### C. Extensions VS Code utiles
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- SQLite Viewer (optionnel)

---

## 2. Ouvrir le projet
Dézippe le dossier, puis ouvre le dossier `samatontine` dans VS Code.

Tu dois voir :

- `backend/`
- `frontend/`
- `README.md`

---

## 3. Installation du backend
Dans VS Code, ouvre un terminal dans le dossier `backend` puis exécute :

```bash
npm install
```

Ensuite copie `.env.example` en `.env`.

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

Puis lance le backend :

```bash
npm run dev
```

Le backend doit tourner sur :

```text
http://localhost:5000
```

---

## 4. Installation du frontend
Ouvre un deuxième terminal dans le dossier `frontend` puis exécute :

```bash
npm install
npm run dev
```

Le frontend doit tourner sur :

```text
http://localhost:5173
```

---

## 5. Utilisation
1. Ouvre `http://localhost:5173`
2. Crée une tontine
3. Ajoute au moins 2 membres
4. Sélectionne la tontine dans la colonne de gauche
5. Enregistre les paiements
6. Enregistre le bénéficiaire du cycle

---

## 6. Où sont les données ?
La base SQLite se crée automatiquement ici :

```text
backend/database.sqlite
```

Donc même si tu fermes l'application, les données restent.

---

## 7. En cas d'erreur CORS
Vérifie que dans `backend/.env` tu as bien :

```env
FRONTEND_URL=http://localhost:5173
```

Puis redémarre le backend.

---

## 8. Améliorations prévues ensuite
- Authentification administrateur
- Impression PDF d'une tontine
- Export Excel
- Notifications WhatsApp / SMS
- Paiement mobile money
- Tableau d'échéances automatiques
- Déploiement en ligne
- Migration PostgreSQL

---

## 9. Conseils test terrain
Pour tester ce MVP intelligemment :
- crée 3 tontines fictives
- teste avec 5 à 10 paiements
- observe si l'interface est comprise sans explication
- note les remarques utilisateurs

