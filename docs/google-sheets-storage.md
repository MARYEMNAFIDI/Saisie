# Google Sheets Storage

## Architecture

Les ecritures passent par cette chaine:

`React app` -> `Next API /api/database` -> `Google Apps Script` -> `Google Sheets`

Le secret partage reste cote serveur Next.js. Le navigateur ne parle jamais directement a Apps Script.

## Variables d'environnement

Ajoutez dans `.env.local`:

```env
GOOGLE_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
GOOGLE_SCRIPT_SHARED_SECRET=change-me-long-random-secret
```

Si ces variables ne sont pas renseignees, l'application retombe sur le stockage local du prototype.

## Deploiement Google Apps Script

1. Creez un Google Sheet vide.
2. Ouvrez `Extensions -> Apps Script`.
3. Copiez le contenu de [Code.gs](/c:/Users/pc gold/Desktop/Saisie/scripts/google-apps-script/Code.gs).
4. Dans `Project Settings -> Script properties`, ajoutez:
   `APP_SPREADSHEET_ID` : l'ID du Google Sheet
   `APP_SHARED_SECRET` : la meme valeur que `GOOGLE_SCRIPT_SHARED_SECRET`
5. Lancez manuellement `setupWorkbookFromEditor` une fois depuis l'editeur Apps Script.
6. Deployez le script en `Web app`:
   `Execute as`: `Me`
   `Who has access`: `Anyone`

## Partage et protection du classeur

Pour que seul React puisse ecrire:

- Partagez le fichier Google Sheets en `Viewer` ou `Commenter` aux utilisateurs metier.
- Ne donnez pas le role `Editor` aux utilisateurs finaux.
- Le script protege les feuilles et verrouille la structure.
- Les colonnes d'audit (`id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`) restent gerees par l'API.

## Feuilles creees

Le script cree ces onglets:

- `mares`
- `reproductions`
- `products`
- `metadata` (masque)

Les en-tetes sont imposes et la structure est verifiee a chaque appel. Si quelqu'un modifie les colonnes manuellement, les ecritures sont bloquees jusqu'a restauration.

## Endpoints Apps Script

Le proxy Next appelle Apps Script avec ces actions:

- `list` : lecture complete du snapshot
- `upsert` : creation ou mise a jour d'un enregistrement
- `configure` : creation des feuilles et protections

## Recommandations

- Utilisez un secret long et aleatoire.
- Ne mettez jamais l'URL Apps Script avec le secret dans le front.
- Gardez le spreadsheet comme source de verite et utilisez l'application pour toute modification.
- Si les protections ont saute, relancez `repairWorkbookProtectionsFromEditor`.
