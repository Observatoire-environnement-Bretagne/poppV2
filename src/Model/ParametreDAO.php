<?php
namespace App\Model;

use App\Entity\Parametre;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Container\ContainerInterface;

class ParametreDAO {
    // Référence au service Doctrine
    //private $doctrine;
    private $em;
    private $container;
    
    CONST DICTIONNAIRE_OCC = [
        "labelUnitePaysageLocale" => "structure de paysage",
        "labelUnitePaysageLocales" => "structures de paysage",
        "labelExportSerie" => "Export des points de vue",
        "labelNomSeriePhoto" => "Nom du point de vue",
        "labelPublierSerie" => "Pulier le point de vue",
        "labelSerie" => "Point de vue",
        "labelSeries" => "points de vue",
        "labelArtAndSerie" => "du point de vue",
        "labelModifSerie" => "Modifier le point de vue",
        "labelAjoutSerie" => "Ajouter un point de vue",
        "labelTitleExportSerie" => "Exporter le point de vue",
        "labelALaSerie" => "au point de vue",
        "labelLaSerie" => "le point de vue",
        "labelTypologiesPaysage" => "grands ensembles géographiques",
        "labelArtTypologiePaysage" => "un grand ensemble géographique",
        "labelTypologiePaysage" => "grand ensemble géographique",
        "fieldRequired" => ["AxeThematique", "EnsemblePaysager", "UnitePaysage"],
        "labelIntentionPhotographe" => "Intention de prise de vue",
        "labelEnsemblePaysager" => "famille de paysages",
        "labelEnsemblesPaysagers" => "familles de paysages",
        "labelArtEnsemblePaysager" => "une famille de paysages",
        "labelAuteurReconduction" => "Auteur de la photographie",
        "showLicenceFichePhoto" => false
    ];

    CONST DICTIONNAIRE = [
        "labelUnitePaysageLocale" => "unité paysagère locale",
        "labelUnitePaysageLocales" => "unités paysagères locales", 
        "labelExportSerie" => "Export des séries",
        "labelNomSeriePhoto" => "Nom de la série photo",
        "labelPublierSerie" => "Publier la série",
        "labelSerie" => "Série",
        "labelSeries" => "séries",
        "labelArtAndSerie" => "de la série",
        "labelModifSerie" => "Modifier la série",
        "labelAjoutSerie" => "Ajouter une série photo",
        "labelTitleExportSerie" => "Exporter la série",
        "labelALaSerie" => "à la série",
        "labelLaSerie" => "la série",
        "labelTypologiesPaysage" => "typologies de paysage",
        "labelArtTypologiePaysage" => "une typologie de paysage",
        "labelTypologiePaysage" => "typologie de paysage",
        "fieldRequired" => ["descFine"],
        "labelIntentionPhotographe" => "Intention du photographe",
        "labelEnsemblePaysager" => "ensemble paysager",
        "labelEnsemblesPaysagers" => "ensembles paysagers",
        "labelArtEnsemblePaysager" => "un ensemble paysager",
        "labelAuteurReconduction" => "Auteur de la reconduction",
        "showLicenceFichePhoto" => true
    ];

    const DEFAULT_VALUE_SERIE = array(
        'langue' => 'Français',
        'pays' => 'FRANCE',
        'region' => 'Bretagne',
        'frequence' => 'mois',
        'disparition' => 'Disparition'
    );
    
    // Constructeur pour permettre au Service Container
    // de nous donner le service Doctrine
    public function __construct(EntityManagerInterface $em, ContainerInterface $container) {
        //$this->doctrine = $doctrine;
        $this->em = $em;
        $this->container = $container;
    }

    public function setGlobalParamaters(){
        $session = $this->container->get('session');
        //$this->session->remove('parameters');
        
        $listeParametres= $this->em
            ->getRepository(Parametre::class)
            ->findAll();
        foreach($listeParametres as $parametre) {
            $tabParametre[$parametre->getPrmCode()] = $parametre->getPrmValeur();
        }
        $tabParametre["dictionnaire"] = self::DICTIONNAIRE;
        $tabParametre["default_value_serie"] = self::DEFAULT_VALUE_SERIE;
        $session->set('parameters', $tabParametre);
    }
}