const analyseService = require('../services/AnalyseService');


exports.genererAnalyse = async (req, res) => {

  try {

    const {
      type,
      periodeDebut,
      periodeFin
    } = req.body;


    if (
      !type ||
      !periodeDebut ||
      !periodeFin
    ) {
      return res.status(400).json({
        message:
          'type, periodeDebut et periodeFin sont obligatoires.'
      });
    }


    const typesAutorises = [
      'MISSION',
      'PERFORMANCE',
      'PRESENCE',
      'EQUIPEMENT',
      'RECOMMANDATION'
    ];


    if (!typesAutorises.includes(type)) {

      return res.status(400).json({
        message:
          'Type d’analyse invalide.'
      });

    }


    const resultat =
      await analyseService.genererAnalyse(
        type,
        periodeDebut,
        periodeFin
      );


    res.status(201).json({
      message:
        'Analyse IA générée avec succès.',

      analyse:
        resultat.analyse,

      statistiques:
        resultat.statistiques
    });


  } catch (error) {

    console.error(
      'Erreur génération analyse IA :',
      error
    );

    res.status(500).json({
      message:
        'Erreur lors de la génération de l’analyse IA.',

      error:
        error.message
    });

  }

};


exports.getAnalyses = async (req, res) => {

  try {

    const analyses = await analyseService.getAnalyses();

    res.json(analyses);

  } catch (error) {

    res.status(500).json({
      message:
        'Erreur lors de la récupération des analyses.',
      error:
        error.message
    });

  }

};


exports.getAnalyseById = async (req, res) => {

  try {

    const { id } = req.params;

    const analyse = await analyseService.getAnalyseById(id);


    if (!analyse) {

      return res.status(404).json({
        message:
          'Analyse introuvable.'
      });

    }


    res.json(analyse);

  } catch (error) {

    res.status(500).json({
      message:
        'Erreur lors de la récupération de l’analyse.',
      error:
        error.message
    });

  }

};