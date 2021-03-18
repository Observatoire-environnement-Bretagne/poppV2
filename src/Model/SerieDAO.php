<?php
namespace App\Model;

use App\Entity\Commentaire;
use App\Entity\Document;
use App\Entity\LienExterne;
use App\Entity\LPhotoThesaurus;
use App\Entity\LPhotoThesaurusFacultatif;
use App\Entity\LSerieAxeThematic;
use App\Entity\LSerieUnitePaysagereLocale;
use App\Entity\LThesaurusEvolution;
use App\Entity\LThesaurusFacultatifEvolution;
use App\Entity\Photo;
use App\Entity\Son;
use Doctrine\ORM\EntityManagerInterface;
use Proxies\__CG__\App\Entity\DocumentRef;
use Psr\Container\ContainerInterface;

class SerieDAO {
    // Référence au service Doctrine
    private $em;
    
    // Constructeur pour permettre au Service Container
    // de nous donner le service Doctrine
    public function __construct(EntityManagerInterface $em, ContainerInterface $container) {
        //$this->doctrine = $doctrine;
        $this->em = $em;
        $this->container = $container;
    }


    public function removeSerie($serie){
        $session = $this->container->get('session');
        $parametres = $session->get('parameters');
        
        $em = $this->em;
    
        $fileManagerDAO = $this->container->get('filemanager.dao');

        $documents = $em->getRepository(Document::class)->findBy(array('documentSerie' => $serie));
        foreach($documents as $document){
            $file = $document->getDocumentFile();
            $em->remove($document);
            $fileManagerDAO->removeFile($file);
            $em->flush();
        }
        
        $lienExternes = $em->getRepository(LienExterne::class)->findBy(array('lienExterneSerie' => $serie));
        foreach($lienExternes as $lienExterne){
            $em->remove($lienExterne);
            $em->flush();
        }
        
        $lSerieAxeThematics = $em->getRepository(LSerieAxeThematic::class)->findBy(array('lSatSerie' => $serie));
        foreach($lSerieAxeThematics as $lSerieAxeThematic){
            $em->remove($lSerieAxeThematic);
            $em->flush();
        }
        
        
        $LSerieUnitePaysagereLocales = $em->getRepository(LSerieUnitePaysagereLocale::class)->findBy(array('lSuplSerie' => $serie));
        foreach($LSerieUnitePaysagereLocales as $LSerieUnitePaysagereLocale){
            $em->remove($LSerieUnitePaysagereLocale);
            $em->flush();
        }

        $Sons = $em->getRepository(Son::class)->findBy(array('sonSerie' => $serie));
        foreach($Sons as $Son){
            $em->remove($Son);
            $em->flush();
        }
        
        $Photos = $em->getRepository(Photo::class)->findBy(array('photoSerie' => $serie));
        foreach($Photos as $Photo){
            $Commentaires = $em->getRepository(Commentaire::class)->findBy(array('commentairePhoto' => $Photo));
            foreach($Commentaires as $Commentaire){
                $em->remove($Commentaire);
                $em->flush();
            }
            
            $LPhotoThesauruss = $em->getRepository(LPhotoThesaurus::class)->findBy(array('lPtPhoto' => $Photo));
            foreach($LPhotoThesauruss as $LPhotoThesaurus){
                $LThesaurusEvolutions = $em->getRepository(LThesaurusEvolution::class)->findBy(array('lTePhotoThesaurus' => $LPhotoThesaurus));
                foreach($LThesaurusEvolutions as $LThesaurusEvolution){
                    $em->remove($LThesaurusEvolution);
                    $em->flush();
                }
                $em->remove($LPhotoThesaurus);
                $em->flush();
            }
            
            $LPhotoThesaurusFacultatifs = $em->getRepository(LPhotoThesaurusFacultatif::class)->findBy(array('lPtfPhoto' => $Photo));
            foreach($LPhotoThesaurusFacultatifs as $LPhotoThesaurusFacultatif){
                $LThesaurusFacultatifEvolutions = $em->getRepository(LThesaurusFacultatifEvolution::class)->findBy(array('lTfePhotoThesaurus' => $LPhotoThesaurusFacultatif));
                foreach($LThesaurusFacultatifEvolutions as $LThesaurusFacultatifEvolution){
                    $em->remove($LThesaurusFacultatifEvolution);
                    $em->flush();
                }
                $em->remove($LPhotoThesaurusFacultatif);
                $em->flush();
            }
        
            $file = $Photo->getPhotoFile();
            $em->remove($Photo);
            $em->flush();

            //on vérifie que la photo n'es pas déja rattaché (ne doit pas arriver mais au cas ou)
            $PhotosFromfile = $em->getRepository(Photo::class)->findBy(array('photoFile' => $file));
            if(count($PhotosFromfile) == 0 && $file){
                $fileManagerDAO->removeFile($file);
            }
            //$em->clear();
            $em->flush();
        }

        $fileCroquis = $serie->getSerieCroquis();
        $filePhotoAerienne = $serie->getSeriePhotoAerienne();
        $filePhotoContext = $serie->getSeriePhotoContext();
        $filePhotoIgn = $serie->getSeriePhotoIgn();
        $filePhotoTrepied = $serie->getSeriePhotoTrepied();
        $DocumentRef = $serie->getSerieRefdoc();

        $em->remove($serie);
        if($fileCroquis){$fileManagerDAO->removeFile($fileCroquis);}
        if($filePhotoAerienne){$fileManagerDAO->removeFile($filePhotoAerienne);}
        if($filePhotoContext){$fileManagerDAO->removeFile($filePhotoContext);}
        if($filePhotoIgn){$fileManagerDAO->removeFile($filePhotoIgn);}
        if($filePhotoTrepied){$fileManagerDAO->removeFile($filePhotoTrepied);}
        if($DocumentRef){
            $fileDocumentRef = $DocumentRef->getDocumentRefFile();
            $em->remove($DocumentRef);
            //on vérifie que la photo n'es pas déja rattaché (ne doit pas arriver mais au cas ou)
            /*$PhotosFromfile = $em->getRepository(Photo::class)->findBy(array('photoFile' => $file));
            if(count($PhotosFromfile) == 0){$fileManagerDAO->removeFile($file);}*/
            $DocumentRefFromfile = $em->getRepository(DocumentRef::class)->findBy(array('documentRefFile' => $fileDocumentRef));
            if($fileDocumentRef && !$DocumentRefFromfile){
                $fileManagerDAO->removeFile($fileDocumentRef);
            }
        }

        $em->flush();
    }
}