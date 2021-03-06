<?php

namespace App\Controller;

use App\Entity\Commentaire;
use App\Entity\DocumentAnnexe;
use App\Entity\Format;
use App\Entity\Licence;
use App\Entity\FileManager;
use App\Entity\Photo;
use App\Entity\Serie;
use App\Entity\LPhotoThesaurus;
use App\Entity\LThesaurusEvolution;
use App\Entity\EvolutionPaysage;
use App\Entity\LFournisseurOpp;
use App\Entity\LGestionnaireOpp;
use App\Entity\LPhotoThesaurusFacultatif;
use App\Entity\LThesaurusFacultatifEvolution;
use App\Entity\Opp;
use App\Entity\PorteurOpp;
use App\Repository;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class PhotoController extends Controller
{
    
    const FOLDER_UPLOAD_FILE = 'upload';
        
    /**
     * @Route("administrateur/get/photos", name="getPhotos")
     * @return Response
     */
    public function getPhotos()
    {
        $em = $this->getDoctrine()->getManager();
        $photos = $em->getRepository(Photo::class)->findAll();
        $series = $em->getRepository(Serie::class)->findBy(array(), array('serieTitre' => 'ASC'));

        //pour les logos
        $structures = $em->getRepository(PorteurOpp::class)->findBy(array(), array('porteurOppNom' => 'DESC'));
        
        //Pour les commentaires en attentes
        $isAdmin = $this->isGranted('ROLE_ADMIN');
        $CommentaireDAO = $this->get('commentaire.dao');
        $nbWaitingComments = $CommentaireDAO->getCommentairesNonVus($isAdmin, $this->getUser());
        return $this->render("photo/photos.html.twig", [
            'photos' => $photos,
            'series' => $series,
            'structures' => $structures,
            'nbWaitingComments' => $nbWaitingComments
        ]); 
    }
       
    
    /**
     * @Route("administrateur/create/photo", name="createPhoto")
     * @return Response
     */
    public function createPhoto()
    {
        $em = $this->getDoctrine()->getManager();
        $formats = $em->getRepository(Format::class)->findAll();
        $licences = $em->getRepository(Licence::class)->findAll();

        //pour les logos
        $structures = $em->getRepository(PorteurOpp::class)->findBy(array(), array('porteurOppNom' => 'DESC'));
        
        //Pour les commentaires en attentes
        $isAdmin = $this->isGranted('ROLE_ADMIN');
        $CommentaireDAO = $this->get('commentaire.dao');
        $nbWaitingComments = $CommentaireDAO->getCommentairesNonVus($isAdmin, $this->getUser());
        return $this->render("photo/create_photo.html.twig", [
            'formats' => $formats,
            'licences' => $licences,
            'structures' => $structures,
            'nbWaitingComments' => $nbWaitingComments

        ]);
    }
    
    /**
     * @Route("gestion/add/photo", name="addPhoto")
     * @return Response
     */
    
    public function addPhoto(){
        //On r??cup??re les param??tres globaux
        //Pensez a modifier le php.ini - upload_max_filesize
        $parameters = $this->get('session')->get('parameters');

        if (isset($_FILES['file']) AND $_FILES['file']['error'] == 0)
        {
            // Test si le fichier n'est pas trop gros
            if ($_FILES['file']['size'] <= 256000000)
            {
                // Test si l'extension est autoris??e
                $infosfichier = pathinfo($_FILES['file']['name']);
                $extension_upload = strtolower($infosfichier['extension']);
                $extensions_autorisees = array('jpg', 'jpeg', 'gif', 'png', 'wav', 'mp3', 'mp4', 'pdf', 'doc', 'docx', 'odt', 'txt', 'csv', 'xls', 'xlsx');
                $newPath = $parameters['PATH_FOLDER_FILES'] . '/' . self::FOLDER_UPLOAD_FILE . '/';
                //On cr??er le dossier si il n'existe pas
                if (!file_exists($newPath)) {
                    mkdir($newPath, 0777, true);
                }
                if (in_array($extension_upload, $extensions_autorisees))
                {
                    $fname = basename($_FILES['file']['name']);
                    $rawBaseName = pathinfo($fname, PATHINFO_FILENAME );
                    $counter = 0;
                    while(file_exists($newPath . $fname)) {
                        $fname = $rawBaseName . '_' . $counter . '.' . $extension_upload;
                        $counter++;
                    };
                    // Valider le fichier et le stocker d??finitivement
                    move_uploaded_file($_FILES['file']['tmp_name'], $newPath . $fname);
                    //move_uploaded_file($_FILES['file']['tmp_name'], $newPath . basename($_FILES['file']['name']));
                    //echo "L'envoi a bien ??t?? effectu?? !";
                }else{
                    return new JsonResponse(array("status" => "error", "message" => "Ce type de fichier n'est pas autoris??."));
                }
            }else{
                return new JsonResponse(array("status" => "error", "message" => "Le fichier est trop volumineux."));
            }
        }else{
            return new JsonResponse(array("status" => "error", "message" => "Erreur lors de l'upload."));
        }

        return new JsonResponse(array(
            "status" => "ok",
            'fileName' => $fname,
            'fileSize' => $_FILES['file']['size'],
            'fileStatut' => $_FILES['file']['error'],
            'fileFormat' => $_FILES['file']['type'],
            'fileURI' => $parameters['URL_FOLDER_FILES'] . '/' . self::FOLDER_UPLOAD_FILE . '/' . $fname,
            'filePath' => self::FOLDER_UPLOAD_FILE . '/' . $fname,
            'fileDate' => date("Y-m-d H:i:s"),
            'newPath' => $newPath
        ));
    }
    
    /**
     * @Route("get/evolution/photo/{photoId}", name="get_evolution_photo")
     * @return Response
     */
    
    public function getEvolutionPhoto(string $photoId){
        //Initialisation des Repos
        $em = $this->getDoctrine()->getManager();
        $repoLPhotoThesaurus = $em->getRepository(LPhotoThesaurus::class);
        $repoLThesaurusEvolution = $em->getRepository(LThesaurusEvolution::class);
        $tabEvolutionPaysage = $em->getRepository(EvolutionPaysage::class)->findAll();
        $evolutionPresence = $em->getRepository(EvolutionPaysage::class)->findBy(array('evolutionPaysageNom' => 'Stabilit??'));
        
        $repoLPhotoThesaurusFacultatif = $em->getRepository(LPhotoThesaurusFacultatif::class);
        $repoLThesaurusFacultatifEvolution = $em->getRepository(LThesaurusFacultatifEvolution::class);

        $photo = $em->getRepository(Photo::class)->find($photoId);
        $photoFirst = $em->getRepository(Photo::class)->findOneBy(array('photoSerie' => $photo->getPhotoSerie()), array('photoDatePrise' => 'ASC'));

        $photoThesaurus =  $repoLPhotoThesaurus->findBy(array('lPtPhoto' => $photo));
        //print_r($photoThesaurus);
        $tabFinal = '';
        $isValid = false;
        $firstPhoto = false;
        if($photoFirst == $photo){
            $firstPhoto = true;
        }
        if(count($photoThesaurus) > 0){
            $tableauThesaurusHead = [];
            $tableauThesaurusHead[] = "<table class='table'><thead><tr>";
            $tableauThesaurusHead[] = "<th scope='col'>El??ments</th>";
            $tableauThesaurusHead[] = "<th>Pr??sence</th>";
            foreach($tabEvolutionPaysage as $evolutionPaysage){
                $tableauThesaurusHead[] = "<th scope='col'><center>" . $evolutionPaysage->getEvolutionPaysageNom() . "</center></th>";
            }
            $tableauThesaurusHead[] = "</tr></thead>";
            $tabFinal = implode("\n", $tableauThesaurusHead);
        }
        //On boucle sur les th??saurus associ??s ?? la photo 
        foreach($photoThesaurus as $thesaurus){
            //echo $thesaurus->getLPtId();
            $tableauTh??saurus = [];
            $tableauTh??saurus[] = "<tr>";
            $tableauTh??saurus[] = "<td scope='col'>" . $thesaurus->getLPtThesaurus()->getThesaurusTreeNom() . "</td>";
            if($firstPhoto){
                $thesaurusEvolution = $repoLThesaurusEvolution->findBy(array('lTeEvolution' => $evolutionPresence, 'lTePhotoThesaurus' => $thesaurus));
                if(count($thesaurusEvolution) > 0){
                    $isValid = true;
                    $tableauTh??saurus[] = "<td><center>X</center></td>";
                }
                foreach($tabEvolutionPaysage as $evolutionPaysage){
                    $tableauTh??saurus[] = "<td></td>";
                }
            }else{
                $tableauTh??saurus[] = "<td></td>";
                foreach($tabEvolutionPaysage as $evolutionPaysage){
                    $thesaurusEvolution = $repoLThesaurusEvolution->findBy(array('lTeEvolution' => $evolutionPaysage, 'lTePhotoThesaurus' => $thesaurus));
                    if(count($thesaurusEvolution) > 0){
                        $isValid = true;
                        $tableauTh??saurus[] = "<td><center>X</center></td>";
                    }else{
                        $tableauTh??saurus[] = "<td></td>";
                    }
                }
            }
            $tableauTh??saurus[] = "</tr>";
            $tabFinal .= implode("\n", $tableauTh??saurus);
        }

        $photoThesaurusFacultatif =  $repoLPhotoThesaurusFacultatif->findBy(array('lPtfPhoto' => $photo));
        //On boucle sur les th??saurus Facultatif associ??s ?? la photo 
        foreach($photoThesaurusFacultatif as $thesaurus){
            //echo $thesaurus->getLPtId();
            $tableauTh??saurus = [];
            $tableauTh??saurus[] = "<tr>";
            $tableauTh??saurus[] = "<td scope='col'>" . $thesaurus->getLPtfThesaurus()->getThesaurusTreeFacultatifNom() . "</td>";
            if($firstPhoto){
                $thesaurusEvolution = $repoLThesaurusFacultatifEvolution->findBy(array('lTfeEvolution' => $evolutionPresence, 'lTfePhotoThesaurus' => $thesaurus));
                if(count($thesaurusEvolution) > 0){
                    $isValid = true;
                    $tableauTh??saurus[] = "<td><center>X</center></td>";
                }
                foreach($tabEvolutionPaysage as $evolutionPaysage){
                    $tableauTh??saurus[] = "<td></td>";
                }
            }else{
                $tableauTh??saurus[] = "<td></td>";
                foreach($tabEvolutionPaysage as $evolutionPaysage){
                    $thesaurusEvolution = $repoLThesaurusFacultatifEvolution->findBy(array('lTfeEvolution' => $evolutionPaysage, 'lTfePhotoThesaurus' => $thesaurus));
                    if(count($thesaurusEvolution) > 0){
                        $isValid = true;
                        $tableauTh??saurus[] = "<td scope='col'><center>X</center></td>";
                    }else{
                        $tableauTh??saurus[] = "<td scope='col'></td>";
                    }
                }
            }
            $tableauTh??saurus[] = "</tr>";
            $tabFinal .= implode("\n", $tableauTh??saurus);
        }

        if($isValid){
            $tabFinal .= "</table>";
        }else{
            $tabFinal = "N/A";
        }

        return new Response($tabFinal);
    }
    
    /**
     * @Route("public/set/photo/comment/{photoId}", name="setPhotoComment")
     * @return Response
     */
    public function setSerieComment(int $photoId, Request $request){
        //On r??cup??re les param??tres globaux
        $em = $this->getDoctrine()->getManager();
        
        $commentaire = new Commentaire();
        $commentaire->setCommentaireText($request->request->get('commentaire'));
        $commentaire->setCommentaireEtat(0);
        $commentaire->setCommentaireAuteur($this->getUser());

        $photo = $em->getRepository(Photo::class)->find($photoId);
        $commentaire->setCommentairePhoto($photo);
        
        //Date du jour
        $datetime = \DateTime::createFromFormat("Y-m-d H:i:s", date("Y-m-d H:i:s"));
        $commentaire->setCommentaireDate($datetime);

        $em->persist($commentaire);
        $em->flush();

        return new JsonResponse(array(
            "status" => "ok"
        ));
    }
       
    
    /**
     * @Route("gestion/commentaires", name="getCommentaires")
     * @return Response
     */
    public function getCommentaires()
    {
        $em = $this->getDoctrine()->getManager();
        $isAdmin = $this->isGranted('ROLE_ADMIN');
        if($isAdmin){
            $commentaires = $em->getRepository(Commentaire::class)->findAll();
        }else{
            $commentaires = [];
            $allCommentaires = $em->getRepository(Commentaire::class)->findAll();
            foreach($allCommentaires as $commentaire){
                $photoCommentaire = $commentaire->getCommentairePhoto();
                if($photoCommentaire){
                    $serieCommentaire = $photoCommentaire->getPhotoSerie();
                    if($serieCommentaire){
                        $commentaireGestionnaire = $em->getRepository(LGestionnaireOpp::class)->findBy(array('lGoOpp' => $serieCommentaire->getSerieOpp(), 'lGoUsers' => $this->getUser()));
                        if($commentaireGestionnaire){
                            $commentaires[] = $commentaire;
                        }
                    }
                }
            }
        }

        /*$isAdmin = $this->isGranted('ROLE_ADMIN');
        $isGestionnaire = $this->isGranted('ROLE_GESTIONNAIRE');
        $isFournisseur = $this->isGranted('ROLE_FOURNISSEUR');
        $tabOpp = [];
        foreach($opps as $opp){
            if($isAdmin){
                $tabOpp[] = $opp;
            }else if($isGestionnaire){
                $isGestionnaireOpp = $em->getRepository(LGestionnaireOpp::class)->findBy(array('lGoOpp' => $opp, 'lGoUsers' => $this->getUser()));
                $isFournisseurOpp = $em->getRepository(LFournisseurOpp::class)->findBy(array('lFoOpp' => $opp, 'lFoUsers' => $this->getUser()));
                if(count($isGestionnaireOpp) == 1 || count($isFournisseurOpp) == 1){
                    $tabOpp[] = $opp;
                }
            }else if($isFournisseur){
                $isFournisseurOpp = $em->getRepository(LFournisseurOpp::class)->findBy(array('lFoOpp' => $opp, 'lFoUsers' => $this->getUser()));
                if(count($isFournisseurOpp) == 1){
                    $tabOpp[] = $opp;
                }
            }
        }
        $documents = [];
        foreach($tabOpp as $opp){
            $documentByOpp = $em->getRepository(DocumentAnnexe::class)->findBy(array('documentAnnexeOpp' => $opp));
            if(isSet($documentByOpp)){
                foreach($documentByOpp as $document){
                    $documents[] = $document;
                }
            }
        }*/
        //$documents = $em->getRepository(DocumentAnnexe::class)->findAll();
        //pour les logos
        
        $isAdmin = $this->isGranted('ROLE_ADMIN');
        $CommentaireDAO = $this->get('commentaire.dao');
        $nbWaitingComments = $CommentaireDAO->getCommentairesNonVus($isAdmin, $this->getUser());

        $structures = $em->getRepository(PorteurOpp::class)->findBy(array(), array('porteurOppNom' => 'DESC'));
        return $this->render("commentaire/commentaire.html.twig",
            array('commentaires' => $commentaires,
                'structures' => $structures,
                'nbWaitingComments' => $nbWaitingComments)
        );
    }
    
    /**
     * @Route("gestion/commentaire/publication/{commentaireId}", name="setPublicationCommentaire")
     * @return Response
     */
    public function setPublicationCommentaire(int $commentaireId){
        //On r??cup??re les param??tres globaux
        $em = $this->getDoctrine()->getManager();
        
        $commentaire = $em->getRepository(Commentaire::class)->find($commentaireId);
        
        if($commentaire->getCommentaireEtat() == 0){
            $newEtat = 1;
        }else{
            $newEtat = 0;
        }
        $commentaire->setCommentaireEtat($newEtat);

        $em->persist($commentaire);
        $em->flush();

        return new JsonResponse(array(
            "status" => "ok"
        ));
    }
    

    
    /**
     * @Route("gestion/remove/commentaire/{idCommentaire}", name="removeCommentaire")
     * @return JsonResponse
     */
    public function removeCommentaire($idCommentaire)
    {
        $em = $this->getDoctrine()->getManager();
        $commentaire = $em->getRepository(Commentaire::class)->find($idCommentaire);

        $em->remove($commentaire);
        $em->flush();
        
        return new JsonResponse(array(
            'status' => 'ok'));
    }
}
