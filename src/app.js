import PROCESS_STATES from './consts.js';
import initView from './view.js';

const app = () => {
  console.log('app');

  const elements = {
    formEl: document.querySelector('.rss-form'),
    inputEl: document.getElementById('url-input'),
    submitEl: document.querySelector('button[type="submit"]'),
    feedbackEl: document.querySelector('.feedback'),
    feedsEl: document.querySelector('.feeds'),
    feedsListEl: document.querySelector('.feeds ul'),
  };

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

  initView(state, elements);
};

export default app;
