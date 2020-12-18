export interface Locale {
  addDescription: string;
  addEdge: string;
  addNode: string;
  back: string;
  close: string;
  createEdgeError: string;
  del: string;
  deleteClusterError: string;
  edgeDescription: string;
  edit: string;
  editClusterError: string;
  editEdge: string;
  editEdgeDescription: string;
  editNode: string;
}
export type Locales = Record<string, Locale>;

// English
export const en: Locale = {
  addDescription: "Click in an empty space to place a new node.",
  addEdge: "Add Edge",
  addNode: "Add Node",
  back: "Back",
  close: "Close",
  createEdgeError: "Cannot link edges to a cluster.",
  del: "Delete selected",
  deleteClusterError: "Clusters cannot be deleted.",
  edgeDescription:
    "Click on a node and drag the edge to another node to connect them.",
  edit: "Edit",
  editClusterError: "Clusters cannot be edited.",
  editEdge: "Edit Edge",
  editEdgeDescription:
    "Click on the control points and drag them to a node to connect to it.",
  editNode: "Edit Node",
};

// German
export const de: Locale = {
  addDescription:
    "Klicke auf eine freie Stelle, um einen neuen Knoten zu plazieren.",
  addEdge: "Kante hinzuf\u00fcgen",
  addNode: "Knoten hinzuf\u00fcgen",
  back: "Zur\u00fcck",
  close: "Schließen",
  createEdgeError:
    "Es ist nicht m\u00f6glich, Kanten mit Clustern zu verbinden.",
  del: "L\u00f6sche Auswahl",
  deleteClusterError: "Cluster k\u00f6nnen nicht gel\u00f6scht werden.",
  edgeDescription:
    "Klicke auf einen Knoten und ziehe die Kante zu einem anderen Knoten, um diese zu verbinden.",
  edit: "Editieren",
  editClusterError: "Cluster k\u00f6nnen nicht editiert werden.",
  editEdge: "Kante editieren",
  editEdgeDescription:
    "Klicke auf die Verbindungspunkte und ziehe diese auf einen Knoten, um sie zu verbinden.",
  editNode: "Knoten editieren",
};

// Spanish
export const es: Locale = {
  addDescription:
    "Haga clic en un lugar vac\u00edo para colocar un nuevo nodo.",
  addEdge: "A\u00f1adir arista",
  addNode: "A\u00f1adir nodo",
  back: "Atr\u00e1s",
  close: "Cerrar",
  createEdgeError: "No se puede conectar una arista a un grupo.",
  del: "Eliminar selecci\u00f3n",
  deleteClusterError: "No es posible eliminar grupos.",
  edgeDescription:
    "Haga clic en un nodo y arrastre la arista hacia otro nodo para conectarlos.",
  edit: "Editar",
  editClusterError: "No es posible editar grupos.",
  editEdge: "Editar arista",
  editEdgeDescription:
    "Haga clic en un punto de control y arrastrelo a un nodo para conectarlo.",
  editNode: "Editar nodo",
};

//Italiano
export const it: Locale = {
  addDescription: "Clicca per aggiungere un nuovo nodo",
  addEdge: "Aggiungi un vertice",
  addNode: "Aggiungi un nodo",
  back: "Indietro",
  close: "Chiudere",
  createEdgeError: "Non si possono collegare vertici ad un cluster",
  del: "Cancella la selezione",
  deleteClusterError: "I cluster non possono essere cancellati",
  edgeDescription:
    "Clicca su un nodo e trascinalo ad un altro nodo per connetterli.",
  edit: "Modifica",
  editClusterError: "I clusters non possono essere modificati.",
  editEdge: "Modifica il vertice",
  editEdgeDescription:
    "Clicca sui Punti di controllo e trascinali ad un nodo per connetterli.",
  editNode: "Modifica il nodo",
};

// Dutch
export const nl: Locale = {
  addDescription: "Klik op een leeg gebied om een nieuwe node te maken.",
  addEdge: "Link toevoegen",
  addNode: "Node toevoegen",
  back: "Terug",
  close: "Sluiten",
  createEdgeError: "Kan geen link maken naar een cluster.",
  del: "Selectie verwijderen",
  deleteClusterError: "Clusters kunnen niet worden verwijderd.",
  edgeDescription:
    "Klik op een node en sleep de link naar een andere node om ze te verbinden.",
  edit: "Wijzigen",
  editClusterError: "Clusters kunnen niet worden aangepast.",
  editEdge: "Link wijzigen",
  editEdgeDescription:
    "Klik op de verbindingspunten en sleep ze naar een node om daarmee te verbinden.",
  editNode: "Node wijzigen",
};

// Portuguese Brazil
export const pt: Locale = {
  addDescription: "Clique em um espaço em branco para adicionar um novo nó",
  addEdge: "Adicionar aresta",
  addNode: "Adicionar nó",
  back: "Voltar",
  close: "Fechar",
  createEdgeError: "Não foi possível linkar arestas a um cluster.",
  del: "Remover selecionado",
  deleteClusterError: "Clusters não puderam ser removidos.",
  edgeDescription:
    "Clique em um nó e arraste a aresta até outro nó para conectá-los",
  edit: "Editar",
  editClusterError: "Clusters não puderam ser editados.",
  editEdge: "Editar aresta",
  editEdgeDescription:
    "Clique nos pontos de controle e os arraste para um nó para conectá-los",
  editNode: "Editar nó",
};

// Russian
export const ru: Locale = {
  addDescription: "Кликните в свободное место, чтобы добавить новый узел.",
  addEdge: "Добавить ребро",
  addNode: "Добавить узел",
  back: "Назад",
  close: "Закрывать",
  createEdgeError: "Невозможно соединить ребра в кластер.",
  del: "Удалить выбранное",
  deleteClusterError: "Кластеры не могут быть удалены",
  edgeDescription:
    "Кликните на узел и протяните ребро к другому узлу, чтобы соединить их.",
  edit: "Редактировать",
  editClusterError: "Кластеры недоступны для редактирования.",
  editEdge: "Редактировать ребро",
  editEdgeDescription:
    "Кликните на контрольные точки и перетащите их в узел, чтобы подключиться к нему.",
  editNode: "Редактировать узел",
};

// Chinese
export const cn: Locale = {
  addDescription: "单击空白处放置新节点。",
  addEdge: "添加连接线",
  addNode: "添加节点",
  back: "返回",
  close: "關閉",
  createEdgeError: "无法将连接线连接到群集。",
  del: "删除选定",
  deleteClusterError: "无法删除群集。",
  edgeDescription: "单击某个节点并将该连接线拖动到另一个节点以连接它们。",
  edit: "编辑",
  editClusterError: "无法编辑群集。",
  editEdge: "编辑连接线",
  editEdgeDescription: "单击控制节点并将它们拖到节点上连接。",
  editNode: "编辑节点",
};

// Ukrainian
export const uk: Locale = {
  addDescription: "Kлікніть на вільне місце, щоб додати новий вузол.",
  addEdge: "Додати край",
  addNode: "Додати вузол",
  back: "Назад",
  close: "Закрити",
  createEdgeError: "Не можливо об'єднати краї в групу.",
  del: "Видалити обране",
  deleteClusterError: "Групи не можуть бути видалені.",
  edgeDescription:
    "Клікніть на вузол і перетягніть край до іншого вузла, щоб їх з'єднати.",
  edit: "Редагувати",
  editClusterError: "Групи недоступні для редагування.",
  editEdge: "Редагувати край",
  editEdgeDescription:
    "Клікніть на контрольні точки і перетягніть їх у вузол, щоб підключитися до нього.",
  editNode: "Редагувати вузол",
};

// French
export const fr: Locale = {
  addDescription: "Cliquez dans un endroit vide pour placer un nœud.",
  addEdge: "Ajouter un lien",
  addNode: "Ajouter un nœud",
  back: "Retour",
  close: "Fermer",
  createEdgeError: "Impossible de créer un lien vers un cluster.",
  del: "Effacer la sélection",
  deleteClusterError: "Les clusters ne peuvent pas être effacés.",
  edgeDescription:
    "Cliquez sur un nœud et glissez le lien vers un autre nœud pour les connecter.",
  edit: "Éditer",
  editClusterError: "Les clusters ne peuvent pas être édités.",
  editEdge: "Éditer le lien",
  editEdgeDescription:
    "Cliquez sur les points de contrôle et glissez-les pour connecter un nœud.",
  editNode: "Éditer le nœud",
};

// Czech
export const cs: Locale = {
  addDescription: "Kluknutím do prázdného prostoru můžete přidat nový vrchol.",
  addEdge: "Přidat hranu",
  addNode: "Přidat vrchol",
  back: "Zpět",
  close: "Zavřít",
  createEdgeError: "Nelze připojit hranu ke shluku.",
  del: "Smazat výběr",
  deleteClusterError: "Nelze mazat shluky.",
  edgeDescription:
    "Přetažením z jednoho vrcholu do druhého můžete spojit tyto vrcholy novou hranou.",
  edit: "Upravit",
  editClusterError: "Nelze upravovat shluky.",
  editEdge: "Upravit hranu",
  editEdgeDescription:
    "Přetažením kontrolního vrcholu hrany ji můžete připojit k jinému vrcholu.",
  editNode: "Upravit vrchol",
};
