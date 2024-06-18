import i18next from 'i18next';
import resources from './locales/index.js';
import PROCESS_STATES from './consts.js';
import initView from './view.js';

const defaultLanguage = 'ru';

const app = () => {
  const state = {
    aggregator: {
      feedsURLs: [],
      processState: PROCESS_STATES.WAITING_FOR_INPUT,
      processFeedback: {
        success: undefined,
        failure: undefined,
      },
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then((t) => {
    console.log(t('tanslationLoaded'));
  }).then(() => {
    initView(state, i18n);
  }).catch((err) => {
    throw err;
  });
};

export default app;
