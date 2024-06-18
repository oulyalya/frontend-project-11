import onChange from 'on-change';
import { isEmpty } from 'lodash';

import PROCESS_STATES from './consts.js';
import yupValidate from './formValidation/yupValidate.js';
import copyTextOnClick from './copyTextOnClick.js';

const switchElementsDisabled = (elementsArr, shouldBeDisabled = true) => {
  elementsArr.forEach((element) => {
    if (shouldBeDisabled) {
      element.setAttribute('disabled', true);
    } else {
      element.removeAttribute('disabled');
    }
  });
};

const handleProcessState = (elements, processState) => {
  const { inputEl, submitEl } = elements;

  switch (processState) {
    case PROCESS_STATES.WAITING_FOR_INPUT:
      switchElementsDisabled([inputEl, submitEl], false);
      inputEl.focus();
      break;
    case PROCESS_STATES.VALIDATING_INPUT:
      switchElementsDisabled([inputEl, submitEl]);
      break;
    case PROCESS_STATES.LOADING_FEED:
      break;
    default:
      throw new Error(`Unknown prosess state ${processState}`);
  }
};

const handleProcessFeedback = (elements, value) => {
  const {
    formEl, inputEl, feedsEl, feedbackEl,
  } = elements;
  const { success, failure } = value;

  if (failure) {
    inputEl.classList.remove('is-valid');
    feedbackEl.classList.remove('text-success');
    feedbackEl.classList.add('text-danger');
    feedbackEl.textContent = failure;
  }

  if (success) {
    inputEl.classList.add('is-valid');
    feedbackEl.classList.add('text-success');
    feedbackEl.classList.remove('text-danger');
    feedbackEl.textContent = success;
    formEl.reset();
    feedsEl.removeAttribute('hidden');
  }
};

const addWatchedFeedsItem = (list, text) => {
  const li = document.createElement('li');
  li.textContent = text;
  list.append(li);
};

const renderView = (elements) => (path, value) => {
  switch (path) {
    case 'aggregator.processState':
      handleProcessState(elements, value);
      break;

    case 'aggregator.feedsURLs':
      addWatchedFeedsItem(elements.feedsListEl, value.at(-1));
      break;

    case 'aggregator.processFeedback':
      handleProcessFeedback(elements, value);
      break;

    default:
      break;
  }
};

const setStaticTexts = (elements, i18n) => {
  const {
    mainEl,
    formEl,
    submitEl,
    feedsEl,
    postsEl,
  } = elements;

  mainEl.querySelector('h1').textContent = i18n.t('mainHeader');
  mainEl.querySelector('.lead').textContent = i18n.t('subheader');
  formEl.querySelector('label[for="url-input"]').textContent = i18n.t('form.labelForUrlInput');
  document.querySelector('.url-example').textContent = i18n.t('form.example');
  submitEl.textContent = i18n.t('form.button');
  feedsEl.querySelector('h2').textContent = i18n.t('feeds');
  postsEl.querySelector('h2').textContent = i18n.t('posts');
};

const submitHandler = (watchedState, i18n) => (evt) => {
  evt.preventDefault();
  const { aggregator } = watchedState;

  const formData = new FormData(evt.target);
  const url = formData.get('url').trim();

  aggregator.processState = PROCESS_STATES.VALIDATING_INPUT;

  yupValidate({ url })
    .then((validationErrors) => {
      if (!isEmpty(validationErrors)) {
        const key = validationErrors.url?.message ?? 'unknownValidationError';
        aggregator.processFeedback = { failure: i18n.t(`feedback.${key}`) };
        return;
      }
      if (aggregator.feedsURLs.includes(url)) {
        aggregator.processFeedback = { failure: i18n.t('feedback.alreadyExists') };
        return;
      }
      aggregator.processState = PROCESS_STATES.LOADING_FEED;
      aggregator.feedsURLs.push(url);
      aggregator.processFeedback = { success: i18n.t('feedback.loadSuccess') };
    })
    .then(() => {
      aggregator.processState = PROCESS_STATES.WAITING_FOR_INPUT;
    })
    .catch((error) => {
      throw error;
    });
};

const initView = (state, i18n) => {
  const elements = {
    mainEl: document.querySelector('main'),
    formEl: document.querySelector('.rss-form'),
    inputEl: document.getElementById('url-input'),
    submitEl: document.querySelector('#submit'),
    feedbackEl: document.querySelector('.feedback'),
    feedsEl: document.querySelector('.feeds'),
    feedsListEl: document.querySelector('.feeds ul'),
    postsEl: document.querySelector('.posts'),
    postsListEl: document.querySelector('.posts ul'),
  };

  const watchedState = onChange(state, renderView(elements));

  const { formEl } = elements;

  setStaticTexts(elements, i18n);
  copyTextOnClick();
  formEl.addEventListener('submit', submitHandler(watchedState, i18n));
};

export default initView;
