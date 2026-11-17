// seed.js - Création de 5 collaborateurs fictifs et affectation de missions
const bcrypt = require('bcryptjs');
const { sequelize, User, Mission, Affectation, Equipement, QRCode, MouvementPresence, HistoriqueActivite } = require('./src/models');

async function seedDatabase() {
  try {
    console.log('🔄 Connexion à la base de données SQLite...');
    await sequelize.authenticate();
    
    // Ajout sécurisé des colonnes si inexistantes (évite les conflits SQLite alter)
    try {
      await sequelize.query("ALTER TABLE `Users` ADD COLUMN `competences` JSON;");
    } catch (e) {
      // Ignorer si la colonne existe déjà
    }

    try {
      await sequelize.query("ALTER TABLE `Equipements` ADD COLUMN `quantite` INTEGER DEFAULT 1;");
    } catch (e) {
      // Ignorer
    }

    try {
      await sequelize.query("ALTER TABLE `MouvementPresences` ADD COLUMN `idQRCode` VARCHAR(255);");
    } catch (e) {
      // Ignorer
    }

    await sequelize.sync();
    console.log('✅ Synchronisation de la base de données réussie.');

    const defaultPassword = await bcrypt.hash('Manemek2026!', 10);

    // 1. Création ou mise à jour de l'Admin principal
    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@manemek.com' },
      defaults: {
        nom: 'Jenkins',
        prenom: 'Sarah',
        email: 'admin@manemek.com',
        password: defaultPassword,
        role: 'ADMIN',
        actif: true,
        niveauAcces: 'SUPER_ADMIN',
        departement: 'Direction',
        poste: 'Portail d\'administration',
        telephone: '+33 1 40 00 00 01'
      }
    });

    // 2. Définition des 5 collaborateurs fictifs avec des rôles et départements variés
    const mockUsers = [
      {
        nom: 'Sterling',
        prenom: 'Marcus',
        email: 'marcus.sterling@manemek.com',
        password: defaultPassword,
        role: 'ADMIN',
        actif: true,
        niveauAcces: 'Grade A+',
        departement: 'Logistique & Sécurité',
        poste: 'Senior Operations Security Agent',
        telephone: '+33 6 12 34 56 78',
        competences: [
          { name: 'Tactical Awareness', percentage: 95 },
          { name: 'Crisis Management', percentage: 88 },
          { name: 'Communication', percentage: 72 },
          { name: 'First Aid Level 2', percentage: 100 },
          { name: 'Inventory Software', percentage: 65 }
        ]
      },
      {
        nom: 'Rodriguez',
        prenom: 'Elena',
        email: 'elena.rodriguez@manemek.com',
        password: defaultPassword,
        role: 'RESPONSABLE',
        actif: true,
        niveauAcces: 'Grade A',
        departement: 'Sécurité',
        poste: 'Safety Specialist',
        telephone: '+33 6 23 45 67 89',
        competences: [
          { name: 'Safety Protocols', percentage: 92 },
          { name: 'Team Coordination', percentage: 85 },
          { name: 'Risk Assessment', percentage: 90 },
          { name: 'Emergency Response', percentage: 80 }
        ]
      },
      {
        nom: 'Chen',
        prenom: 'David',
        email: 'david.chen@manemek.com',
        password: defaultPassword,
        role: 'RESPONSABLE',
        actif: true,
        niveauAcces: 'Grade B+',
        departement: 'Maintenance',
        poste: 'Technical Supervisor',
        telephone: '+33 6 34 56 78 90',
        competences: [
          { name: 'Equipment Diagnostics', percentage: 95 },
          { name: 'Preventive Maintenance', percentage: 90 },
          { name: 'Technical Support', percentage: 85 },
          { name: 'Calibration', percentage: 78 }
        ]
      },
      {
        nom: 'Valery',
        prenom: 'Sophie',
        email: 'sophie.valery@manemek.com',
        password: defaultPassword,
        role: 'COLLABORATEUR',
        actif: true,
        niveauAcces: 'Grade B',
        departement: 'Administration',
        poste: 'HR Coordinator',
        telephone: '+33 6 45 67 89 01',
        competences: [
          { name: 'Human Resources', percentage: 88 },
          { name: 'Compliance & Audits', percentage: 82 },
          { name: 'Personnel Logistics', percentage: 75 }
        ]
      },
      {
        nom: 'Dupont',
        prenom: 'Julien',
        email: 'julien.dupont@manemek.com',
        password: defaultPassword,
        role: 'COLLABORATEUR',
        actif: true,
        niveauAcces: 'Grade B',
        departement: 'Logistique',
        poste: 'Field Operator',
        telephone: '+33 6 56 78 90 12',
        competences: [
          { name: 'Field Operations', percentage: 90 },
          { name: 'Perimeter Security', percentage: 85 },
          { name: 'Surveillance Gear', percentage: 78 }
        ]
      }
    ];

    const createdUsers = [];
    for (const u of mockUsers) {
      let user = await User.findOne({ where: { email: u.email } });
      if (!user) {
        user = await User.create(u);
        console.log(`👤 Collaborateur créé : ${user.prenom} ${user.nom} (${user.role} - ${user.poste})`);
      } else {
        await user.update(u);
        console.log(`ℹ️ Collaborateur mis à jour : ${user.prenom} ${user.nom} (${user.role})`);
      }
      createdUsers.push(user);
    }

    const [marcus, elena, david, sophie, julien] = createdUsers;

    // 3. Création des 5 missions fictives
    const mockMissions = [
      {
        codeMission: 'MS-2026-001',
        titre: 'Security Audit - Site Alpha',
        description: 'Audit de sécurité physique et contrôle des accès du campus industriel Nexus Corp.',
        responsableId: elena.idUtilisateur,
        dateDebut: new Date('2026-03-10'),
        dateFin: new Date('2026-03-15'),
        statut: 'EN_COURS',
        priorite: 'HAUTE',
        localisation: 'Paris, France',
        collaborateurs: [
          { user: marcus, fonction: 'Chef d\'équipe sécurité' },
          { user: julien, fonction: 'Opérateur de patrouille' }
        ]
      },
      {
        codeMission: 'MS-2026-002',
        titre: 'Equipment Delivery Logistics',
        description: 'Acheminement sécurisé d\'équipements de communication et vérification des inventaires.',
        responsableId: david.idUtilisateur,
        dateDebut: new Date('2026-03-12'),
        dateFin: new Date('2026-03-13'),
        statut: 'PLANIFIEE',
        priorite: 'NORMALE',
        localisation: 'Lyon, France',
        collaborateurs: [
          { user: sophie, fonction: 'Supervision logistique' },
          { user: julien, fonction: 'Chauffeur & Manutention' }
        ]
      },
      {
        codeMission: 'MS-2026-003',
        titre: 'VIP Escort Service',
        description: 'Protection rapprochée et escorte de délégation privée lors d\'un événement officiel.',
        responsableId: marcus.idUtilisateur,
        dateDebut: new Date('2026-03-05'),
        dateFin: new Date('2026-03-08'),
        statut: 'TERMINEE',
        priorite: 'HAUTE',
        localisation: 'Monaco',
        collaborateurs: [
          { user: marcus, fonction: 'Officier de protection lead' },
          { user: elena, fonction: 'Spécialiste sécurité périmétrique' }
        ]
      },
      {
        codeMission: 'MS-2026-004',
        titre: 'Warehouse Surveillance',
        description: 'Mise en place de rondes régulières et vérification des scellés de sécurité de l\'entrepôt central.',
        responsableId: elena.idUtilisateur,
        dateDebut: new Date('2026-03-15'),
        dateFin: new Date('2026-03-20'),
        statut: 'PLANIFIEE',
        priorite: 'BASSE',
        localisation: 'Marseille, France',
        collaborateurs: [
          { user: julien, fonction: 'Surveillant d\'entrepôt' },
          { user: david, fonction: 'Support vidéosurveillance' }
        ]
      },
      {
        codeMission: 'MS-2026-005',
        titre: 'Critical Infrastructure Check',
        description: 'Inspection technique approfondie des installations réseau et des générateurs d\'urgence.',
        responsableId: david.idUtilisateur,
        dateDebut: new Date('2026-03-11'),
        dateFin: new Date('2026-03-11'),
        statut: 'EN_COURS',
        priorite: 'HAUTE',
        localisation: 'Bordeaux, France',
        collaborateurs: [
          { user: david, fonction: 'Superviseur technique' },
          { user: sophie, fonction: 'Gestionnaire rapport et suivi' }
        ]
      }
    ];

    // 4. Insertion des missions et des affectations
    for (const mData of mockMissions) {
      let mission = await Mission.findOne({ where: { codeMission: mData.codeMission } });
      if (!mission) {
        mission = await Mission.create({
          codeMission: mData.codeMission,
          titre: mData.titre,
          description: mData.description,
          responsableId: mData.responsableId,
          dateDebut: mData.dateDebut,
          dateFin: mData.dateFin,
          statut: mData.statut,
          priorite: mData.priorite,
          localisation: mData.localisation
        });
        console.log(`📋 Mission créée : ${mission.codeMission} - ${mission.titre}`);
      } else {
        await mission.update({
          titre: mData.titre,
          description: mData.description,
          responsableId: mData.responsableId,
          dateDebut: mData.dateDebut,
          dateFin: mData.dateFin,
          statut: mData.statut,
          priorite: mData.priorite,
          localisation: mData.localisation
        });
        console.log(`ℹ️ Mission mise à jour : ${mission.codeMission}`);
      }

      // Affectations
      for (const aff of mData.collaborateurs) {
        const [affectation, created] = await Affectation.findOrCreate({
          where: {
            missionId: mission.idMission,
            collaborateurId: aff.user.idUtilisateur
          },
          defaults: {
            fonction: aff.fonction,
            statut: 'EN_COURS',
            dateAffectation: new Date()
          }
        });
        if (created) {
          console.log(`  🔗 Affectation : ${aff.user.prenom} ${aff.user.nom} -> ${mission.codeMission} (${aff.fonction})`);
        }
      }
    }

    // 5. Ajout d'équipements fictifs
    const mockEquipements = [
      { code: 'EQ-00124', nom: 'Pro-Link Walkie Talkie V2', categorie: 'Communication', marque: 'Motorola', modele: 'DP4800', etat: 'BON', quantite: 6 },
      { code: 'EQ-00156', nom: 'Advanced Safety Helmet', categorie: 'Protection', marque: 'Petzl', modele: 'Vertex', etat: 'BON', quantite: 12 },
      { code: 'EQ-00189', nom: 'High-Visibility Safety Vest L', categorie: 'Protection', marque: 'Portwest', modele: 'HV-Pro', etat: 'BON', quantite: 15 },
      { code: 'EQ-00210', nom: 'Industrial Heavy Duty Flashlight', categorie: 'Éclairage', marque: 'Maglite', modele: 'ML300L', etat: 'BON', quantite: 4 },
      { code: 'EQ-00245', nom: 'Safety Harness - Pro Grade', categorie: 'Protection', marque: 'Camp', modele: 'Golden Top', etat: 'BON', quantite: 1 }
    ];

    for (const eq of mockEquipements) {
      let equipement = await Equipement.findOne({ where: { codeEquipement: eq.code } });
      if (!equipement) {
        equipement = await Equipement.create({
          codeEquipement: eq.code,
          nom: eq.nom,
          categorie: eq.categorie,
          marque: eq.marque,
          modele: eq.modele,
          etat: eq.etat,
          quantite: eq.quantite,
          disponible: true
        });
        console.log(`📦 Équipement créé : ${equipement.nom} (${equipement.codeEquipement}, Qté: ${equipement.quantite})`);
      } else {
        await equipement.update({ quantite: eq.quantite, etat: eq.etat });
      }
    }

    // 6. Pointages de présence pour Marcus Sterling
    const qrPresence = await QRCode.findOrCreate({
      where: { valeur: 'MANEMEK-PRESENCE-HQ' },
      defaults: { type: 'PRESENCE', actif: true }
    });

    const now = new Date();
    await MouvementPresence.findOrCreate({
      where: {
        idUtilisateur: marcus.idUtilisateur,
        type: 'ENTREE'
      },
      defaults: {
        idQRCode: qrPresence[0].idQRCode.toString(),
        type: 'ENTREE',
        dateHeure: new Date(now.getTime() - 2 * 60 * 60 * 1000) // Il y a 2 heures
      }
    });

    // 7. Seeding des 5 dernières activités (Audit) pour chaque collaborateur
    const activitiesSeed = [
      // Marcus
      { idUtilisateur: marcus.idUtilisateur, action: 'POINTAGE_PRESENCE', description: 'Pointage enregistré : ENTREE au Poste Central', typeEntite: 'PRESENCE' },
      { idUtilisateur: marcus.idUtilisateur, action: 'AFFECTATION_MISSION', description: 'Assigné à la mission MS-2026-001 (Chef d\'équipe sécurité)', typeEntite: 'MISSION' },
      { idUtilisateur: marcus.idUtilisateur, action: 'MAJ_EQUIPEMENT', description: 'Attribution de la Radio VHF Motorola DP4801e', typeEntite: 'EQUIPEMENT' },
      { idUtilisateur: marcus.idUtilisateur, action: 'FORMATION_SECURITE', description: 'Recyclage SST (Sauveteur Secouriste du Travail) validé', typeEntite: 'FORMATION' },
      { idUtilisateur: marcus.idUtilisateur, action: 'SIGNALEMENT_INCIDENT', description: 'Rapport d\'incident : Alerte intrusion mineure secteur Ouest', typeEntite: 'INCIDENT' },

      // Elena
      { idUtilisateur: elena.idUtilisateur, action: 'CREATION_MISSION', description: 'Création et planification de la mission MS-2026-001', typeEntite: 'MISSION' },
      { idUtilisateur: elena.idUtilisateur, action: 'POINTAGE_PRESENCE', description: 'Pointage enregistré : ENTREE', typeEntite: 'PRESENCE' },
      { idUtilisateur: elena.idUtilisateur, action: 'AUDIT_SECURITE', description: 'Revue mensuelle des protocoles de sécurité validée', typeEntite: 'AUDIT' },
      { idUtilisateur: elena.idUtilisateur, action: 'VALIDATION_COMPTERENDU', description: 'Validation du compte rendu de patrouille', typeEntite: 'COMPTERENDU' },
      { idUtilisateur: elena.idUtilisateur, action: 'AFFECTATION_MISSION', description: 'Attribution d\'un membre à l\'équipe d\'intervention', typeEntite: 'MISSION' },

      // David
      { idUtilisateur: david.idUtilisateur, action: 'MAJ_EQUIPEMENT', description: 'Maintenance préventive des détecteurs multigaz effectuée', typeEntite: 'EQUIPEMENT' },
      { idUtilisateur: david.idUtilisateur, action: 'POINTAGE_PRESENCE', description: 'Pointage enregistré : ENTREE', typeEntite: 'PRESENCE' },
      { idUtilisateur: david.idUtilisateur, action: 'CREATION_MISSION', description: 'Planification logistique de transport de matériel', typeEntite: 'MISSION' },
      { idUtilisateur: david.idUtilisateur, action: 'INVENTAIRE', description: 'Audit de conformité de l\'inventaire matériel achevé', typeEntite: 'EQUIPEMENT' },
      { idUtilisateur: david.idUtilisateur, action: 'FORMATION_SECURITE', description: 'Habilitation électrique BR/BC renouvelée', typeEntite: 'FORMATION' },

      // Sophie
      { idUtilisateur: sophie.idUtilisateur, action: 'POINTAGE_PRESENCE', description: 'Pointage enregistré : ENTREE', typeEntite: 'PRESENCE' },
      { idUtilisateur: sophie.idUtilisateur, action: 'MODIFICATION_PROFIL', description: 'Mise à jour des fiches compétences collaborateurs', typeEntite: 'USER' },
      { idUtilisateur: sophie.idUtilisateur, action: 'RH_GESTION', description: 'Attestation de visite médicale périodique enregistrée', typeEntite: 'USER' },
      { idUtilisateur: sophie.idUtilisateur, action: 'EXPORT_DONNEES', description: 'Génération du registre mensuel du personnel', typeEntite: 'AUDIT' },
      { idUtilisateur: sophie.idUtilisateur, action: 'POINTAGE_PRESENCE', description: 'Pointage de sortie validé', typeEntite: 'PRESENCE' },

      // Julien
      { idUtilisateur: julien.idUtilisateur, action: 'POINTAGE_PRESENCE', description: 'Pointage enregistré : ENTREE sur site', typeEntite: 'PRESENCE' },
      { idUtilisateur: julien.idUtilisateur, action: 'AFFECTATION_MISSION', description: 'Affecté en tant qu\'Opérateur sur la mission MS-2026-001', typeEntite: 'MISSION' },
      { idUtilisateur: julien.idUtilisateur, action: 'MAJ_EQUIPEMENT', description: 'Prise en charge du Casque de sécurité Vertex Petzl', typeEntite: 'EQUIPEMENT' },
      { idUtilisateur: julien.idUtilisateur, action: 'COMPTERENDU_SOUMIS', description: 'Compte-rendu de ronde de surveillance déposé', typeEntite: 'COMPTERENDU' },
      { idUtilisateur: julien.idUtilisateur, action: 'SIGNALEMENT_INCIDENT', description: 'Signalement d\'un défaut d\'éclairage sur la zone parking B', typeEntite: 'INCIDENT' },
    ];

    for (const act of activitiesSeed) {
      await HistoriqueActivite.create({
        idUtilisateur: act.idUtilisateur,
        action: act.action,
        description: act.description,
        typeEntite: act.typeEntite,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 3)),
      });
    }

    console.log('\n🎉 Opération terminée avec succès !');
    console.log('   - 5 Collaborateurs avec rôles variés (ADMIN, RESPONSABLE, COLLABORATEUR)');
    console.log('   - 5 Missions opérationnelles');
    console.log('   - Affectations croisées créées');
    console.log('   - Équipements et pointages de présence insérés');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
    process.exit(1);
  }
}

seedDatabase();
