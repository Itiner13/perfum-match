import { surveyData } from './surveyData.js';

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const surveyContainer = document.getElementById('survey-container');
const resultsContainer = document.getElementById('results-container');
const recommendationDisplay = document.getElementById('recommendation-display');
const restartButton = document.getElementById('restart-button');

let currentQuestionIndex = 0;
let userAnswers = []; // Stores the selected weights object for each question
let totalWeights = {};

const perfumeFamilies = ["시트러스", "그린", "플로럴", "우디", "머스크", "앰버", "워터리", "스파이시", "레더", "프루티"];

function initializeTotalWeights() {
  perfumeFamilies.forEach(family => {
    totalWeights[family] = 0;
  });
}

function initializeSurvey() {
  currentQuestionIndex = 0;
  userAnswers = new Array(surveyData.length).fill(null); // Initialize with null for each question
  initializeTotalWeights();

  surveyContainer.style.display = 'block';
  resultsContainer.style.display = 'none';
  renderQuestion();
}

function renderQuestion() {
  const currentQuestion = surveyData[currentQuestionIndex];
  questionText.textContent = currentQuestion.question;

  optionsContainer.innerHTML = ''; // Clear previous options

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.classList.add('option-button');
    button.textContent = option.text;
    button.addEventListener('click', () => handleOptionClick(option.weights, index));

    // Highlight if this option was previously selected
    if (userAnswers[currentQuestionIndex] && JSON.stringify(userAnswers[currentQuestionIndex].weights) === JSON.stringify(option.weights)) {
      button.classList.add('selected');
    }
    optionsContainer.appendChild(button);
  });

  updateNavigationButtons();
}

function handleOptionClick(weights, optionIndex) {
  userAnswers[currentQuestionIndex] = { weights: weights, optionIndex: optionIndex }; // Store both weights and option index
  // Re-render the current question to update the selected state
  renderQuestion();
}

function updateNavigationButtons() {
  prevButton.disabled = currentQuestionIndex === 0;
  nextButton.textContent = currentQuestionIndex === surveyData.length - 1 ? '결과 보기' : '다음';
}

function handleNextButton() {
  if (userAnswers[currentQuestionIndex] === null) {
    alert('답변을 선택해주세요!');
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
  userAnswers.forEach(answer => {
    if (answer && answer.weights) {
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

  recommendationDisplay.textContent = `가장 적합한 향조: ${recommendedFamily}\n\n모든 향조 가중치:\n${JSON.stringify(totalWeights, null, 2)}`;
  
  surveyContainer.style.display = 'none';
  resultsContainer.style.display = 'block';
}

// Event Listeners
nextButton.addEventListener('click', handleNextButton);
prevButton.addEventListener('click', handlePrevButton);
restartButton.addEventListener('click', initializeSurvey);

// Initialize the survey when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeSurvey);
