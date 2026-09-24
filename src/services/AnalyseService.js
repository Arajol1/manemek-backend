const {
  Mission,
  MouvementPresence,
  Incident,
  CompteRendu,
  Equipement,
  AnalyseIA
} = require('../models');

const { Op } = require('sequelize');

const {
  genererAnalyseIA
} = require('./IAService');


async function collecterDonnees(
  periodeDebut,
  periodeFin
) {
  const debut = new Date(`${periodeDebut}T00:00:00.000Z`);
  const fin = new Date(`${periodeFin}T23:59:59.999Z`);

  const missions = await Mission.findAll({
    where: {
      dateDebut: {
        [Op.between]: [
          debut,
          fin
        ]
      }
    }
  });

  const presences = await MouvementPresence.findAll({
    where: {
      dateHeure: {
        [Op.between]: [
          debut,
          fin
        ]
      }
    }
  });

  const incidents = await Incident.findAll({
    where: {
      dateSignalement: {
        [Op.between]: [
          debut,
          fin
        ]
      }
    }
  });

  const comptesRendus = await CompteRendu.findAll({
    where: {
      dateSoumission: {
        [Op.between]: [
          debut,
          fin
        ]
      }
    }
  });

  const equipements = await Equipement.findAll();

  return {
    missions,
    presences,
    incidents,
    comptesRendus,
    equipements
  };
}


function calculerStatistiques(donnees) {

  const {
    missions,
    presences,
    incidents,
    comptesRendus,
    equipements
  } = donnees;


  const statistiques = {

    missions: {
      total: missions.length,

      terminees: missions.filter(
        m => m.statut === 'TERMINEE'
      ).length,

      enCours: missions.filter(
        m => m.statut === 'EN_COURS'
      ).length,

      planifiees: missions.filter(
        m => m.statut === 'PLANIFIEE'
      ).length,

      annulees: missions.filter(
        m => m.statut === 'ANNULEE'
      ).length
    },


    presences: {
      totalMouvements: presences.length,

      entrees: presences.filter(
        p => p.type === 'ENTREE'
      ).length,

      sorties: presences.filter(
        p => p.type === 'SORTIE'
      ).length
    },


    incidents: {
      total: incidents.length,

      ouverts: incidents.filter(
        i => i.statutResolution === 'OUVERT'
      ).length,

      enCours: incidents.filter(
        i => i.statutResolution === 'EN_COURS'
      ).length,

      resolus: incidents.filter(
        i => i.statutResolution === 'RESOLU'
      ).length,

      critiques: incidents.filter(
        i => i.niveauUrgence === 'CRITIQUE'
      ).length
    },


    comptesRendus: {
      total: comptesRendus.length,

      soumis: comptesRendus.filter(
        c => c.statut === 'SOUMIS'
      ).length,

      valides: comptesRendus.filter(
        c => c.statut === 'VALIDE'
      ).length,

      rejetes: comptesRendus.filter(
        c => c.statut === 'REJETE'
      ).length
    },


    equipements: {
      total: equipements.length,

      disponibles: equipements.filter(
        e => e.disponible === true
      ).length,

      endommages: equipements.filter(
        e => e.etat === 'ENDOMMAGE'
      ).length,

      horsService: equipements.filter(
        e => e.etat === 'HORS_SERVICE'
      ).length
    }

  };

  return statistiques;
}


async function genererAnalyse(
  type,
  periodeDebut,
  periodeFin
) {

  const donnees = await collecterDonnees(
    periodeDebut,
    periodeFin
  );

  const statistiques =
    calculerStatistiques(donnees);


  const contenu =
    await genererAnalyseIA(
      type,
      statistiques,
      periodeDebut,
      periodeFin
    );


  const analyse =
    await AnalyseIA.create({
      type,
      contenu,
      periodeDebut,
      periodeFin
    });


  return {
    analyse,
    statistiques
  };
}


async function getAnalyses() {

  return await AnalyseIA.findAll({
    order: [
      ['dateGeneration', 'DESC']
    ]
  });

}


async function getAnalyseById(idAnalyse) {
  return await AnalyseIA.findByPk(idAnalyse);
}


module.exports = {
  collecterDonnees,
  calculerStatistiques,
  genererAnalyse,
  getAnalyses,
  getAnalyseById
};