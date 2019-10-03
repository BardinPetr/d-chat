import reduxStore from 'Approot/background';
import App from 'Approot/UI/components/App';

const renderApp = async () => {
	const store = await reduxStore;
	App(store);
};

export default renderApp;
