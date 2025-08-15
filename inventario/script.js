// script.js

// Objeto para mapear categorias principais às suas subcategorias
const subcategoriesData = {
    equipamentos: ['Armas', 'Equipáveis', 'Acessórios', 'Outros'],
    consumiveis: ['Poções', 'Arremessáveis', 'Utilitários', 'Munições', 'Outros'],
    uteis: ['Ferramentas', 'Utilitários', 'Outros'],
    riquezas: ['Moedas', 'Outros'],
    diversos: ['Valioso', 'Missão', 'Itens']
};

// --- DADOS INICIAIS (FALLBACK SE NADA ESTIVER NO LOCALSTORAGE) ---
const defaultItemsData = {
    equipamentos: {
        armas: [
            { id: 'armalonga1', nome: 'Espada Longa', tipo: 'Espada', efeito: '+5 Dano Físico', efeitoEspecial: null, descricao: 'Uma espada bem balanceada.', quantidade: 1 },
            { id: 'arcocurto1', nome: 'Arco Curto', tipo: 'Arco', efeito: '+3 Dano Perfurante', efeitoEspecial: null, descricao: 'Leve e fácil de manusear.', quantidade: 1 }
        ],
        equipaveis: [
            { id: 'armaduracouro1', nome: 'Armadura de Couro', tipo: 'Armadura Leve', efeito: '+10 Defesa', efeitoEspecial: null, descricao: 'Feita de couro resistente.', quantidade: 1 }
        ],
        acessorios: [],
        outros: []
    },
    consumiveis: {
        pocoes: [
            { id: 'curamenor1', nome: 'Poção de Cura Menor', tipo: 'Poção', efeito: 'Restaura 50 HP', descricao: 'Uma poção básica para ferimentos leves.', quantidade: 3 }
        ],
        arremessaveis: [],
        utilitarios: [],
        municoes: [],
        outros: []
    },
    uteis: {
        ferramentas: [],
        utilitarios: [],
        outros: []
    },
    riquezas: {
        moedas: [
            { id: 'moedaouro1', nome: 'Moeda de Ouro', tipo: 'Moeda', valorUnitario: 1, descricao: 'Uma moeda de ouro padrão.', quantidade: 170 }
        ],
        outros: []
    },
    diversos: {
        valioso: [],
        missao: [],
        itens: []
    }
};

let itemsData = {};

// --- Referências aos elementos HTML ---
const mainCategoryTabs = document.querySelectorAll('.category-tab');
const subcategoryTabsContainer = document.querySelector('.subcategory-tabs');
// MODIFICADO: A referência agora é para o novo wrapper, não para o item-list diretamente
const itemListWrapper = document.getElementById('itemListWrapper'); 
const itemDetailsContainer = document.querySelector('.item-details');
const addItemForm = document.getElementById('addItemForm');

// Referências aos botões de mostrar/esconder
const showAddItemButton = document.getElementById('showAddItemButton');
const addItemFormContainer = document.getElementById('addItemFormContainer');
const cancelAddItemButton = document.getElementById('cancelAddItemButton');
const importItemContainer = document.getElementById('importItemContainer')

// Referências aos elementos de detalhes
const detailsName = itemDetailsContainer.querySelector('.details-name');
const detailsType = itemDetailsContainer.querySelector('.details-type');
const detailsEffect = itemDetailsContainer.querySelector('.details-effect');
const detailsSpecialEffect = itemDetailsContainer.querySelector('.details-special-effect');
const detailsDescription = itemDetailsContainer.querySelector('.details-description');
const detailsQuantity = itemDetailsContainer.querySelector('.details-quantity');
const detailsValue = itemDetailsContainer.querySelector('.details-value');

// Referências aos botões de ação
const removeButton = document.getElementById('removeButton');
const useItemButton = document.getElementById('useItemButton');
const addQuantityButton = document.getElementById('addQuantityButton');

// NOVAS Referências aos botões e containers para a nova UI
const moreActionButton = document.getElementById('moreActionButton');
const secondaryActionsContainer = document.getElementById('secondaryActionsContainer');
const editItemButton = document.getElementById('editItemButton');
const exportItemTextButton = document.getElementById('exportItemTextButton'); // NOVA REFERÊNCIA

// Referências para o modal de remoção
const removeModal = document.getElementById('removeModal');
const itemToRemoveName = document.getElementById('itemToRemoveName');
const removeQuantityInput = document.getElementById('removeQuantityInput');
const maxQuantitySpan = document.getElementById('maxQuantitySpan');
const confirmRemoveButton = document.getElementById('confirmRemoveButton');
const cancelRemoveButton = document.getElementById('cancelRemoveButton');
const removeAllButton = document.getElementById('removeAllButton');

// Referências para o modal de adição
const addModal = document.getElementById('addModal');
const itemToAddName = document.getElementById('itemToAddName');
const addQuantityInput = document.getElementById('addQuantityInput');
const confirmAddButton = document.getElementById('confirmAddButton');
const cancelAddButton = document.getElementById('cancelAddButton');

// Referências para os menus suspenso do formulário de adicionar
const itemCategorySelect = document.getElementById('itemCategory');
const itemSubcategorySelect = document.getElementById('itemSubcategory');

// Referência ao elemento de riqueza total
const totalWealthValueSpan = document.getElementById('totalWealthValue');

// NOVAS Referências para importação e exportação
const exportButton = document.getElementById('exportButton');
const importButton = document.getElementById('importButton');
const importFile = document.getElementById('importFile');

// NOVAS Referências para exportação/importação de texto
const itemTextModal = document.querySelector('.item-text-modal');
const itemTextOutput = document.getElementById('itemTextOutput');
const copyItemTextButton = document.getElementById('copyItemTextButton');

// NOVAS Referências para a importação de item por texto
const importItemText = document.getElementById('importItemText');
const importItemTextButton = document.getElementById('importItemTextButton');

// --- Variáveis para manter o controle da categoria e subcategoria ativas ---
let activeCategory = 'equipamentos';
let activeSubcategory = 'armas';
let activeItemId = null;
let isEditMode = false;
let showAllItems = false;

// --- NOVAS VARIÁVEIS PARA FILTROS E ORDENAÇÃO ---
const searchInput = document.getElementById('searchInput');
const sortNameButton = document.getElementById('sortNameButton');
const sortQuantityButton = document.getElementById('sortQuantityButton');

// MODIFICADO: Variáveis e função para gerenciar o feedback visual
let currentSort = 'name'; // Corrigido para começar com 'name' para alinhar com o HTML
let sortDirection = 1; // 1 para ascendente, -1 para descendente

function updateSortButtons() {
    // Remove as classes de todos os botões para resetar o estado
    sortNameButton.classList.remove('active');
    sortQuantityButton.classList.remove('active');
    sortNameButton.innerHTML = `Nome`;
    sortQuantityButton.innerHTML = `Qtd.`;

    if (currentSort === 'name') {
        const icon = sortDirection === 1 ? '▲' : '▼';
        sortNameButton.classList.add('active');
        sortNameButton.innerHTML = `Nome <span class="sort-icon">${icon}</span>`;
    } else if (currentSort === 'quantity') {
        const icon = sortDirection === 1 ? '▲' : '▼';
        sortQuantityButton.classList.add('active');
        sortQuantityButton.innerHTML = `Qtd. <span class="sort-icon">${icon}</span>`;
    }
}

// --- FUNÇÕES DE LOCALSTORAGE ---
function saveItemsToLocalStorage() {
    localStorage.setItem('rpgInventoryItems', JSON.stringify(itemsData));
    updateTotalWealth();
}

function loadItemsFromLocalStorage() {
    const storedItems = localStorage.getItem('rpgInventoryItems');
    if (storedItems) {
        itemsData = JSON.parse(storedItems);
    } else {
        itemsData = defaultItemsData;
        saveItemsToLocalStorage();
    }
}

function updateTotalWealth() {
    let totalValue = 0;
    const wealthItems = itemsData.riquezas;

    if (wealthItems) {
        for (const subcategory in wealthItems) {
            wealthItems[subcategory].forEach(item => {
                if (item.valorUnitario && item.quantidade) {
                    totalValue += item.valorUnitario * item.quantidade;
                }
            });
        }
    }
    totalWealthValueSpan.textContent = totalValue.toLocaleString('pt-BR');
}

// --- FUNÇÕES DE EXPORTAÇÃO E IMPORTAÇÃO ---
function exportInventory() {
    const dataStr = JSON.stringify(itemsData, null, 2); // O 'null, 2' formata o JSON com indentação
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'rpg-inventory.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Inventário exportado com sucesso!');
}

function importInventory(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData) {
                if (confirm('Atenção: A importação irá substituir o seu inventário atual. Continuar?')) {
                    itemsData = importedData;
                    saveItemsToLocalStorage();
                    loadItems();
                    alert('Inventário importado com sucesso!');
                }
            } else {
                alert('Erro ao importar. O arquivo JSON está vazio ou inválido.');
            }
        } catch (error) {
            alert('Erro ao processar o arquivo JSON. Certifique-se de que é um arquivo válido.');
            console.error('Erro ao importar JSON:', error);
        }
    };
    reader.readAsText(file);
}

// --- FUNÇÕES DE EXIBIÇÃO E MANIPULAÇÃO DO INVENTÁRIO ---
function displaySubcategories(category) {
    subcategoryTabsContainer.innerHTML = '';

    // Calcula a contagem de todos os itens da categoria
    const allItemsCount = Object.values(itemsData[category] || {}).flat().length;

    // Cria e adiciona a aba 'Todos'
    const allButton = document.createElement('button');
    allButton.classList.add('subcategory-tab', 'all-tab');
    allButton.textContent = `Todos (${allItemsCount})`;
    allButton.dataset.subcategory = 'all';
    subcategoryTabsContainer.appendChild(allButton);
    
    // Define a aba 'Todos' como ativa por padrão
    allButton.classList.add('active');
    showAllItems = true;
    activeSubcategory = 'all';

    const subcategories = subcategoriesData[category];

    if (subcategories && subcategories.length > 0) {
        subcategories.forEach((sub) => {
            const button = document.createElement('button');
            button.classList.add('subcategory-tab');
            
            // Calcula a contagem de itens da subcategoria
            const subKey = sub.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '-');
            const subcategoryItemsCount = itemsData[category]?.[subKey]?.length || 0;
            
            // Adiciona o nome e a contagem ao texto do botão
            button.textContent = `${sub} (${subcategoryItemsCount})`;
            button.dataset.subcategory = subKey;
            
            subcategoryTabsContainer.appendChild(button);
        });
    }
    
    // Garante que o painel de itens de 'Todos' seja carregado
    loadItems();
    displayItemDetails(null);
}

// MODIFICADO: Função para filtrar e ordenar os itens
function filterAndSortItems(items) {
    if (!items) {
        return [];
    }

    let filteredItems = [...items];
    const searchTerm = searchInput.value.toLowerCase();

    // 1. Filtrar
    if (searchTerm) {
        filteredItems = filteredItems.filter(item =>
            item.nome.toLowerCase().includes(searchTerm)
        );
    }

    // 2. Ordenar
    if (currentSort === 'name') {
        filteredItems.sort((a, b) => a.nome.localeCompare(b.nome) * sortDirection);
    } else if (currentSort === 'quantity') {
        filteredItems.sort((a, b) => (a.quantidade - b.quantidade) * sortDirection);
    }

    return filteredItems;
}


// MODIFICADO: Função loadItems agora usa a nova lógica
function loadItems() {
    // 1. Limpa o container da lista de itens
    itemListWrapper.innerHTML = '';
    
    let itemsToDisplay = [];

    // 2. Decide qual lista de itens carregar
    if (showAllItems) {
        // Se a aba "Todos" estiver ativa, coleta todos os itens da categoria
        const subcategories = itemsData[activeCategory];
        if (subcategories) {
            // Usa Object.values() para obter todos os arrays de subcategorias e .flat() para uni-los
            itemsToDisplay = Object.values(subcategories).flat();
        }
    } else {
        // Se uma subcategoria específica estiver ativa, carrega apenas os itens dela
        itemsToDisplay = itemsData[activeCategory]?.[activeSubcategory] || [];
    }

    // 3. Aplica o filtro e a ordenação na lista de itens
    const filteredAndSortedItems = filterAndSortItems(itemsToDisplay);

    // 4. Exibe os itens na tela
    if (filteredAndSortedItems && filteredAndSortedItems.length > 0) {
        filteredAndSortedItems.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            itemCard.dataset.itemId = item.id;
            
            itemCard.addEventListener('click', () => {
                itemListWrapper.querySelectorAll('.item-card').forEach(card => {
                    card.classList.remove('active');
                });
                itemCard.classList.add('active');
                displayItemDetails(item);
            });

            const itemName = document.createElement('span');
            itemName.classList.add('item-name');
            itemName.textContent = item.nome;

            const itemQuantity = document.createElement('span');
            itemQuantity.classList.add('item-quantity');
            itemQuantity.textContent = `x${item.quantidade}`;

            itemCard.appendChild(itemName);
            itemCard.appendChild(itemQuantity);
            itemListWrapper.appendChild(itemCard);
        });

    } else {
        itemListWrapper.innerHTML = '<p>Nenhum item nesta categoria.</p>';
    }
}

// --- FUNÇÕES PARA IMPORTAÇÃO/EXPORTAÇÃO DE ITEM EM TEXTO ---
function generateItemText(item) {
    if (!item) {
        return '';
    }

    let itemText = `nome: ${item.nome}\n`;
    itemText += `categoria: ${activeCategory}\n`;
    itemText += `subcategoria: ${activeSubcategory}\n`;
    itemText += `quantidade: ${item.quantidade}\n`;
    
    if (item.tipo) itemText += `tipo: ${item.tipo}\n`;
    if (item.efeito) itemText += `efeito: ${item.efeito}\n`;
    if (item.efeitoEspecial) itemText += `especial: ${item.efeitoEspecial}\n`;
    if (item.descricao) itemText += `descricao: ${item.descricao}\n`;
    if (item.valorUnitario) itemText += `valor: ${item.valorUnitario}\n`;
    
    return itemText;
}

function parseItemText(itemText) {
    const lines = itemText.split('\n');
    const importedItem = {};

    lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        const keyClean = key.trim().toLowerCase();
        const value = valueParts.join(':').trim();

        if (keyClean && value) {
            switch (keyClean) {
                case 'nome':
                    importedItem.nome = value;
                    break;
                case 'categoria':
                    importedItem.categoria = value;
                    break;
                case 'subcategoria':
                    importedItem.subcategoria = value;
                    break;
                case 'quantidade':
                    importedItem.quantidade = parseInt(value, 10);
                    break;
                case 'tipo':
                    importedItem.tipo = value;
                    break;
                case 'efeito':
                    importedItem.efeito = value;
                    break;
                case 'especial':
                    importedItem.efeitoEspecial = value;
                    break;
                case 'descricao':
                    importedItem.descricao = value;
                    break;
                case 'valor':
                    importedItem.valorUnitario = parseInt(value, 10);
                    break;
            }
        }
    });

    return importedItem;
}

function fillFormFromItem(item) {
    // Limpa o formulário e reseta o modo de edição
    addItemForm.reset();
    isEditMode = false;
    document.getElementById('formTitle').textContent = 'Adicionar Novo Item';
    document.getElementById('submitButton').textContent = 'Adicionar';

    // Preenche os campos do formulário com os dados do item
    document.getElementById('itemName').value = item.nome || '';
    document.getElementById('itemType').value = item.tipo || '';
    document.getElementById('itemEffect').value = item.efeito || '';
    document.getElementById('itemSpecialEffect').value = item.efeitoEspecial || '';
    document.getElementById('itemDescription').value = item.descricao || '';
    document.getElementById('itemQuantity').value = item.quantidade || 1;
    document.getElementById('itemValue').value = item.valorUnitario || '';

    // Seleciona a categoria e subcategoria
    if (item.categoria) {
        itemCategorySelect.value = item.categoria;
        updateSubcategoryOptions(); // Atualiza as subcategorias
    }
    if (item.subcategoria) {
        itemSubcategorySelect.value = item.subcategoria;
    }
}

function copyItemText() {
    itemTextOutput.select();
    document.execCommand('copy');
    alert('Texto do item copiado para a área de transferência!');
}

function displayItemDetails(item) {
    // Limpa todos os detalhes e esconde todos os botões no início
    detailsName.textContent = 'Nenhum item selecionado';
    detailsType.innerHTML = '';
    detailsEffect.innerHTML = '';
    detailsSpecialEffect.innerHTML = '';
    detailsDescription.innerHTML = '';
    detailsQuantity.innerHTML = '';
    detailsValue.innerHTML = '';
    
    // Esconde todos os botões e containers
    removeButton.classList.add('hidden');
    useItemButton.classList.add('hidden');
    addQuantityButton.classList.add('hidden');
    moreActionButton.classList.add('hidden');
    secondaryActionsContainer.classList.add('hidden');
    editItemButton.classList.add('hidden');
    exportItemTextButton.classList.add('hidden')
    itemTextModal.classList.add('hidden');

    if (item) {
        detailsName.textContent = item.nome || 'N/A';
        detailsType.innerHTML = `<span>Tipo:</span> ${item.tipo || 'N/A'}`;
        detailsEffect.innerHTML = `<span>Efeito:</span> ${item.efeito || 'N/A'}`;
        detailsSpecialEffect.innerHTML = `<span>Especial:</span> ${item.efeitoEspecial || 'N/A'}`;
        detailsDescription.innerHTML = `<span>Descrição:</span> ${item.descricao || 'N/A'}`;
        detailsQuantity.innerHTML = `<span>Quantidade:</span> ${item.quantidade || 0}`;

        if (activeCategory === 'riquezas' && item.valorUnitario) {
            detailsValue.innerHTML = `<span>Valor:</span> ${item.valorUnitario || 0}`;
            detailsValue.classList.remove('hidden');
        } else {
            detailsValue.classList.add('hidden');
        }

        detailsType.classList.toggle('hidden', !item.tipo);
        detailsEffect.classList.toggle('hidden', !item.efeito);
        detailsSpecialEffect.classList.toggle('hidden', !item.efeitoEspecial);
        detailsDescription.classList.toggle('hidden', !item.descricao);

        activeItemId = item.id;

        // Exibe os botões de ação principais com base na categoria
        if (activeCategory === 'consumiveis') {
            useItemButton.classList.remove('hidden');
            addQuantityButton.classList.remove('hidden');
            removeButton.classList.remove('hidden');
        } else if (activeCategory === 'riquezas') {
            addQuantityButton.classList.remove('hidden');
            removeButton.classList.remove('hidden');
        } else { // Para Equipamentos, Úteis e Diversos
            removeButton.classList.remove('hidden');
        }
        
        // Sempre exibe o botão 'Mais...' se um item estiver selecionado
        moreActionButton.classList.remove('hidden');
    }
}

function handleAddQuantity(itemId, quantity) {
    // NOVO: Encontra o item em qualquer subcategoria da categoria ativa
    let subcategoryToUpdate = null;
    let itemToUpdate = null;
    
    // Itera sobre as subcategorias para encontrar o item
    for (const subcategory in itemsData[activeCategory]) {
        const itemsInSub = itemsData[activeCategory][subcategory];
        const foundItem = itemsInSub.find(i => i.id === itemId);
        if (foundItem) {
            itemToUpdate = foundItem;
            // A subcategoria não é necessária aqui, mas é bom manter a referência
            break; 
        }
    }
    
    if (itemToUpdate) {
        itemToUpdate.quantidade += quantity;
        alert(`Adicionadas ${quantity} unidades de '${itemToUpdate.nome}'.`);
        
        saveItemsToLocalStorage();
        loadItems();
        displayItemDetails(itemToUpdate);
        updateTabCounts(); // NOVO: Atualiza a contagem depois de adicionar
    } else {
        alert('Erro: Item não encontrado para adicionar quantidade.');
    }
}

function handleUseItem(itemId) {
    // NOVO: Encontra o item em qualquer subcategoria da categoria ativa
    let subcategoryToUpdate = null;
    let itemToUse = null;

    for (const subcategory in itemsData[activeCategory]) {
        const itemsInSub = itemsData[activeCategory][subcategory];
        const foundItem = itemsInSub.find(i => i.id === itemId);
        if (foundItem) {
            subcategoryToUpdate = subcategory;
            itemToUse = foundItem;
            break;
        }
    }

    if (itemToUse && subcategoryToUpdate) {
        itemToUse.quantidade -= 1;
        alert(`Você usou 1 unidade de '${itemToUse.nome}'.`);

        if (itemToUse.quantidade <= 0) {
            itemsData[activeCategory][subcategoryToUpdate] = itemsData[activeCategory][subcategoryToUpdate].filter(i => i.id !== itemId);
            alert(`Item '${itemToUse.nome}' consumido completamente e removido do inventário.`);
            displayItemDetails(null);
        } else {
            displayItemDetails(itemToUse);
        }

        saveItemsToLocalStorage();
        loadItems();
    }
}

function handleRemoveItem(itemId, quantity) {
    // NOVO: Encontra o item em qualquer subcategoria da categoria ativa
    let subcategoryToUpdate = null;
    let itemToRemove = null;

    for (const subcategory in itemsData[activeCategory]) {
        const itemsInSub = itemsData[activeCategory][subcategory];
        const foundItem = itemsInSub.find(i => i.id === itemId);
        if (foundItem) {
            subcategoryToUpdate = subcategory;
            itemToRemove = foundItem;
            break;
        }
    }

    if (itemToRemove && subcategoryToUpdate) {
        if (quantity >= itemToRemove.quantidade) {
            // Remove o item da subcategoria
            itemsData[activeCategory][subcategoryToUpdate] = itemsData[activeCategory][subcategoryToUpdate].filter(i => i.id !== itemId);
        } else {
            // Apenas diminui a quantidade
            itemToRemove.quantidade -= quantity;
        }

        saveItemsToLocalStorage();
        loadItems();
        updateTabCounts(); // NOVO: Atualiza a contagem depois de adicionar
        
         if (isItemCompletelyRemoved) {
            displayItemDetails(null);
        } else {
            displayItemDetails(itemToRemove);
        }
    }
}


function updateSubcategoryOptions() {
    const selectedCategory = itemCategorySelect.value;
    const subcategories = subcategoriesData[selectedCategory];

    itemSubcategorySelect.innerHTML = '';
    if (subcategories && subcategories.length > 0) {
        subcategories.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '-');
            option.textContent = sub;
            itemSubcategorySelect.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = 'outros';
        option.textContent = 'Outros';
        itemSubcategorySelect.appendChild(option);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();

    if (isEditMode) {
        saveEditedItem();
    } else {
        addNewItem();
    }
}

function addNewItem() {
    const itemName = document.getElementById('itemName').value;
    const itemCategory = itemCategorySelect.value;
    const itemSubcategory = itemSubcategorySelect.value;
    const itemType = document.getElementById('itemType').value || null;
    const itemEffect = document.getElementById('itemEffect').value || null;
    const itemSpecialEffect = document.getElementById('itemSpecialEffect').value || null;
    const itemDescription = document.getElementById('itemDescription').value || null;
    const itemQuantity = parseInt(document.getElementById('itemQuantity').value, 10);
    const itemValue = parseInt(document.getElementById('itemValue').value, 10);

    if (!itemName || !itemCategory || !itemSubcategory || isNaN(itemQuantity) || itemQuantity < 1) {
        alert('Por favor, preencha os campos obrigatórios.');
        return;
    }
    
    if (itemCategory === 'riquezas' && itemSubcategory === 'moedas' && itemName.toLowerCase() === 'moeda de ouro') {
    const existingGoldCoin = itemsData.riquezas.moedas.find(item => item.nome.toLowerCase() === 'moeda de ouro');
    if (existingGoldCoin) {
        existingGoldCoin.quantidade += itemQuantity;
        alert(`${itemQuantity} unidades de 'Moeda de Ouro' adicionadas.`);
        saveItemsToLocalStorage();
        loadItems();
        updateTabCounts(); // NOVO: Atualiza a contagem depois de adicionar/editar
        addItemForm.reset();
        addItemFormContainer.classList.add('hidden');
        showAddItemButton.classList.remove('hidden');
        importItemContainer.classList.remove('hidden')
        return; // Sai da função após a soma
    }
}

    const newItemId = itemName.toLowerCase().replace(/\s/g, '-') + '-' + Date.now();
    const newItem = {
        id: newItemId,
        nome: itemName,
        tipo: itemType,
        efeito: itemEffect,
        efeitoEspecial: itemSpecialEffect,
        descricao: itemDescription,
        quantidade: itemQuantity
    };

    if (itemCategory === 'riquezas') {
        newItem.valorUnitario = isNaN(itemValue) ? 0 : itemValue;
    }

    if (!itemsData[itemCategory]) {
        itemsData[itemCategory] = {};
    }
    if (!itemsData[itemCategory][itemSubcategory]) {
        itemsData[itemCategory][itemSubcategory] = [];
    }

    itemsData[itemCategory][itemSubcategory].push(newItem);
    saveItemsToLocalStorage();

    mainCategoryTabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`.category-tab[data-category="${itemCategory}"]`).classList.add('active');
    activeCategory = itemCategory;

    displaySubcategories(itemCategory);

    const newSubcategoryButton = document.querySelector(`.subcategory-tab[data-subcategory="${itemSubcategory}"]`);
    if (newSubcategoryButton) {
        subcategoryTabsContainer.querySelectorAll('.subcategory-tab').forEach(t => t.classList.remove('active'));
        newSubcategoryButton.classList.add('active');
        activeSubcategory = itemSubcategory;
        loadItems(); // MODIFICADO: Chama loadItems sem argumentos
    }

    addItemForm.reset();
    addItemFormContainer.classList.add('hidden');
    showAddItemButton.classList.remove('hidden');
    alert('Item adicionado com sucesso e salvo!');
}

function saveEditedItem() {
    const itemName = document.getElementById('itemName').value;
    const itemCategory = itemCategorySelect.value;
    const itemSubcategory = itemSubcategorySelect.value;
    const itemType = document.getElementById('itemType').value || null;
    const itemEffect = document.getElementById('itemEffect').value || null;
    const itemSpecialEffect = document.getElementById('itemSpecialEffect').value || null;
    const itemDescription = document.getElementById('itemDescription').value || null;
    const itemQuantity = parseInt(document.getElementById('itemQuantity').value, 10);
    const itemValue = parseInt(document.getElementById('itemValue').value, 10);

    if (!itemName || !itemCategory || !itemSubcategory || isNaN(itemQuantity) || itemQuantity < 1) {
        alert('Por favor, preencha os campos obrigatórios.');
        return;
    }

    const items = itemsData[activeCategory]?.[activeSubcategory];
    const itemIndex = items.findIndex(item => item.id === activeItemId);

    if (itemIndex > -1) {
        const itemToUpdate = items[itemIndex];
        itemToUpdate.nome = itemName;
        itemToUpdate.tipo = itemType;
        itemToUpdate.efeito = itemEffect;
        itemToUpdate.efeitoEspecial = itemSpecialEffect;
        itemToUpdate.descricao = itemDescription;
        itemToUpdate.quantidade = itemQuantity;
        if (itemCategory === 'riquezas') {
            itemToUpdate.valorUnitario = isNaN(itemValue) ? 0 : itemValue;
        }

        saveItemsToLocalStorage();

        addItemFormContainer.classList.add('hidden');
        showAddItemButton.classList.remove('hidden');
        addItemForm.reset();
        
        loadItems(); // MODIFICADO: Chama loadItems sem argumentos
        displayItemDetails(itemToUpdate);
        
        alert(`Item '${itemName}' editado com sucesso!`);
    }

    isEditMode = false;
    document.getElementById('formTitle').textContent = 'Adicionar Novo Item';
    document.getElementById('submitButton').textContent = 'Adicionar';
}

function startEditItem() {
    isEditMode = true;
    
    // NOVO: Coleta todos os itens da categoria para buscar o item
    const allCategoryItems = Object.values(itemsData[activeCategory] || {}).flat();
    const item = allCategoryItems.find(i => i.id === activeItemId);
    
    // Se o item for encontrado, preenche o formulário
    if (item) {
        document.getElementById('formTitle').textContent = 'Editar Item';
        document.getElementById('submitButton').textContent = 'Salvar Alterações';

        addItemFormContainer.classList.remove('hidden');
        showAddItemButton.classList.add('hidden');
        importItemContainer.classList.add('hidden')
        secondaryActionsContainer.classList.add('hidden'); // Esconde o container secundário ao entrar no modo de edição

        document.getElementById('itemName').value = item.nome;
        document.getElementById('itemType').value = item.tipo || '';
        document.getElementById('itemEffect').value = item.efeito || '';
        document.getElementById('itemSpecialEffect').value = item.efeitoEspecial || '';
        document.getElementById('itemDescription').value = item.descricao || '';
        document.getElementById('itemQuantity').value = item.quantidade;
        
        itemCategorySelect.value = activeCategory;
        updateSubcategoryOptions();
        itemSubcategorySelect.value = activeSubcategory;
        
        if (activeCategory === 'riquezas') {
            document.getElementById('itemValue').value = item.valorUnitario || 0;
        } else {
            document.getElementById('itemValue').value = '';
        }
    }
}

// --- Event Listeners ---
mainCategoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        mainCategoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = tab.dataset.category;
        displaySubcategories(activeCategory);
    });
});

subcategoryTabsContainer.addEventListener('click', (event) => {
    const clickedTab = event.target.closest('.subcategory-tab');
    if (clickedTab) {
        subcategoryTabsContainer.querySelectorAll('.subcategory-tab').forEach(t => t.classList.remove('active'));
        clickedTab.classList.add('active');
        activeSubcategory = clickedTab.dataset.subcategory;
        if (activeSubcategory === 'all') {
            showAllItems = true;
        } else {
            showAllItems = false;
        }
        loadItems(); // MODIFICADO: Chama loadItems sem argumentos
    }
});

addItemForm.addEventListener('submit', handleFormSubmit);

showAddItemButton.addEventListener('click', () => {
    addItemFormContainer.classList.remove('hidden');
    showAddItemButton.classList.add('hidden');
    importItemContainer.classList.remove('hidden')
    isEditMode = false;
    document.getElementById('formTitle').textContent = 'Adicionar Novo Item';
    document.getElementById('submitButton').textContent = 'Adicionar';
    addItemForm.reset();
    updateSubcategoryOptions();
});

cancelAddItemButton.addEventListener('click', () => {
    addItemFormContainer.classList.add('hidden');
    showAddItemButton.classList.remove('hidden');
    addItemForm.reset(); // Limpa o formulário ao cancelar, útil para evitar dados de edição
});

itemCategorySelect.addEventListener('change', updateSubcategoryOptions);

// NOVO: Event listener para o botão "Mais..."
moreActionButton.addEventListener('click', () => {
    secondaryActionsContainer.classList.toggle('hidden');
    // Alterna a visibilidade do botão de edição junto com o container
    editItemButton.classList.toggle('hidden');
    exportItemTextButton.classList.toggle('hidden')
});

// Event listener para o botão de edição
editItemButton.addEventListener('click', startEditItem);

addQuantityButton.addEventListener('click', () => {
    // NOVO: Busca o item em todas as subcategorias
    const allCategoryItems = Object.values(itemsData[activeCategory] || {}).flat();
    const item = allCategoryItems.find(i => i.id === activeItemId);

    if (item) {
        itemToAddName.textContent = item.nome;
        addQuantityInput.value = 1;
        addModal.classList.remove('hidden');
    }
});

confirmAddButton.addEventListener('click', () => {
    const quantityToAdd = parseInt(addQuantityInput.value, 10);
    if (quantityToAdd > 0) {
        handleAddQuantity(activeItemId, quantityToAdd);
        addModal.classList.add('hidden');
    } else {
        alert('Quantidade inválida.');
    }
});

cancelAddButton.addEventListener('click', () => {
    addModal.classList.add('hidden');
});

removeButton.addEventListener('click', () => {
    // NOVO: Busca o item em todas as subcategorias
    const allCategoryItems = Object.values(itemsData[activeCategory] || {}).flat();
    const item = allCategoryItems.find(i => i.id === activeItemId);

    if (item) {
        itemToRemoveName.textContent = item.nome;
        if (item.quantidade > 1) {
            document.getElementById('removeModalText').textContent = `Quantos itens de ${item.nome} você quer remover?`;
            removeQuantityInput.value = 1;
            removeQuantityInput.setAttribute('max', item.quantidade);
            maxQuantitySpan.textContent = `(Máx: ${item.quantidade})`;
            removeQuantityInput.classList.remove('hidden');
            maxQuantitySpan.classList.remove('hidden');
            removeAllButton.classList.remove('hidden');
            confirmRemoveButton.textContent = 'Confirmar';
        } else {
            document.getElementById('removeModalText').textContent = `Você tem certeza que deseja remover ${item.nome}?`;
            removeQuantityInput.classList.add('hidden');
            maxQuantitySpan.classList.add('hidden');
            removeAllButton.classList.add('hidden');
            confirmRemoveButton.textContent = 'Remover Item';
        }
        removeModal.classList.remove('hidden');
    }
});

confirmRemoveButton.addEventListener('click', () => {
    // NOVO: Coleta todos os itens da categoria para buscar o item
    const allCategoryItems = Object.values(itemsData[activeCategory] || {}).flat();
    const item = allCategoryItems.find(i => i.id === activeItemId);
    const quantityToRemove = parseInt(removeQuantityInput.value, 10);
    
    if (!item) {
        alert('Erro: Item não encontrado para remoção.');
        return;
    }
    
    if (item.quantidade > 1) {
        if (quantityToRemove > 0 && quantityToRemove <= item.quantidade) {
            handleRemoveItem(activeItemId, quantityToRemove);
            removeModal.classList.add('hidden');
        } else {
            alert('Quantidade inválida.');
        }
    } else {
        // Lógica para confirmar a remoção de um item único
        handleRemoveItem(activeItemId, 1);
        removeModal.classList.add('hidden');
        
        // Retorna o modal ao estado original para a próxima vez
        removeQuantityInput.classList.remove('hidden');
        maxQuantitySpan.classList.remove('hidden');
        removeAllButton.classList.remove('hidden');
        confirmRemoveButton.textContent = 'Confirmar';
        document.getElementById('removeModalText').textContent = `Quantos itens de você quer remover?`;
    }
});

cancelRemoveButton.addEventListener('click', () => {
    removeModal.classList.add('hidden');
    // Retorna o modal ao estado original
    removeQuantityInput.classList.remove('hidden');
    maxQuantitySpan.classList.remove('hidden');
    removeAllButton.classList.remove('hidden');
    confirmRemoveButton.textContent = 'Confirmar';
    document.getElementById('removeModalText').textContent = 'Quantos itens de você quer remover?';
});

removeAllButton.addEventListener('click', () => {
    if (activeItemId) {
        // NOVO: Coleta todos os itens da categoria para buscar o item
        const allCategoryItems = Object.values(itemsData[activeCategory] || {}).flat();
        const item = allCategoryItems.find(i => i.id === activeItemId);
        
        if (item) {
            handleRemoveItem(activeItemId, item.quantidade);
            removeModal.classList.add('hidden');
        } else {
            alert('Erro: Item não encontrado para remoção.');
        }
    }
});

useItemButton.addEventListener('click', () => {
    if (activeItemId) {
        handleUseItem(activeItemId);
    }
});

// --- NOVOS EVENT LISTENERS PARA FILTROS E ORDENAÇÃO ---
searchInput.addEventListener('input', () => {
    loadItems();
});

sortNameButton.addEventListener('click', () => {
    if (currentSort === 'name') {
        sortDirection *= -1;
    } else {
        currentSort = 'name';
        sortDirection = 1;
    }
    updateSortButtons(); // NOVO: Chama a função para atualizar a classe do botão
    loadItems();
});

sortQuantityButton.addEventListener('click', () => {
    if (currentSort === 'quantity') {
        sortDirection *= -1;
    } else {
        currentSort = 'quantity';
        sortDirection = 1;
    }
    updateSortButtons(); // NOVO: Chama a função para atualizar a classe do botão
    loadItems();
});

// NOVOS Event listeners para Importar/Exportar
exportButton.addEventListener('click', exportInventory);

importButton.addEventListener('click', () => {
    // Simula um clique no input de arquivo oculto
    importFile.click();
});

importFile.addEventListener('change', importInventory);

// Event listener para copiar o texto do item
copyItemTextButton.addEventListener('click', copyItemText);

// Novo event listener para o botão de importar item por texto
importItemTextButton.addEventListener('click', () => {
    const itemText = importItemText.value;
    if (itemText) {
        const importedItem = parseItemText(itemText);
        if (importedItem.nome && importedItem.quantidade) {
            fillFormFromItem(importedItem);
            alert('Item importado para o formulário. Revise e adicione.');
            importItemText.value = ''; // Limpa a área de texto
        } else {
            alert('O texto do item está em um formato inválido. Por favor, verifique o padrão.');
        }
    } else {
        alert('Por favor, cole o texto de um item na caixa acima.');
    }
});

// Novo event listener para o botão de compartilhar item
exportItemTextButton.addEventListener('click', () => {
    // NOVO: Coleta todos os itens da categoria para buscar o item
    const allCategoryItems = Object.values(itemsData[activeCategory] || {}).flat();
    const item = allCategoryItems.find(i => i.id === activeItemId);

    if (item) {
        itemTextOutput.value = generateItemText(item);
        itemTextModal.classList.toggle('hidden');
    }
});

// --- FUNÇÃO PARA ATUALIZAR CONTAGEM DE ITENS NAS ABAS ---
function updateTabCounts() {
    // Atualiza as abas de Categoria
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        const category = tab.dataset.category;
        const categoryItemsCount = Object.values(itemsData[category] || {}).flat().length;
        tab.textContent = `${category.toUpperCase()} (${categoryItemsCount})`;
    });

    // Atualiza as abas de Subcategoria
    const subcategoryTabs = document.querySelectorAll('.subcategory-tab');
    const activeCategoryData = itemsData[activeCategory] || {};
    subcategoryTabs.forEach(tab => {
        const subcategory = tab.dataset.subcategory;
        if (subcategory === 'all') {
            const allItemsCount = Object.values(activeCategoryData).flat().length;
            tab.textContent = `Todos (${allItemsCount})`;
        } else {
            const subcategoryItemsCount = activeCategoryData[subcategory]?.length || 0;
            const subName = tab.textContent.split(' ')[0];
            tab.textContent = `${subName} (${subcategoryItemsCount})`;
        }
    });
}

// --- Inicialização do Inventário ---
document.addEventListener('DOMContentLoaded', () => {
    loadItemsFromLocalStorage();

    const initialCategoryTab = document.querySelector('.category-tab[data-category="equipamentos"]');
    if (initialCategoryTab) {
        initialCategoryTab.classList.add('active');
        activeCategory = 'equipamentos';
        displaySubcategories(activeCategory);
    }

    removeModal.classList.add('hidden');
    addModal.classList.add('hidden');
    addItemFormContainer.classList.add('hidden');
    showAddItemButton.classList.remove('hidden');
    
    // Oculta os botões de ação e o container secundário na inicialização
    removeButton.classList.add('hidden');
    useItemButton.classList.add('hidden');
    addQuantityButton.classList.add('hidden');
    moreActionButton.classList.add('hidden');
    secondaryActionsContainer.classList.add('hidden');

    itemTextModal.classList.add('hidden');

    
    updateSubcategoryOptions();
    updateTotalWealth();
    updateSortButtons(); // NOVO: Inicializa a aparência dos botões de ordenação
    updateTabCounts();
});
