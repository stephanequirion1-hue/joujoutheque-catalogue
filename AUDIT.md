# Audit complet - Joujoutheque Soft

## 1. Architecture de l'application

**App:** Joujoutheque Soft (Model-driven Power App)
**Environnement:** org5a5750af.crm3.dynamics.com

### Tables et volumes

| Table | Records | Formulaire | Vues actives |
|-------|---------|------------|--------------|
| Contact | 194 | "Contact formulaire principal" | (standard) |
| Account | 6 | "Compte Joujou" | (standard) |
| Inventaire | 997 | "Jouet" | 01-Inventaires des jouets |
| Mouvement | 2 314 | "Emprunt" | 01-Jouets sortis, 02-Historiques, 03-Jouets sortis (Non membre) |
| Paiement | 239 | "Creation du paiement" | 01-Paiements en attente, 02-Paye, 03-Tous |
| Commandite | 6 | "Formulaire de commandites" | Commandites actives, Commandites inactives |
| Donation | 0 | "Donation" | Donations actifs |
| Benevolat | 0 | "Informations" (1 champ) | Benevolats actifs |

---

## 2. Colonnes custom par table

### Contact (6 colonnes custom)
- joujou_identifiantclient (String) - ex: "0054"
- joujou_membre (Picklist: Membre / Non Membre)
- joujou_typedecontact (Picklist: Client / Benevole)
- joujou_actionrapide (String)

### Account (3 colonnes custom)
- joujou_nombredesiegetotal (Integer)
- joujou_nombredesiegedispo (Integer)
- joujou_nombredesiegedisponible (String) - ex: "200 siege(s) disponible(s)"

### Inventaire (29 colonnes, 14 significatives)
- joujou_identifiantjouet (String)
- joujou_nojouet (Integer)
- joujou_nom (String) - nom du jouet
- joujou_datedecreation (DateTime)
- joujou_categoriedejeux (Picklist: 7 categories developpementales)
- joujou_valeurdujouet (Money)
- joujou_contenudujouet (String)
- joujou_photojeu / joujou_photocontenu (Image)
- joujou_reglementsplastifies (Boolean)
- joujou_etatdujouet (Picklist: Retour / Emprunt / En reparation)
- joujou_conditiondujouet (Picklist: Tres mauvais -> Tres bon)
- joujou_localisationdujouet (Picklist: A-1 a C-1)
- joujou_emprunteur (Lookup -> Contact)

### Mouvement (18 colonnes, 9 significatives)
- joujou_nomdumouvement (String) - auto-genere: "NomClient | NomJouet"
- joujou_emprunteur (Lookup -> Contact)
- joujou_jouetemprunte (Lookup -> Inventaire)
- joujou_datedelemprunt (DateTime)
- joujou_datederetour (DateTime)
- joujou_etatdumouvement (Picklist: Retour / Emprunt / En reparation)
- joujou_etatdujouet (Picklist: condition au retour)
- joujou_contenudelaboite (Boolean)
- joujou_localisationdelaremise (Picklist)
- joujou_commentairesurlacondition (String)

### Paiement (28 colonnes, ~14 significatives)
- joujou_nom (String) - auto?
- joujou_nomduclient (Lookup -> Contact)
- joujou_datedetransaction (DateTime) - Required
- joujou_montant (Money)
- joujou_methodedepaiement (Picklist: Argent comptant / Interact / Commandite)
- joujou_originepaiement (Picklist: Paiement initial / Renouvellement)
- joujou_nombreanneerenouveller (Picklist: 1-5)
- joujou_daterenouvele (DateTime) - date du renouvellement
- joujou_dateexpirationabonnement (DateTime)
- joujou_daterappel (DateTime)
- joujou_statutdurenouvellement (Picklist: Renouvele / Renouvellement en attente)
- joujou_renouvellementfait (Boolean)
- joujou_organisationcommanditee (Lookup -> Account)
- joujou_note (String)
- joujou_datedepaiement (DateTime) - REDONDANT?
- joujou_datederappel (DateTime) - REDONDANT avec joujou_daterappel?
- joujou_datederenouvellement (DateTime) - REDONDANT avec joujou_dateexpirationabonnement?

### Commandite (8 colonnes, 4 significatives)
- joujou_nom (String)
- joujou_organisation (Lookup -> Account)
- joujou_datedelacommandite (DateTime)
- joujou_nombredesiege (Integer)
- joujou_nombredesiegedisponible (String) - texte libre

### Donation (13 colonnes, 5 significatives)
- joujou_nom (String)
- joujou_datedeladonation (DateTime)
- joujou_valeurdeladonation (Money)
- joujou_typedepaiement (Picklist: Argent comptant / Interact / Cheque / Don materiel)
- joujou_donateurcontact (Lookup -> Contact)
- joujou_donateurorganisation (Lookup -> Account)

### Benevolat (2 colonnes)
- joujou_nom (String) - SEULE colonne

---

## 3. Picklist Values

### Categories de jeux (Inventaire)
760800000: Developpement physique
760800001: Developpement cognitif
760800002: Developpement memoire
760800003: Developpement motricite fine
760800004: Developpement du language
760800005: Developpement social
760800006: Developpement affectif

### Condition du jouet (Inventaire + Mouvement)
760800000: Tres mauvais etat
760800001: Mauvais etat
760800002: Bon etat
760800003: Tres bon etat

### Statut du jouet / Etat du mouvement
760800000: Retour
760800001: Emprunt
760800002: En reparation

### Localisation (Inventaire + Mouvement)
760800000-006: A-1, A-2, A-3, B-1, B-2, B-3, C-1

### Methode de paiement (Paiement)
760800000: Argent comptant
760800001: Interact
760800002: Comman dite (TYPO)

### Nombre annees renouveler (Paiement)
760800000-004: 1, 2, 3, 4, 5

### Origine paiement
760800000: Paiement initial
760800001: Renouvellement

### Statut renouvellement
760800000: Renouvele
760800001: Renouvellement en attente

### Type paiement donation
760800000: Argent comptant
760800001: Interact
760800002: Cheque
760800003: Don materiel

### Membre (Contact)
760800000: Membre
760800001: Non Membre

### Type de contact
760800000: Client
760800001: Benevole

---

## 4. Power Automate Flows

### ACTIFS (7)

#### Mouvement - Creation
- Trigger: Ajout de ligne (joujou_mouvement)
- Actions:
  1. Get Contact + Get Inventaire
  2. Construit NomMouvement = "NomClient | NomJouet"
  3. Update Mouvement (nom auto)
  4. Update Inventaire (statut -> Emprunt, emprunteur -> contact)

#### Mouvements - Retour
- Trigger: Modification de ligne (joujou_mouvement)
- Actions:
  1. Get Inventaire + Contact
  2. Update Inventaire (statut -> Retour, condition, localisation)
  3. Update Mouvement (nom)
  4. IF contenu boite = false -> Envoie email a info@ pour verifier

#### Mouvement - Rappel de retour de jeux
- Trigger: Recurrence quotidienne
- Actions:
  1. Liste tous les mouvements (filtre: emprunt actif?)
  2. Pour chaque: compare date retour avec today+4 jours
  3. Envoie email de rappel au contact

#### Paiement - Creation
- Trigger: Ajout de ligne (joujou_paiement)
- Actions:
  1. Get Contact (nom, courriel)
  2. Verifie si paiement existant pour ce client
  3. SI premier paiement:
     - SI commandite: Get Account, decremente sieges dispo
     - Update Paiement (dates calculees)
     - Email de remerciement
  4. SI paiement existant (doublon):
     - Email d'alerte
     - Desactive le paiement doublon

#### Paiement - Renouvellement
- Trigger: Modification de ligne (joujou_paiement)
- Actions:
  1. Calcule BaseDate = max(ExpirationActuelle, TransactionDate)
  2. Calcule NouvelleExpiration = BaseDate + NombreAnnees
  3. Met a jour ancien paiement (renouvele)
  4. Cree nouveau paiement avec nouvelles dates

#### Paiement - Rappel de renouvellement
- Trigger: Recurrence quotidienne
- Actions:
  1. Liste tous les paiements
  2. Pour chaque: compare DateRappel avec aujourd'hui
  3. Envoie email de rappel

#### Paiement - Desactiver membre non paye
- Trigger: Recurrence quotidienne
- Actions:
  1. Liste tous les contacts
  2. Pour chaque: cherche paiements actifs
  3. SI aucun paiement -> Contact.Membre = "Non Membre"
  4. SI paiement existe -> Contact.Membre = "Membre"

### DRAFT (6)

#### Commandite - Creation (Draft)
- Met a jour le nom de commandite et sieges dispo sur Account
- JAMAIS ACTIVE

#### Commandite - Modification (Draft)
- Gere desactivation et modification du nombre de sieges
- JAMAIS ACTIVE

#### Inventaire - Modification numero jouet (Draft)
- Recurrence hebdomadaire, met a jour identifiantjouet
- JAMAIS ACTIVE

#### 3 flows systeme (Search, SLA) - sans interet

---

## 5. Formulaires

### Contact: "Contact formulaire principal"
- 1 tab (SUMMARY_TAB)
- Champs: prenom, nom, type contact, email, membre, mobile, action rapide, adresse complete, owner

### Inventaire: "Jouet"
- 1 tab (gen_tab)
- Champs: identifiant, nom, date creation, categorie, valeur, contenu, photo jeu, photo contenu, reglements plastifies, statut, owner
- NOTE: Pas de champ conditiondujouet, localisationdujouet, nojouet, ni emprunteur dans le formulaire!

### Mouvement: "Emprunt"
- 1 tab (gen_tab)
- Champs: emprunteur, jouet, date emprunt, etat mouvement, etat jouet, contenu boite, localisation remise, commentaire condition, date retour, owner

### Paiement: "Creation du paiement"
- Pas de tab nomme
- Champs: client, date transaction, nb annees, date renouvele, origine, methode, org commanditee, note, date rappel, date expiration, renouvellement fait, owner

### Commandite: "Formulaire de commandites"
- Champs: organisation, date, nombre sieges, statecode, sieges dispos (texte), owner

### Account: "Compte Joujou"
- 1 tab (SUMMARY_TAB)
- Champs: nom, telephone, adresse, owner

### Donation: "Donation"
- 1 tab
- Champs: date, valeur, type paiement, donateur contact, donateur org, owner

### Benevolat: "Informations"
- Champs: nom, owner (VIDE)

---

## 6. Vues

### Inventaire
- 01-Inventaires des jouets: identifiant, nom, date, condition, categorie, statut, emprunteur, localisation

### Mouvement
- 01-Jouets sortis: nom mouvement, date emprunt, date retour (filtre: emprunt actif)
- 02-Historiques: nom mouvement, dates
- 03-Jouets sortis (Non membre): inclut colonne Contact.membre

### Paiement
- 01-Paiements en attente: nom, expiration, rappel, renouvele
- 02-Paye: nom, expiration, rappel, renouvele, statut renouvellement
- 03-Tous: tout + statecode

### Commandite
- Commandites actives / inactives: nom, date, sieges dispos (via lookup Account)
