import { scene } from "../main";
import { SpawnNode, UpdateDeleteEvent } from "./MeshController";

import { FurnitureCard } from "../component/FurnitureCard";
import { CategoryButton } from "../component/CategoryButton";
import { OptionsModal } from "../component/OptionsModal";
import { GenericLoader } from "../component/GenericLoader";
import { SetScreenState, SetViewMode } from "./OptionsController";
import { TranslateToTarget } from "./CameraController";
import { CheckIfMobile } from "../util/DeviceUtils";

import { domain } from "../service/FurnitureServices";

// Habilita opções para manipular estado do modal e botão de acesso
function EnableModalOptions() {
    let modalButton = document.getElementById("function-modal-access");
    let closeModalButton = document.getElementById("function-modal-close");
    let modal = document.getElementById("function-modal-state");

    modalButton.addEventListener('click', () => modalButton.style.display = 'none');
    closeModalButton.addEventListener('click', () =>  modalButton.style.display = 'block');
    modal.addEventListener('click', () =>  modalButton.style.display = 'block');
}

// Cria as opções de tela maximizada/minimizada e outras
function CreateExtraOptions() {
    let fullScreenButton = document.getElementById("function-fullscreen");
    let viewmodeButton = document.getElementById("function-viewmode");
    let bottomStateButton = document.getElementById("function-bottombar-state");

    if(CheckIfMobile()) {
        viewmodeButton.addEventListener('click', () => SetViewMode());
    } else {
        viewmodeButton.style.color = "var(--color-xlowgray)";
        viewmodeButton.style.cursor = "default";
        viewmodeButton.innerHTML += "<br>(mobile)";
    }

    fullScreenButton.addEventListener('click', () => SetScreenState());
    bottomStateButton.addEventListener('click', () => SetBottomBarState());
}

// Cria botões de todas opções de acordo com os nomes das categorias listadas
function CreateFurnitureNav(navbar, data) {
    data.forEach(category => {
        navbar.children[0].appendChild(CategoryButton(category));
    });
}

// Adiciona o comportamento de estilização e captura do índice da opção de categoria selecionada
function AddFurnitureNavBehaviour(categoriesList, data) {
    let categoryIndex = 0;
    
    categoriesList.forEach(categoryOption => {
        const index = categoryIndex;

        categoryOption.addEventListener('click', () => SelectFurnitureOption(categoriesList, index, data));
        categoryIndex++;
    });
}

// Modifica o estilo da opção da categoria selecionada
function SelectFurnitureOption(categoriesList, index, data) {
    const target = { alpha: data[index].alpha, beta: data[index].beta };

    TranslateToTarget(scene.activeCamera, target);
    CreateFurnitureOption(index, data);
    UpdateDeleteEvent(index, data);

    for(let checkedIndex=0; checkedIndex<categoriesList.length; checkedIndex++) {
        let option = categoriesList[checkedIndex];

        if(checkedIndex == index) {
            option.style.backgroundColor = "var(--color-orange)";
            option.children[0].src = `./img/${data[checkedIndex].name}-selected.png`;
            option.children[1].style.color = "var(--color-white)";
        } else {
            option.style.backgroundColor = "var(--color-white)";
            option.children[0].src = `./img/${data[checkedIndex].name}-unselected.png`;
            option.children[1].style.color = "var(--color-blue)";
        }
    }
}

// Cria os cards de cada variação da categoria selecionada
function CreateFurnitureOption(index, data) {
    let optionsLabel = document.getElementById('function-furniture-options');
    let itemsLoader = document.getElementById('function-items-loader');

    while (optionsLabel.firstChild) optionsLabel.removeChild(optionsLabel.firstChild);
    itemsLoader.innerHTML = "Aguarde, estamos disponibilizando os móveis...";
    
    data[index].items.forEach(variation => {
        let cardOption = FurnitureCard(variation, index);
        let variationImageLink = `${domain}/assets/${variation.fileUri}`;

        cardOption.addEventListener('click', async () => {
            document.body.appendChild(GenericLoader("Inserindo móvel..."));

            let removeButton = document.getElementById("function-clear-furniture");
            removeButton.click();

            SpawnNode(true, data[index].name, scene.getMeshByName("domeMaster").parent, null, null);
            SpawnNode(
                false, 
                scene.getTransformNodeByName(data[index].name), 
                data[index].name,
                variationImageLink,
                data[index].renderIndex
            );
            UpdateDeleteEvent(index, data);
            document.getElementById("function-generic-loader").remove();
        });
        
        optionsLabel.appendChild(cardOption);
    });
    itemsLoader.innerHTML = '';
}

// Minimiza ou maximiza o menu inferior completo
function SetBottomBarState() {
    let furnitureLabelOptions = document.getElementById("function-furniture-options");
    let setStateBottombarIcon = document.getElementById("function-bottom-icon");
    let removeButton = document.getElementById("function-clear-furniture");

    if(furnitureLabelOptions.classList.contains("show")) {
        setStateBottombarIcon.src = "./img/bottombar-toup.png";
        removeButton.style.bottom = "4.6em";
    } else {
        setStateBottombarIcon.src = "./img/bottombar-tobottom.png";
        removeButton.style.bottom = window.innerWidth >= 693 && window.innerWidth <= 1064 ? "14.6em" : "11em";
    }
}

// Cria o menu de navegação e inserção de móveis
export function CreateUI(data) {
    let navbar = document.getElementById("function-furniture-nav");
    document.getElementById("function-options-modal").appendChild(OptionsModal());

    CreateFurnitureNav(navbar, data);

    let categoriesElements = navbar.children[0].children;
    let categoriesList = Array.from(categoriesElements);

    AddFurnitureNavBehaviour(categoriesList, data);
    SelectFurnitureOption(categoriesList, 0, data);

    CreateExtraOptions();
    EnableModalOptions();
}