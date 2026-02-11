import { surveyData } from './surveyData.js';

let currentQuestionIndex = 0;
let userAnswers = []; // Stores the selected weights object (for select) or string (for text) for each question
let totalWeights = {};

const perfumeFamilies = ["시트러스", "그린", "플로럴", "우디", "머스크", "앰버", "워터리", "스파이시", "레더", "프루티"];

let landingPageContainer;
let startSurveyButton;
let questionText;
let optionsContainer;
let prevButton;
let nextButton;
let surveyContainer;
let resultsContainer;
let recommendationDisplay;
let restartButton;

function initializeTotalWeights() {
  perfumeFamilies.forEach(family => {
    totalWeights[family] = 0;
  });
}

function initializeSurvey() {
  console.log('initializeSurvey called'); // Debug log
  currentQuestionIndex = 0;
  userAnswers = new Array(surveyData.length).fill(null); // Initialize with null for each question
  initializeTotalWeights();

  surveyContainer.style.display = 'block';
  resultsContainer.style.display = 'none';
  renderQuestion();
}

function renderQuestion() {
  console.log('renderQuestion called. Current index:', currentQuestionIndex); // Debug log
  const currentQuestion = surveyData[currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = ''; // Clear previous options

  if (currentQuestion.type === 'text') {
    console.log('Current Question Type: text'); // Debug log
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = currentQuestion.placeholder || '여기에 입력하세요';
    input.classList.add('text-input');
    // Pre-populate if answer exists
    if (userAnswers[currentQuestionIndex] !== null) {
      input.value = userAnswers[currentQuestionIndex];
    }
    input.addEventListener('input', (event) => handleTextInput(event.target.value));
    optionsContainer.appendChild(input);
  } else { // type === 'select'
    console.log('Current Question Type: select'); // Debug log
    currentQuestion.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.classList.add('option-button');
      button.textContent = option.text;
      button.addEventListener('click', () => handleSelectOptionClick(option.weights, index));

      // Highlight if this option was previously selected
      if (userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex].optionIndex === index) {
        button.classList.add('selected');
      }
      optionsContainer.appendChild(button);
    });
  }

  console.log('Options container HTML after render:', optionsContainer.innerHTML); // Debug log
  updateNavigationButtons();
}

function handleSelectOptionClick(weights, optionIndex) {
  userAnswers[currentQuestionIndex] = { weights: weights, optionIndex: optionIndex }; // Store both weights and option index
  renderQuestion(); // Re-render to update selected state and navigation
}

function handleTextInput(value) {
  userAnswers[currentQuestionIndex] = value;
  updateNavigationButtons(); // Update navigation buttons based on input
}

function updateNavigationButtons() {
  prevButton.disabled = currentQuestionIndex === 0;

  const currentQuestion = surveyData[currentQuestionIndex];
  let isAnswered = false;

  if (currentQuestion.type === 'text') {
    isAnswered = userAnswers[currentQuestionIndex] !== null && userAnswers[currentQuestionIndex].trim() !== '';
  } else { // type === 'select'
    isAnswered = userAnswers[currentQuestionIndex] !== null;
  }

  nextButton.disabled = !isAnswered;
  nextButton.textContent = currentQuestionIndex === surveyData.length - 1 ? '결과 보기' : '다음';
}

function handleNextButton() {
  const currentQuestion = surveyData[currentQuestionIndex];
  let isAnswered = false;

  if (currentQuestion.type === 'text') {
    isAnswered = userAnswers[currentQuestionIndex] !== null && userAnswers[currentQuestionIndex].trim() !== '';
  } else { // type === 'select'
    isAnswered = userAnswers[currentQuestionIndex] !== null;
  }

  if (!isAnswered) {
    // alert('답변을 선택하거나 입력해주세요!'); // Removed as per user request
    return;
  }

  if (currentQuestionIndex < surveyData.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    showResults();
  }
}

function handlePrevButton() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
}

function calculateTotalWeights() {
  initializeTotalWeights(); // Reset before recalculating
  userAnswers.forEach((answer, index) => {
    const question = surveyData[index];
    if (question.type === 'select' && answer && answer.weights) {
      for (const family in answer.weights) {
        if (totalWeights.hasOwnProperty(family)) {
          totalWeights[family] += answer.weights[family];
        }
      }
    }
  });
}

function showResults() {
  calculateTotalWeights();

  let maxWeight = -Infinity;
  let recommendedFamily = '';

  for (const family in totalWeights) {
    if (totalWeights[family] > maxWeight) {
      maxWeight = totalWeights[family];
      recommendedFamily = family;
    }
  }

  // Display user's name if collected
  const userName = surveyData[0].type === 'text' && userAnswers[0] ? userAnswers[0] + '님께, ' : '';

  recommendationDisplay.textContent = `${userName}가장 적합한 향조: ${recommendedFamily}\n\n모든 향조 가중치:\n${JSON.stringify(totalWeights, null, 2)}`;
  
  surveyContainer.style.display = 'none';
  resultsContainer.style.display = 'block';
}

// Initialize the display and event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  landingPageContainer = document.getElementById('landing-page-container');
  startSurveyButton = document.getElementById('start-survey-button');
  questionText = document.getElementById('question-text');
  optionsContainer = document.getElementById('options-container');
  prevButton = document.getElementById('prev-button');
  nextButton = document.getElementById('next-button');
  surveyContainer = document.getElementById('survey-container');
  resultsContainer = document.getElementById('results-container');
  recommendationDisplay = document.getElementById('recommendation-display');
  restartButton = document.getElementById('restart-button');

  // Event Listeners
  nextButton.addEventListener('click', handleNextButton);
  prevButton.addEventListener('click', handlePrevButton);
  restartButton.addEventListener('click', initializeSurvey);

  startSurveyButton.addEventListener('click', () => {
    console.log('startSurveyButton clicked'); // Debug log
    landingPageContainer.style.display = 'none';
    initializeSurvey();
  });

  landingPageContainer.style.display = 'block';
  resultsContainer.style.display = 'none';
});
