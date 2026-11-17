// seed.js - Création de 5 collaborateurs fictifs et affectation de missions
const bcrypt = require('bcryptjs');
const { sequelize, User, Mission, Affectation, Equipement, QRCode, MouvementPresence } = require('./src/models');

async function seedDatabase() {
  try {
    console.log('🔄 Connexion à la base de données SQLite...');
    await sequelize.authenticate();
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
        telephone: '+33 6 12 34 56 78'
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
        telephone: '+33 6 23 45 67 89'
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
        telephone: '+33 6 34 56 78 90'
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
        telephone: '+33 6 45 67 89 01'
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
        telephone: '+33 6 56 78 90 12'
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
      { code: 'EQ-00124', nom: 'Pro-Link Walkie Talkie V2', categorie: 'Communication', marque: 'Motorola', modele: 'DP4800', etat: 'BON' },
      { code: 'EQ-00156', nom: 'Advanced Safety Helmet', categorie: 'Protection', marque: 'Petzl', modele: 'Vertex', etat: 'BON' },
      { code: 'EQ-00189', nom: 'High-Visibility Safety Vest L', categorie: 'Protection', marque: 'Portwest', modele: 'HV-Pro', etat: 'BON' },
      { code: 'EQ-00210', nom: 'Industrial Heavy Duty Flashlight', categorie: 'Éclairage', marque: 'Maglite', modele: 'ML300L', etat: 'MOYEN' },
      { code: 'EQ-00245', nom: 'Safety Harness - Pro Grade', categorie: 'Protection', marque: 'Camp', modele: 'Golden Top', etat: 'BON' }
    ];

    for (const eq of mockEquipements) {
      let qr = await QRCode.findOne({ where: { valeur: `MANEMEK-EQP:${eq.code}` } });
      if (!qr) {
        qr = await QRCode.create({
          valeur: `MANEMEK-EQP:${eq.code}`,
          type: 'EQUIPEMENT',
          actif: true
        });
      }
      const [equipement, created] = await Equipement.findOrCreate({
        where: { codeEquipement: eq.code },
        defaults: {
          nom: eq.nom,
          categorie: eq.categorie,
          marque: eq.marque,
          modele: eq.modele,
          etat: eq.etat,
          disponible: true,
          idQRCode: qr.idQRCode
        }
      });
      if (created) {
        console.log(`📦 Équipement créé : ${equipement.nom} (${equipement.codeEquipement})`);
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
