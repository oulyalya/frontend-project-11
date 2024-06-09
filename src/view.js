import onChange from 'on-change';
import { isEmpty } from 'lodash';

import PROCESS_STATES from './consts.js';
import validate from './formValidation/validate.js';
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

const initView = (state, elements) => {
  const watchedState = onChange(state, renderView(elements));

  const { formEl } = elements;
  const { aggregator } = watchedState;

  formEl.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const formData = new FormData(evt.target);
    const url = formData.get('url').trim();

    aggregator.processState = PROCESS_STATES.VALIDATING_INPUT;

    validate({ url })
      .then((validationErrors) => {
        if (!isEmpty(validationErrors)) {
          aggregator.processFeedback = { failure: 'Ссылка должна быть валидным URL' };
          return;
        }
        if (aggregator.feedsURLs.includes(url)) {
          aggregator.processFeedback = { failure: 'RSS уже существует' };
          return;
        }
        aggregator.processState = PROCESS_STATES.LOADING_FEED;
        aggregator.feedsURLs.push(url);
        aggregator.processFeedback = { success: 'RSS успешно загружен' };
      })
      .then(() => {
        aggregator.processState = PROCESS_STATES.WAITING_FOR_INPUT;
      })
      .catch((error) => {
        throw error;
      });
  });

  console.log('view');
  console.log(validate, state, elements, watchedState);

  copyTextOnClick();
};

export default initView;
