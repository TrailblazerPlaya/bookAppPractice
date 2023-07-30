import { AbstractView } from "../../common/view.js";
import onChange from 'on-change';
import { Header } from "../../components/header/header.js";
import { Search } from "../../components/search/search.js";
import { CardList } from "../../components/card-list/card-list.js";
// import { Card } from "../../components/card/card.js";


export class MainView extends AbstractView {
    state = {
        list: [],
        numFound: 0,
        loading: false,
        searchQuery: undefined,
        offset: 0,
    }

    constructor(appState) {
        super();
        this.appState = appState;
        this.appState = onChange(this.appState, this.appStateHook.bind(this));
        this.state = onChange(this.state, this.stateHook.bind(this));
        this.setTitle('Поиск книг');
    }

    destroy() {
        onChange.unsubscribe(this.appState);
        onChange.unsubscribe(this.state);
    }

    appStateHook(path) {
        if (path === 'favorites') {
            // this.state.favorites = this.appState.favorites;
            this.render();
        }
    }
    
    
    async loadList (q, offset) {
        //вместо .org написал .com и пытался решить проблему c cors
        const res = await fetch(`http://openlibrary.org/search.json?q=${q}&offset=${offset}`);
        const dataBook = await res.json();
        return dataBook;
    }

    async stateHook(path) {
        if (path === 'searchQuery') {
            this.state.loading = true;
            const data = await this.loadList(this.state.searchQuery, this.state.offset);
            this.state.loading = false;
            console.log(data);
            this.state.numFound = data.numFound;
            this.state.list = data.docs;

            // const CardList = document.querySelector('search-results');
            // CardList.updateResultsCount(data.numFound); // обновление количества результатов
            // CardList.showLoadingIndicator();
        }
        

        if (path === 'list' || path === 'loading'){
            this.render();
        }
        
    }

    render() {
        const main = document.createElement('div');
        main.innerHTML = `
            <h1>
                Найдено книг: ${this.state.numFound}
            </h1>
        `;
        main.append(new Search(this.state).render()); 
        
        main.append(new CardList(this.appState, this.state).render());
        this.app.innerHTML = '';
        this.app.append(main);
        this.renderHeader();
    }

    renderHeader() {
        const header = new Header(this.appState).render();
        this.app.prepend(header);
    }
}