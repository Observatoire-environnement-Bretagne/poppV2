<?php

namespace App\Controller;

use App\Entity\LFournisseurOpp;
use App\Entity\LGestionnaireOpp;
use App\Entity\Opp;
use App\Entity\PorteurOpp;
use App\Entity\Serie;
use App\Entity\Users;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface;

class OppController extends Controller
{
    
    /**
     * @Route("gestion/get/opps", name="getOpps")
     * @return Response
     */

    public function getOpps(AccessDecisionManagerInterface $accessDecisionManager)
    {
        $em = $this->getDoctrine()->getManager();
        $opps = $em->getRepository(Opp::class)->findAll();
        $structuresOpp = $em->getRepository(PorteurOpp::class)->findBy(array(), array('porteurOppNom' => 'ASC'));
        $users = $em->getRepository(Users::class)->findBy(array(), array('Prenom' => 'ASC'));
        
        $isAdmin = $this->isGranted('ROLE_ADMIN');
        $isGestionnaire = $this->isGranted('ROLE_GESTIONNAIRE');
        $tabOpp = [];
        foreach($opps as $opp){
            if($isAdmin){
                $gestionnaires = $em->getRepository(LGestionnaireOpp::class)->findBy(array('lGoOpp' => $opp));
                $fournisseurs = $em->getRepository(LFournisseurOpp::class)->findBy(array('lFoOpp' => $opp));
                
                $tabInfo['opp'] = $opp;
                $tabInfo['gestionnaires'] = $gestionnaires;
                $tabInfo['fournisseurs'] = $fournisseurs;
                $tabOpp[] = $tabInfo;
            }else if($isGestionnaire){
                $isGestionnaireOpp = $em->getRepository(LGestionnaireOpp::class)->findBy(array('lGoOpp' => $opp, 'lGoUsers' => $this->getUser()));
                if(count($isGestionnaireOpp) == 1){
                    $gestionnaires = $em->getRepository(LGestionnaireOpp::class)->findBy(array('lGoOpp' => $opp));
                    $fournisseurs = $em->getRepository(LFournisseurOpp::class)->findBy(array('lFoOpp' => $opp));
                    
                    $tabInfo['opp'] = $opp;
                    $tabInfo['gestionnaires'] = $gestionnaires;
                    $tabInfo['fournisseurs'] = $fournisseurs;
                    $tabOpp[] = $tabInfo;
                }
            }
        }

        //$tabGestionnaires = $em->getRepository(Users::class)->findByRole('ROLE_GESTIONNAIRE');
        //$tabFournisseurs = $em->getRepository(Users::class)->findByRole('ROLE_FOURNISSEUR');
        foreach ($users as $user){
            $roles = [];
            foreach($user->getRoles() as $role){
                if($role != null){
                    $roles[] = $role;
                }
            }
            $token = new UsernamePasswordToken($user, 'none', 'none', $roles);
            if ($accessDecisionManager->decide($token, array('ROLE_FOURNISSEUR'))) {
                $tabFournisseurs[] = $user;
            }
            if ($accessDecisionManager->decide($token, array('ROLE_GESTIONNAIRE'))) {
                $tabGestionnaires[] = $user;
            }
        }

        //pour les logos
        $structures = $em->getRepository(PorteurOpp::class)->findBy(array(), array('porteurOppNom' => 'DESC'));
        
        //Pour les commentaires en attentes
        $isAdmin = $this->isGranted('ROLE_ADMIN');
        $CommentaireDAO = $this->get('commentaire.dao');
        $nbWaitingComments = $CommentaireDAO->getCommentairesNonVus($isAdmin, $this->getUser());

        return $this->render("opp/opps.html.twig", [
            //'opps' => $opps,
            'structuresOpp' => $structuresOpp,
            'users' => $users,
            'tabOpp' => $tabOpp,
            'tabGestionnaires' => $tabGestionnaires,
            'tabFournisseurs' => $tabFournisseurs,
            'structures' => $structures,
            'nbWaitingComments' => $nbWaitingComments
        ]); 
    }
    
    /**
     * @Route("gestion/update/opp/{idOpp}", name="updateOpp")
     * @return JsonResponse
     */
    public function updateOpp($idOpp, Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        if($idOpp == "new"){
            $opp = new Opp();
        }else{
            $opp = $em->getRepository(Opp::class)->find($idOpp);
            
            //On supprime avant de créer
            $gestionnaires = $em->getRepository(LGestionnaireOpp::class)->findBy(array('lGoOpp' => $opp));
            foreach($gestionnaires as $gestionnaire){
                $em->remove($gestionnaire);
            }

            $fournisseurs = $em->getRepository(LFournisseurOpp::class)->findBy(array('lFoOpp' => $opp));
            foreach($fournisseurs as $fournisseur){
                $em->remove($fournisseur);
            }
            $em->flush();
        }

        $opp->setOppNom($request->get('oppName'));
        $opp->setOppDesc($request->get('oppDesc'));
        $opp->setOppTechnicite($request->get('oppTechnicite'));
        $oppAnneeCreation = $request->get('oppAnneeCreation');
        if($oppAnneeCreation == ''){
            $oppAnneeCreation = null;
        }
        $opp->setOppAnneeCreation($oppAnneeCreation);
        $opp->setOppNivTerrit($request->get('oppNivTerrit'));
        $opp->setOppValo($request->get('oppValo'));
        
        $porteurOppId = $request->get('oppStructureOpp');
        if($porteurOppId != ''){
            $porteurOpp = $em->getRepository(PorteurOpp::class)->find($porteurOppId);
            if($porteurOpp){
                $opp->setOppPorteurOpp($porteurOpp);
            }
        }
        if($request->get('oppParticipative') == "true"){
            $opp->setOppParticipative(true);
        }else{
            $opp->setOppParticipative(false);
        }
        if($request->get('oppParticipative') == "true"){
            $opp->setOppParticipative(true);
        }
        //On enregistre les modifs
        $em->persist($opp);
        $em->flush();
        
        $repoUsers = $em->getRepository(Users::class);
        $tabOppGestionnaires = $request->request->get('oppGestionnaires');
        if(isSet($tabOppGestionnaires)){
            foreach($tabOppGestionnaires as $oppGestionnaireId){
                $gestionnaire = $repoUsers->find($oppGestionnaireId);
    
                $LGestionnaireOppNew = new LGestionnaireOpp();
                $LGestionnaireOppNew->setLGoUsers($gestionnaire);
                $LGestionnaireOppNew->setLGoOpp($opp);
    
                $em->persist($LGestionnaireOppNew);
            }
        }
        
        $tabOppFournisseurs = $request->request->get('oppFournisseurs');
        if(isSet($tabOppFournisseurs)){
            foreach($tabOppFournisseurs as $oppFournisseurId){
                $fournisseur = $repoUsers->find($oppFournisseurId);
    
                $LFournisseurOppNew = new LFournisseurOpp();
                $LFournisseurOppNew->setLFoUsers($fournisseur);
                $LFournisseurOppNew->setLFoOpp($opp);
    
                $em->persist($LFournisseurOppNew);
            }
        }
        $em->flush();

        return new JsonResponse(array(
            'status' => 'ok', "oppId" => $opp->getOppId()));
    }
    
    /**
     * @Route("gestion/remove/opp/{idOpp}", name="removeOpp")
     * @return JsonResponse
     */
    public function removeOpp($idOpp)
    {
        $em = $this->getDoctrine()->getManager();
        $opp = $em->getRepository(Opp::class)->find($idOpp);
        
        $series = $em->getRepository(Serie::class)->findBy(array('serieOpp' => $opp));
        foreach($series as $serie){
            $serie->setSerieOpp(null);
            $em->persist($serie);
        }
        
        $LFournisseurOpps = $em->getRepository(LFournisseurOpp::class)->findBy(array('lFoOpp' => $opp));
        $LGestionnaireOpps = $em->getRepository(LGestionnaireOpp::class)->findBy(array('lGoOpp' => $opp));
        foreach($LFournisseurOpps as $LFournisseurOpp){
            $em->remove($LFournisseurOpp);
        }
        foreach($LGestionnaireOpps as $LGestionnaireOpp){
            $em->remove($LGestionnaireOpp);
        }

        $em->remove($opp);
        $em->flush();
        /*$response = $this->forward('App\Controller\SerieController::deleteSerie', [
            'serieId'  => $serieId
        ]);*/
        /*$parametreVal = $request->get('parametreVal');
        $parametre->setPrmValeur($parametreVal);
        //On enregistre les modifs
        $em->persist($parametre);
        $em->flush();*/
        
        return new JsonResponse(array(
            'status' => 'ok'));
    }
    
    /**
     * @Route("show/opp/{oppId}", name="showOpp")
     * @return Response
     */
    public function showOpp(string $oppId)
    {
        $em = $this->getDoctrine()->getManager();
        $opp = $em->getRepository(Opp::class)->find($oppId);
        
        $LFournisseurOpps = $em->getRepository(LFournisseurOpp::class)->findBy(array('lFoOpp' => $opp));
        $LGestionnaireOpps = $em->getRepository(LGestionnaireOpp::class)->findBy(array('lGoOpp' => $opp));

        //pour les logos
        $structures = $em->getRepository(PorteurOpp::class)->findBy(array(), array('porteurOppNom' => 'DESC'));
        
        //Pour les commentaires en attentes
        $isAdmin = $this->isGranted('ROLE_ADMIN');
        $CommentaireDAO = $this->get('commentaire.dao');
        $nbWaitingComments = $CommentaireDAO->getCommentairesNonVus($isAdmin, $this->getUser());
        return $this->render("opp/show_opp.html.twig", [
            'opp' => $opp,
            'fournisseurs' => $LFournisseurOpps,
            'gestionnaires' => $LGestionnaireOpps,
            'structures' => $structures,
            'nbWaitingComments' => $nbWaitingComments
        ]);
    }
    
}